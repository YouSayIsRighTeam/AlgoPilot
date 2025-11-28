import * as vscode from 'vscode';
import { LLMService } from '../services/llmService';

function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number): (...args: Parameters<F>) => void {
    let timeout: NodeJS.Timeout | null = null;
    return (...args: Parameters<F>): void => {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => func(...args), waitFor);
    };
}

export class AutoReviewFeature {
    private diagnosticCollection: vscode.DiagnosticCollection;
    private llmService: LLMService;
    private debouncedAnalyzeDocument: (document: vscode.TextDocument) => void;

    constructor(llmService: LLMService) {
        this.llmService = llmService;
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('algopilot');
        // Debounce the analyzeDocument function for 1 second
        this.debouncedAnalyzeDocument = debounce(this.analyzeDocument.bind(this), 1000);
    }

    public activate(context: vscode.ExtensionContext) {
        // Trigger on save with debounce
        context.subscriptions.push(
            vscode.workspace.onDidSaveTextDocument(document => {
                this.debouncedAnalyzeDocument(document);
            })
        );

        // Also trigger when opening a document (no debounce needed here)
        if (vscode.window.activeTextEditor) {
            this.analyzeDocument(vscode.window.activeTextEditor.document);
        }

        context.subscriptions.push(
            vscode.window.onDidChangeActiveTextEditor(editor => {
                if (editor) {
                    this.analyzeDocument(editor.document);
                }
            })
        );
    }

    private async analyzeDocument(document: vscode.TextDocument) {
        const supportedLanguages = ['typescript', 'javascript', 'python', 'cpp', 'c', 'java', 'go', 'rust'];
        if (!supportedLanguages.includes(document.languageId)) {
            return;
        }

        console.log(`[AlgoPilot] Analyzing document: ${document.fileName} (${document.languageId})`); // Debug message

        const issues = await this.llmService.analyzeCode(document.getText());
        const diagnostics: vscode.Diagnostic[] = [];

        for (const issue of issues) {
            // Ensure line number is valid, VS Code is 0-indexed
            const line = Math.max(0, issue.line);
            const range = new vscode.Range(line, 0, line, document.lineAt(line).text.length); 
            
            const severity = issue.severity === 'error' ? vscode.DiagnosticSeverity.Error
                          : issue.severity === 'warning' ? vscode.DiagnosticSeverity.Warning
                          : issue.severity === 'info' ? vscode.DiagnosticSeverity.Information
                          : vscode.DiagnosticSeverity.Information; // Default to info
            
            const diagnostic = new vscode.Diagnostic(range, issue.message, severity);
            diagnostic.source = 'AlgoPilot AI';
            diagnostics.push(diagnostic);
        }

        this.diagnosticCollection.set(document.uri, diagnostics);
    }
}
