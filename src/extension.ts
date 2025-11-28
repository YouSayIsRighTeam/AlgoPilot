import * as vscode from 'vscode';
import * as path from 'path'; // Path is still needed for other purposes, like resolving webview local resources if they were used. For now, it's not hurting.
import { AutoReviewFeature } from './features/autoReview';
import { EdgeCaseFeature } from './features/edgeCaseGen';
import { DebugHelperFeature } from './features/debugHelper';
import { TutorViewProvider } from './features/tutor/tutorView';
import { RecommendationViewProvider } from './features/recommendation/recommendationView';
import { LLMService } from './services/llmService';

export function activate(context: vscode.ExtensionContext) {
    console.log('AlgoPilot is now active!');

    // 1. Initialize Services (No API Key needed for LLMService now)
    const llmService = new LLMService(); // Call without apiKey

    // 2. Initialize Features
    const autoReview = new AutoReviewFeature(llmService);
    autoReview.activate(context);

    const edgeCaseGen = new EdgeCaseFeature(llmService);
    edgeCaseGen.activate(context);

    const debugHelper = new DebugHelperFeature(llmService);
    debugHelper.activate(context);

    // 3. Register Tutor View
    const tutorProvider = new TutorViewProvider(llmService);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(TutorViewProvider.viewType, tutorProvider)
    );

    // 3.5 Register Recommendation View
    const recommendationProvider = new RecommendationViewProvider(llmService);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(RecommendationViewProvider.viewType, recommendationProvider)
    );

    // 4. Register Commands (Manual Trigger)
    let disposable = vscode.commands.registerCommand('algopilot.analyzeCode', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            vscode.window.showInformationMessage('AlgoPilot: Analyzing current file...');
            // In a real scenario, you might call public methods on AutoReviewFeature to force an update
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}