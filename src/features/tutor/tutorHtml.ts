export function getWebviewContent(cspSource: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AlgoPilot Tutor</title>
    <style>
        :root {
            --primary-color: #3794ff;
            --success-color: #4ec9b0;
            --bg-color: var(--vscode-editor-background);
            --text-color: var(--vscode-editor-foreground);
            --card-bg: var(--vscode-sideBar-background);
            --input-bg: var(--vscode-input-background);
            --input-border: var(--vscode-input-border);
            --button-secondary-bg: var(--vscode-button-secondaryBackground);
            --button-secondary-fg: var(--vscode-button-secondaryForeground);
            --button-secondary-hover: var(--vscode-button-secondaryHoverBackground);
        }

        body {
            font-family: var(--vscode-font-family);
            background-color: var(--bg-color);
            color: var(--text-color);
            padding: 16px; /* Already has 16px padding on all sides */
            margin: 0;
            overflow-x: hidden;
            box-sizing: border-box; /* Ensure padding doesn't add to element's total width/height */
        }

        /* Ensure main content containers respect body padding */
        #screen-input, #screen-loading, #screen-plan {
            box-sizing: border-box;
            width: 100%; /* Take full width of its parent (body, which has padding) */
            padding-right: 0; /* Override any inherited padding-right if needed */
        }


        /* --- Header --- */
        .header {
            text-align: center;
            margin-bottom: 24px;
            animation: fadeIn 0.5s ease;
        }
        
        .header h1 {
            font-size: 1.5rem;
            margin: 0;
            background: linear-gradient(90deg, #3794ff, #4ec9b0);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-weight: 800;
        }
        
        .header p {
            opacity: 0.7;
            font-size: 0.9rem;
            margin-top: 4px;
        }

        /* --- Input Screen --- */
        #screen-input {
            display: flex;
            flex-direction: column;
            gap: 12px;
            animation: fadeIn 0.3s ease;
        }

        textarea {
            width: 100%;
            background: var(--input-bg);
            border: 1px solid var(--input-border);
            color: var(--text-color);
            padding: 8px;
            border-radius: 6px;
            resize: vertical;
            min-height: 80px;
            font-family: inherit;
            box-sizing: border-box; /* Crucial for width: 100% + padding to work as expected */
        }
        
        textarea:focus {
            outline: 1px solid var(--primary-color);
        }

        button {
            background-color: var(--primary-color);
            color: white;
            border: none;
            padding: 10px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 600;
            transition: transform 0.1s, opacity 0.2s;
        }

        button:hover {
            opacity: 0.9;
        }

        button:active {
            transform: scale(0.98);
        }

        /* Secondary Button (for Back / Hint) */
        .btn-secondary {
            background-color: var(--button-secondary-bg);
            color: var(--button-secondary-fg);
        }
        .btn-secondary:hover {
            background-color: var(--button-secondary-hover);
        }

        /* --- Plan Screen --- */
        #screen-plan {
            animation: fadeIn 0.3s ease;
        }

        .plan-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
            padding-bottom: 8px;
            border-bottom: 1px solid var(--vscode-panel-border);
        }

        .plan-header h3 {
            margin: 0;
            font-size: 1.1rem;
            max-width: 70%;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .btn-small {
            padding: 4px 10px;
            font-size: 0.8rem;
        }

        .step-card {
            background: var(--vscode-list-hoverBackground);
            border-left: 3px solid var(--vscode-list-inactiveSelectionBackground);
            padding: 12px;
            margin-bottom: 8px;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .step-card:hover {
            background: var(--vscode-list-activeSelectionBackground);
            border-left-color: var(--primary-color);
        }

        .step-card.active {
            border-left-color: var(--success-color);
            background: var(--vscode-list-activeSelectionBackground);
            font-weight: bold;
        }

        .step-card.done {
            text-decoration: line-through;
            opacity: 0.6;
            border-left-color: transparent;
        }
        
        /* --- Learning Screen (Active Step) --- */
        #active-step-container {
            margin-top: 20px;
            border-top: 1px solid var(--vscode-panel-border);
            padding-top: 16px;
            animation: slideUp 0.3s ease;
        }

        .hint-box {
            background: var(--vscode-textBlockQuote-background);
            border-left: 4px solid var(--primary-color);
            padding: 12px;
            margin-top: 12px;
            border-radius: 4px;
            font-size: 0.9rem;
            line-height: 1.5;
            white-space: pre-wrap;
        }

        .hint-box code {
            background: rgba(127, 127, 127, 0.2);
            padding: 2px 4px;
            border-radius: 3px;
            font-family: var(--vscode-editor-font-family);
        }
        
        .hint-box pre {
            background: rgba(0, 0, 0, 0.2);
            padding: 8px;
            border-radius: 4px;
            overflow-x: auto;
        }

        /* --- Utilities --- */
        .hidden { display: none !important; }
        
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        .loader {
            border: 3px solid var(--bg-color);
            border-top: 3px solid var(--primary-color);
            border-radius: 50%;
            width: 20px;
            height: 20px;
            animation: spin 1s linear infinite;
            margin: 0 auto;
        }

        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

    </style>
</head>
<body>

    <div class="header">
        <h1>AlgoPilot Tutor</h1>
        <p>Vibe Coding Experience</p>
    </div>

    <!-- 1. INPUT SCREEN -->
    <div id="screen-input">
        <label style="font-weight:600; margin-bottom:4px; display:block;">What do you want to build?</label>
        <textarea id="goal-input" placeholder="e.g., A Python script to scrape a website..."></textarea>
        <button id="btn-start" style="margin-top:8px;">Start Learning</button>
    </div>

    <!-- 2. LOADING -->
    <div id="screen-loading" class="hidden" style="text-align:center; margin-top:40px;">
        <div class="loader"></div>
        <p style="margin-top:10px; opacity: 0.8;">Decomposing task...</p>
    </div>

    <!-- 3. PLAN SCREEN -->
    <div id="screen-plan" class="hidden">
        
        <!-- New Header with Back Button -->
        <div class="plan-header">
            <h3 id="lesson-title">Lesson Title</h3>
            <button id="btn-back" class="btn-secondary btn-small">New Topic</button>
        </div>

        <div id="steps-list">
            <!-- Steps will be injected here -->
        </div>
        
        <!-- Active Step Detail -->
        <div id="active-step-container" class="hidden">
            <h4 id="current-step-title" style="margin:0 0 8px 0; color: var(--success-color);">Current Task</h4>
            <p id="current-step-desc" style="margin-bottom: 12px; line-height:1.4;"></p>
            
            <div style="display:flex; gap:8px;">
                <button id="btn-hint" class="btn-secondary" style="flex:1;">Get Hint</button>
                <button id="btn-done" style="flex:1;">Mark Done</button>
            </div>

            <div id="hint-area" class="hidden"></div>
        </div>
        
        <!-- Completion / Review Area -->
        <div id="completion-container" class="hidden" style="margin-top:20px; text-align:center;">
             <h3 style="color:var(--success-color);">🎉 All Steps Completed!</h3>
             <p>Great job vibe coding today.</p>
        </div>

        <!-- Buttons for End Session -->
        <div style="display:flex; flex-direction:column; gap:8px; margin-top:20px;">
            <button id="btn-review" class="hidden" style="width:100%; background:var(--success-color);">Code Review</button>
            <button id="btn-reset" class="hidden" style="width:100%; background:var(--vscode-errorForeground);">End Session</button>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        
        // --- Elements ---
        const screenInput = document.getElementById('screen-input');
        const screenLoading = document.getElementById('screen-loading');
        const screenPlan = document.getElementById('screen-plan');
        
        const goalInput = document.getElementById('goal-input');
        const btnStart = document.getElementById('btn-start');
        
        const btnBack = document.getElementById('btn-back'); // New Back Button
        const stepsList = document.getElementById('steps-list');
        const activeStepContainer = document.getElementById('active-step-container');
        const completionContainer = document.getElementById('completion-container');
        
        const currentStepDesc = document.getElementById('current-step-desc');
        const btnHint = document.getElementById('btn-hint');
        const btnDone = document.getElementById('btn-done');
        const hintArea = document.getElementById('hint-area');
        const btnReview = document.getElementById('btn-review');
        const btnReset = document.getElementById('btn-reset');

        let currentSteps = [];
        let activeIndex = 0;
        let currentGoal = '';
        
        // Save initial completion content to restore it on reset
        const initialCompletionHTML = completionContainer.innerHTML;

        // --- Event Listeners ---
        
        // 1. Start Learning
        btnStart.addEventListener('click', () => {
            const goal = goalInput.value.trim();
            if (!goal) return;
            
            currentGoal = goal;
            showLoading(true);
            vscode.postMessage({ type: 'createPlan', goal: goal });
        });

        // 2. Back / New Topic
        btnBack.addEventListener('click', () => {
            // Reset UI to input screen
            screenPlan.classList.add('hidden');
            screenInput.classList.remove('hidden');
            
            // Clear Data
            goalInput.value = '';
            stepsList.innerHTML = '';
            
            activeStepContainer.classList.add('hidden');
            completionContainer.classList.add('hidden'); // Ensure completion is hidden
            completionContainer.innerHTML = initialCompletionHTML; // Restore default success message
            
            hintArea.innerHTML = '';
            hintArea.classList.add('hidden');
            
            btnReset.classList.add('hidden');
            btnReview.classList.add('hidden');

            currentSteps = [];
            activeIndex = 0;
            currentGoal = '';
        });

        // 3. Get Hint
        btnHint.addEventListener('click', () => {
            hintArea.innerHTML = '<div class="loader" style="width:15px; height:15px; border-width:2px;"></div>';
            hintArea.classList.remove('hidden');
            vscode.postMessage({ type: 'getHint', step: currentSteps[activeIndex] });
        });

        // 4. Mark Done
        btnDone.addEventListener('click', () => {
            // Mark current as done visually
            const card = document.getElementById('step-card-' + activeIndex);
            if(card) {
                card.classList.remove('active');
                card.classList.add('done');
            }

            // Check if ALL are done
            const allCards = document.querySelectorAll('.step-card');
            let allDone = true;
            let nextIndex = -1;

            for(let i = 0; i < allCards.length; i++) {
                if (!allCards[i].classList.contains('done')) {
                    allDone = false;
                    // Find the first incomplete one AFTER the current one
                    if (nextIndex === -1 && i > activeIndex) {
                        nextIndex = i;
                    }
                }
            }
            
            // If we didn't find a next one after current, but not all are done, find the first incomplete one from start
            if (!allDone && nextIndex === -1) {
                 for(let i = 0; i < allCards.length; i++) {
                     if(!allCards[i].classList.contains('done')) {
                         nextIndex = i;
                         break;
                     }
                 }
            }

            if (allDone) {
                // All done
                activeStepContainer.classList.add('hidden'); // Hide steps details
                completionContainer.classList.remove('hidden'); // Show success message
                
                btnDone.classList.add('hidden'); 
                btnHint.classList.add('hidden'); 
                
                btnReset.classList.remove('hidden'); // Show End Session button
                btnReview.classList.remove('hidden'); // Show Review button
            } else if (nextIndex !== -1) {
                setActiveStep(nextIndex);
            }
        });

        // 5. Review Session
        btnReview.addEventListener('click', () => {
            completionContainer.innerHTML = '<div class="loader"></div><p style="text-align:center">Analyzing your session...</p>';
            vscode.postMessage({ type: 'codeReview', goal: currentGoal, steps: currentSteps });
        });

        // 6. End Session (Reset)
        btnReset.addEventListener('click', () => {
             // Simply trigger the back button logic
             btnBack.click();
        });

        // --- Message Handler ---
        window.addEventListener('message', event => {
            const message = event.data;
            
            switch (message.type) {
                case 'planCreated':
                    showLoading(false);
                    renderPlan(message.data);
                    break;
                case 'hintReceived':
                    hintArea.innerHTML = '<div class="hint-box">' + message.text + '</div>';
                    break;
                case 'reviewReceived':
                     // Show summary in the completion area
                    completionContainer.innerHTML = '<h3 style="text-align:center; color:var(--success-color);">Session Summary</h3>' + 
                        '<div class="hint-box" style="border-left-color: var(--success-color); margin-top:0;">' + message.text + '</div>' + 
                        '<p style="text-align:center; margin-top:10px; font-size:0.9rem;">Keep up the good work!</p>';
                    
                    // Hide review button so they don't click again, but keep End Session
                    btnReview.classList.add('hidden');
                    break;
            }
        });

        // --- Functions ---
        function showLoading(isLoading) {
            if (isLoading) {
                screenInput.classList.add('hidden');
                screenLoading.classList.remove('hidden');
            } else {
                screenLoading.classList.add('hidden');
            }
        }

        function renderPlan(data) {
            document.getElementById('lesson-title').innerText = data.title;
            currentSteps = data.steps;
            activeIndex = 0;
            
            stepsList.innerHTML = '';
            currentSteps.forEach((step, index) => {
                const div = document.createElement('div');
                div.id = 'step-card-' + index;
                div.className = 'step-card';
                div.innerText = (index + 1) + '. ' + step;
                div.onclick = () => {
                    // Allow clicking on any step to review or complete out of order
                    setActiveStep(index);
                };
                stepsList.appendChild(div);
            });

            screenPlan.classList.remove('hidden');
            
            // Ensure we start fresh
            completionContainer.classList.add('hidden');
            completionContainer.innerHTML = initialCompletionHTML;
            
            setActiveStep(0);
            
            btnReset.classList.add('hidden'); 
            btnReview.classList.add('hidden');
            
            btnDone.classList.remove('hidden'); // Ensure Mark Done is visible
            btnHint.classList.remove('hidden'); // Ensure Get Hint is visible
        }

        function setActiveStep(index) {
            activeIndex = index;
            
            // UI Update
            document.querySelectorAll('.step-card').forEach(el => el.classList.remove('active'));
            const card = document.getElementById('step-card-' + index);
            if(card) card.classList.add('active');

            activeStepContainer.classList.remove('hidden');
            completionContainer.classList.add('hidden'); // Ensure completion is hidden if we go back to a step

            currentStepDesc.innerText = currentSteps[index];
            
            // Reset Hint Area for new step
            hintArea.classList.add('hidden');
            hintArea.innerHTML = '';
            
            // Update Button Visibility based on step status
            if (card && card.classList.contains('done')) {
                btnDone.classList.add('hidden');
            } else {
                btnDone.classList.remove('hidden');
            }

            // Scroll to view
            if(card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

    </script>
</body>
</html>`;
}