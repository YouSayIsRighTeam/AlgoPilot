import * as vscode from 'vscode';
import { LLMService } from '../../services/llmService';
import { getWebviewContent } from './tutorHtml';

export class TutorViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'algopilot.tutorView';
    private _view?: vscode.WebviewView;
    private llmService: LLMService;

    constructor(llmService: LLMService) {
        this.llmService = llmService;
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.file(__dirname)]
        };

        webviewView.webview.html = getWebviewContent(webviewView.webview.cspSource);

        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case 'createPlan':
                    await this.handleCreatePlan(data.goal);
                    break;
                case 'getHint':
                    await this.handleGetHint(data.step);
                    break;
                case 'codeReview':
                    await this.handleCodeReview(data.goal, data.steps);
                    break;
                case 'reset':
                    // Just log or clear internal state if needed
                    break;
            }
        });
    }

    private async handleCreatePlan(goal: string) {
        if (!this._view) { return; }
        
        const plan = await this.llmService.createLessonPlan(goal);
        this._view.webview.postMessage({ type: 'planCreated', data: plan });
    }

    private async handleCodeReview(goal: string, steps: string[]) {
        if (!this._view) { return; }

        const editor = vscode.window.activeTextEditor;
        const codeContext = editor ? editor.document.getText() : "";

        let summary = await this.llmService.summarizeSession(goal, steps, codeContext);

        // Simple Markdown to HTML conversion
        summary = summary.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
                         .replace(/`([^`]+)`/g, '<code>$1</code>')
                         .replace(/\n/g, '<br>')
                         .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        this._view.webview.postMessage({ type: 'reviewReceived', text: summary });
    }

    private async handleGetHint(step: string) {
        if (!this._view) { return; }

        const editor = vscode.window.activeTextEditor;
        const codeContext = editor ? editor.document.getText() : "";

        // Get hint from LLM
        let hint = await this.llmService.getStepHint(step, codeContext);
        
        // Simple Markdown to HTML conversion for safety (or just use <pre> for code)
        // For MVP, we'll replace backticks with <code> blocks
        hint = hint.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
                   .replace(/`([^`]+)`/g, '<code>$1</code>')
                   .replace(/\n/g, '<br>');

        this._view.webview.postMessage({ type: 'hintReceived', text: hint });
    }
}
