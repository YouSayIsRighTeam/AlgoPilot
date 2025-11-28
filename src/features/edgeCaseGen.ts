import * as vscode from 'vscode';
import { LLMService } from '../services/llmService';

export class EdgeCaseFeature implements vscode.CodeLensProvider {
    private llmService: LLMService;
    private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;

    constructor(llmService: LLMService) {
        this.llmService = llmService;
    }

    public activate(context: vscode.ExtensionContext) {
        // Register CodeLens Provider
        context.subscriptions.push(
            vscode.languages.registerCodeLensProvider(
                [
                    { scheme: 'file', language: 'typescript' },
                    { scheme: 'file', language: 'javascript' },
                    { scheme: 'file', language: 'python' },
                    { scheme: 'file', language: 'cpp' },
                    { scheme: 'file', language: 'c' },
                    { scheme: 'file', language: 'java' },
                    { scheme: 'file', language: 'go' },
                    { scheme: 'file', language: 'rust' }
                ],
                this
            )
        );

        // Register Command
        context.subscriptions.push(
            vscode.commands.registerCommand('algopilot.generateEdgeCases', async (document: vscode.TextDocument, range: vscode.Range) => {
                await this.generateEdgeCases(document, range);
            })
        );
    }

    public provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
        const codeLenses: vscode.CodeLens[] = [];
        // Match function definitions. Note: Escaping parenthesis \( is crucial.
        const regex = /function\s+\w+|class\s+\w+|const\s+\w+\s*=\s*\(|let\s+\w+\s*=\s*\(|def\s+\w+|int\s+\w+\(|void\s+\w+\(|bool\s+\w+\(|string\s+\w+\(/g;
        const text = document.getText();
        let matches;
        while ((matches = regex.exec(text)) !== null) {
            const line = document.lineAt(document.positionAt(matches.index).line);
            const range = new vscode.Range(line.lineNumber, 0, line.lineNumber, line.text.length);
            const command: vscode.Command = {
                title: "⚡ Generate Edge Cases",
                command: "algopilot.generateEdgeCases",
                arguments: [document, range]
            };
            codeLenses.push(new vscode.CodeLens(range, command));
        }
        return codeLenses;
    }

    private async generateEdgeCases(document: vscode.TextDocument, range: vscode.Range) {
        // 1. Extract the function code (Heuristic: take next 20 lines or until next function)
        // A better way is to rely on indentation or simple block matching, but for MVP let's grab a chunk.
        // We'll read from the start line until we see an empty line or end of file, max 50 lines.
        const startLine = range.start.line;
        let endLine = Math.min(document.lineCount - 1, startLine + 50);
        
        // Simple heuristic to find end of function: look for next function definition or end of indentation
        // For now, let's just send a chunk of code. LLM is smart enough to ignore trailing garbage.
        const codeChunk = document.getText(new vscode.Range(startLine, 0, endLine, 0));

        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "AlgoPilot: Generating Edge Cases...",
            cancellable: false
        }, async (progress) => {
            const cases = await this.llmService.generateEdgeCases(codeChunk);

            if (cases.length > 0) {
                const commentBlock = this.formatCasesAsComment(document.languageId, cases);
                
                const editor = vscode.window.activeTextEditor;
                if (editor && editor.document === document) {
                    editor.edit(editBuilder => {
                        // Insert before the function
                        editBuilder.insert(new vscode.Position(startLine, 0), commentBlock + "\n");
                    });
                }
            }
        });
    }

    private formatCasesAsComment(languageId: string, cases: string[]): string {
        const isPython = languageId === 'python';
        const commentStart = isPython ? '"""' : '/**';
        const commentEnd = isPython ? '"""' : ' */';
        const linePrefix = isPython ? '' : ' * ';

        let content = `${commentStart}\n${linePrefix}[AlgoPilot] Generated Edge Cases:\n`;
        cases.forEach(c => {
            content += `${linePrefix}- ${c}\n`;
        });
        content += commentEnd;
        return content;
    }
}
