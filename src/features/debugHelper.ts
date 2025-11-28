import * as vscode from 'vscode';
import { LLMService } from '../services/llmService';

export class DebugHelperFeature implements vscode.DebugAdapterTrackerFactory {
    private llmService: LLMService;

    constructor(llmService: LLMService) {
        this.llmService = llmService;
    }

    public activate(context: vscode.ExtensionContext) {
        // Register the tracker for all debug types ('*')
        context.subscriptions.push(
            vscode.debug.registerDebugAdapterTrackerFactory('*', this)
        );
    }

    createDebugAdapterTracker(session: vscode.DebugSession): vscode.ProviderResult<vscode.DebugAdapterTracker> {
        return new CrashTracker(session, this.llmService);
    }
}

class CrashTracker implements vscode.DebugAdapterTracker {
    private session: vscode.DebugSession;
    private llmService: LLMService;

    constructor(session: vscode.DebugSession, llmService: LLMService) {
        this.session = session;
        this.llmService = llmService;
    }

    async onDidSendMessage(message: any) {
        // Listen for "stopped" events caused by "exception"
        if (message.type === 'event' && message.event === 'stopped' && message.body.reason === 'exception') {
            const threadId = message.body.threadId;
            const text = message.body.text || "Unknown Exception"; // Exception message

            console.log(`[AlgoPilot] Exception detected: ${text}`);

            await this.handleCrash(threadId, text);
        }
    }

    private async handleCrash(threadId: number, errorMessage: string) {
        try {
            // 1. Fetch Stack Trace
            // We use customRequest to communicate with the debug adapter via DAP
            const stackTraceResponse = await this.session.customRequest('stackTrace', { threadId: threadId, startFrame: 0, levels: 5 });
            
            if (!stackTraceResponse || !stackTraceResponse.stackFrames || stackTraceResponse.stackFrames.length === 0) {
                return;
            }

            const topFrame = stackTraceResponse.stackFrames[0];
            const sourceFile = topFrame.source ? topFrame.source.path : null;
            const line = topFrame.line;

            // Format Stack Trace string
            let stackTraceStr = "";
            for (const frame of stackTraceResponse.stackFrames) {
                stackTraceStr += `at ${frame.name} (${frame.source?.path}:${frame.line})\n`;
            }

            // 2. Fetch Code Context
            let codeContext = "";
            if (sourceFile) {
                try {
                    const doc = await vscode.workspace.openTextDocument(sourceFile);
                    // Get 10 lines around the crash
                    const startLine = Math.max(0, line - 5);
                    const endLine = Math.min(doc.lineCount - 1, line + 5);
                    codeContext = doc.getText(new vscode.Range(startLine, 0, endLine, 0));
                } catch (e) {
                    codeContext = "Could not read source file.";
                }
            }

            // 3. Fetch Variables (Simplified: just getting scopes for top frame)
            // Fetching variables recursively is complex. We'll just try to get local variables of the top frame.
            let variablesStr = "";
            try {
                const scopesResponse = await this.session.customRequest('scopes', { frameId: topFrame.id });
                if (scopesResponse && scopesResponse.scopes && scopesResponse.scopes.length > 0) {
                    const localScope = scopesResponse.scopes[0]; // Usually the first scope is "Local"
                    
                    const variablesResponse = await this.session.customRequest('variables', { variablesReference: localScope.variablesReference });
                    if (variablesResponse && variablesResponse.variables) {
                        variablesResponse.variables.forEach((v: any) => {
                            variablesStr += `${v.name} = ${v.value}\n`;
                        });
                    }
                }
            } catch (e) {
                variablesStr = "Could not fetch variables.";
            }

            // 4. Send to LLM
            vscode.window.showInformationMessage("AlgoPilot: Analyzing Crash...", "View Report").then(selection => {
                if (selection === "View Report") {
                    // Show output channel
                    // For now, let's stream to a new document or output channel.
                }
            });

            const analysis = await this.llmService.analyzeCrash(errorMessage, stackTraceStr, variablesStr, codeContext);

            // 5. Display Result
            // Create a new untitled Markdown file to show the report
            const doc = await vscode.workspace.openTextDocument({ 
                content: analysis, 
                language: 'markdown' 
            });
            await vscode.window.showTextDocument(doc, { viewColumn: vscode.ViewColumn.Beside });

        } catch (error) {
            console.error("[AlgoPilot] Error handling crash:", error);
        }
    }
}
