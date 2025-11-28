import axios from 'axios';
import * as vscode from 'vscode'; // Still need vscode for logging potentially

export interface CodeIssue {
    line: number;
    message: string;
    severity: 'error' | 'warning' | 'info';
}

export class LLMService {
    private apiUrl: string = 'https://amd.coltengroup.org/api/v1/llm/generate';
    // private apiKey: string; // Removed, as it's no longer needed

    constructor() { // Constructor no longer accepts apiKey
        // this.apiKey = apiKey; // Removed
    }

    private async callExternalLLM(prompt: string, max_tokens: number = 2000, temperature: number = 0.8): Promise<string> {
        try {
            const config = vscode.workspace.getConfiguration('algopilot');
            const apiKey = config.get<string>('llm.apiKey');

            if (!apiKey) {
                vscode.window.showErrorMessage('AlgoPilot: LLM API Key is not set. Please configure it in VS Code Settings.');
                throw new Error('LLM API Key is not set.');
            }

            const headers: { [key: string]: string } = {
                'accept': 'application/json',
                'Content-Type': 'application/json',
                'X-API-Key': apiKey
            };

            const data = {
                prompt: prompt,
                max_tokens: max_tokens,
                temperature: temperature
            };
            
            console.log(prompt);

            const response = await axios.post(this.apiUrl, data, { headers });

            console.log(response.data);
                        
            // Assuming the API response structure is like: { "generated_text": "..." } or similar.
            if (response.data && typeof response.data === 'object' && response.data.generated_text) {
                return response.data.generated_text;
            } else if (typeof response.data === 'string') {
                return response.data; // Assume plain text response
            } else {
                console.warn("[AlgoPilot] Unexpected LLM API response structure:", response.data);
                return JSON.stringify(response.data);
            }

        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 401 && error.response?.data?.detail === "Invalid API Key") {
                    vscode.window.showErrorMessage('AlgoPilot: Invalid LLM API Key. Please check your settings.');
                    throw new Error('LLM API Error: Invalid API Key');
                }
                console.error("AlgoPilot: External LLM API Request Failed", error.message, error.response?.data);
                throw new Error(`LLM API Error: ${error.response?.status} - ${JSON.stringify(error.response?.data)}`);
            } else {
                console.error("AlgoPilot: External LLM API Request Failed", error);
                throw new Error(`LLM API Error: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
    }

    /**
     * Recommends LeetCode problems based on user input.
     */
    async getProblemRecommendations(userInput: string): Promise<string[]> {
        if (!userInput || userInput.trim() === '') {
            return [];
        }

        const systemPrompt = `You are an expert Algorithm Coach.
The user wants to practice specific LeetCode problems.
Based on their request, recommend 3-5 relevant LeetCode problems.

Output ONLY a JSON array of strings, where each string is the LeetCode Question ID (number).
Example output:
["1", "15", "200"]`;

        const fullPrompt = `${systemPrompt}\n\nUser Request: ${userInput}`;

        try {
            const text = await this.callExternalLLM(fullPrompt);
            const cleanContent = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const recommendations: string[] = JSON.parse(cleanContent);
            
            if (Array.isArray(recommendations)) {
                return recommendations.map(String);
            }
            return [];
        } catch (parseError) {
            console.error("AlgoPilot: Failed to parse LLM JSON response in getProblemRecommendations:", parseError);
            return [];
        }
    }

    /**
     * Calls the external LLM API to analyze the code.
     */
    async analyzeCode(code: string): Promise<CodeIssue[]> {
        if (!code || code.trim() === '') {
            return [];
        }

        const systemPrompt = `You are an expert Algorithm Coach. Find bugs and performance issues.

    Check for:
    1. Time Complexity: Loops/recursion causing TLE
    2. Data Type Safety: Integer overflows
    3. Corner Cases: Edge case handling
    4. Memory Safety: Leaks or bounds violations
    5. Optimization: Suggest mathematical formulas for known patterns (e.g., sum 1 to 100 instead of a loop).

    Output: JSON array of {line, message, severity} only. Empty array if no issues.`;

        const fullPrompt = `${systemPrompt}\n\nReview this code:\n${code}`;

        try {
            const text = await this.callExternalLLM(fullPrompt);

            // The external API might not have native JSON mode like Gemini.
            // We need to parse the response as if it's text and extract JSON.
            const cleanContent = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const issues: CodeIssue[] = JSON.parse(cleanContent);
            
            if (Array.isArray(issues)) {
                return issues.map(issue => ({
                    line: typeof issue.line === 'number' ? issue.line : 0,
                    message: issue.message || "Unknown issue",
                    severity: ['error', 'warning', 'info'].includes(issue.severity) ? issue.severity : 'info'
                }));
            }
            return [];

        } catch (parseError) {
            console.error("AlgoPilot: Failed to parse LLM JSON response in analyzeCode:", parseError);
            return [];
        }
    }

    /**
     * Generates edge cases for a given function code.
     */
    async generateEdgeCases(code: string): Promise<string[]> {
        if (!code || code.trim() === '') {
            return [];
        }

        const systemPrompt = `You are an expert Software Tester specializing in Algorithm Competitions.
Your goal is to generate "Edge Cases" and "Corner Cases" that would break the provided function.
Focus on:
1. Empty inputs (empty arrays, empty strings, null/undefined).
2. Boundary values (0, 1, -1, INT_MAX, INT_MIN).
3. Large inputs (for stress testing).
4. Special patterns (sorted, reverse sorted, duplicates).

Output ONLY a JSON array of strings, where each string is a description or a raw input representation of a test case.
Example output:
[
  "Input: [], Expected: 0",
  "Input: [INT_MAX, 1], Expected: Overflow",
  "Input: n=0"
]`;
        const fullPrompt = `${systemPrompt}\n\nGenerate edge cases for this function:\n${code}`;

        try {
            const text = await this.callExternalLLM(fullPrompt);
            const cleanContent = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const cases: string[] = JSON.parse(cleanContent);
            
            if (Array.isArray(cases)) {
                return cases.map(c => String(c));
            }
            return [];
        } catch (parseError) {
            console.error("AlgoPilot: Failed to parse LLM JSON response in generateEdgeCases:", parseError);
            return ["Error generating cases. Please try again."];
        }
    }

    /**
     * Analyzes a crash report containing stack trace and variable state.
     */
    async analyzeCrash(errorMessage: string, stackTrace: string, variables: string, codeContext: string): Promise<string> {
        const systemPrompt = `You are an expert Debugger. 
The user's code has crashed. You are provided with:
1. The Error Message
2. The Stack Trace
3. Current Variable Values
4. Relevant Code Snippet

Your task:
1. Explain WHY the crash happened (Root Cause Analysis).
2. Generate a MINIMAL Input/Test Case that reproduces this crash.

Output format:
## 💥 Crash Analysis
<Explanation>

## 🧪 Reproducible Test Case
<Code block or input description>
`;
        const fullPrompt = `${systemPrompt}\n\nError: ${errorMessage}\n\nStack Trace:\n${stackTrace}\n\nVariables:\n${variables}\n\nCode Context:\n${codeContext}`;
        
        try {
            return await this.callExternalLLM(fullPrompt);
        } catch (error) {
            console.error("AlgoPilot: Failed to analyze crash", error);
            return "Unable to analyze crash due to an API error.";
        }
    }

    /**
     * Decomposes a user goal into a step-by-step lesson plan.
     */
    async createLessonPlan(goal: string): Promise<{ title: string; steps: string[] }> {
        const systemPrompt = `You are an expert Coding Tutor.
The user wants to build a specific feature or algorithm.
Your task:
1. Break down the goal into 3-5 small, manageable implementation steps.
2. Provide a short title for the lesson.

Output JSON format:
{
  "title": "Lesson Title",
  "steps": ["Step 1 description", "Step 2 description", ...]
}`;
        const fullPrompt = `${systemPrompt}\n\nUser Goal: ${goal}`;

        try {
            const text = await this.callExternalLLM(fullPrompt);
            const cleanContent = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanContent);
        } catch (parseError) {
            console.error("AlgoPilot: Lesson Plan failed to parse JSON:", parseError);
            return { title: "Error", steps: ["Could not generate plan."] };
        }
    }

    /**
     * Provides a hint or explanation for a specific step.
     */
    async getStepHint(step: string, contextCode: string): Promise<string> {
        const prompt = `You are a Coding Tutor. The user is working on this step: "${step}".
Current Code Context:
${contextCode.substring(0, 1000)}...

Provide a helpful, educational hint. 
- Do NOT give the full solution immediately. 
- Explain the concept.
- Provide a small code snippet pattern if needed.
- Keep it concise (under 100 words).
- Use Markdown.`;

        try {
            return await this.callExternalLLM(prompt);
        } catch (error) {
            console.error("AlgoPilot: Failed to get step hint", error);
            return "Unable to fetch hint.";
        }
    }

    /**
     * Generates a technical summary of the completed session.
     */
    async summarizeSession(goal: string, steps: string[], finalCode: string): Promise<string> {
        const prompt = `You are a Tech Lead. The user has just completed a coding session.
Goal: "${goal}"
Steps Taken:
${steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Final Code:
${finalCode.substring(0, 2000)}...

Please provide a concise technical summary (in Markdown):
1. **Key Techniques/Algorithms Used**: Briefly explain the core logic.
2. **Strengths**: What was done well?
3. **Potential Improvements**: One or two quick tips for next time.

Keep the tone encouraging but professional.`;

        try {
            return await this.callExternalLLM(prompt);
        } catch (error) {
            console.error("AlgoPilot: Failed to summarize session", error);
            return "Unable to generate summary.";
        }
    }
}
