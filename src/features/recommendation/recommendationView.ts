import * as vscode from 'vscode';
import { LLMService } from '../../services/llmService';
import { getWebviewContent } from './recommendationHtml';
import fetch from 'cross-fetch';


export interface Problem {
  id: string;
  title: string;
  title_slug: string;
  difficulty: string;
  tags: string[];
  content_html: string;
  content_text: string;
  code_snippets: {
    lang: string;
    langSlug: string;
    code: string;
  }[];
  similar_questions?: {
    title: string;
    titleSlug: string;
    difficulty: string;
  }[];
}

const BASE_URL = 'https://amd.coltengroup.org/api/v1';

export async function getProblemById(id: string | number): Promise<Problem> {
  try {
    const response = await fetch(`${BASE_URL}/problems/id/${id}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API 請求失敗: ${response.status}`);
    }

    return await response.json();

  } catch (error) {
    console.error('getProblemById Error:', error);
    throw error;
  }
}
export interface SubmissionPayload {
  slug: string;
  lang: string;
  code: string;
  leetcode_session: string;
  csrf_token: string;
}

export async function submitProblemToLeetcode(payload: SubmissionPayload) {
  try {
    const response = await fetch(`${BASE_URL}/submission/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`API 請求失敗: ${response.status}`);
    }

    return await response.json();

  } catch (error) {
    console.error('submitProblemToLeetcode Error:', error);
    throw error;
  }
}







export class RecommendationViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'algopilot.recommendationView';
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

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case 'analyzeCode':
          await this.handleAnalyzeCode(data.code);
          break;

        case 'recommend':
          await this.handleAnalyzeCode(1);
          break;

        case 'submitToLeetCode':
          await this.submitToLeetCode(data);
          break;

      }
    });
  }


  private async submitToLeetCode(message: any) {
    if (!this._view) { return; }

    try {
      const { data } = message;
      const payload: SubmissionPayload = {
        slug: data.slug,
        lang: data.lang,
        code: data.code,
        leetcode_session: data.leetcode_session,
        csrf_token: data.csrf_token
      };

      const result = await submitProblemToLeetcode(payload);

      this._view.webview.postMessage({
        type: 'submissionResult',
        success: true,
        data: result
      });

      vscode.window.showInformationMessage('LeetCode 提交成功！');

    } catch (error) {
      this._view.webview.postMessage({
        type: 'submissionResult',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      vscode.window.showErrorMessage(`LeetCode 提交失敗: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }



  private async handleAnalyzeCode(input: any) {
    if (!this._view) { return; }

    try {
      let problemsData: Problem[] = [];

      if (typeof input === 'string' && input.trim().length > 0) {
        // User input -> Ask LLM for recommendations
        const recommendedIds = await this.llmService.getProblemRecommendations(input);
        
        // Fetch details for each recommended ID
        const problemPromises = recommendedIds.map(async (id) => {
            try {
                return await getProblemById(id);
            } catch (e) {
                console.error(`Failed to fetch problem ${id}`, e);
                return null;
            }
        });
        
        const results = await Promise.all(problemPromises);
        problemsData = results.filter((p): p is Problem => p !== null);

      } else {
         // Fallback or specific ID requested
         const id = typeof input === 'number' ? input : 1;
         try {
             const problem = await getProblemById(id);
             problemsData = [problem];
         } catch (e) {
             console.error(`Failed to fetch problem ${id}`, e);
         }
      }

      const displayProblems = problemsData.map(problem => ({
        slug: problem.title_slug || (problem as any).titleSlug || problem.title.toLowerCase().replace(/\s+/g, '-'),
        title: problem.title,
        difficulty: problem.difficulty,
        description: problem.content_text,
        tags: problem.tags,
        codeSnippets: problem.code_snippets,
      }));

      this._view.webview.postMessage({
        type: 'recommendationsReady',
        data: displayProblems
      });
    } catch (error) {
      this._view.webview.postMessage({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

}
