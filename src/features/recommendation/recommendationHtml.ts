export function getWebviewContent(cspSource: string): string {
    return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LeetCode 推薦</title>
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
            padding: 16px;
            margin: 0;
            overflow-x: hidden;
            box-sizing: border-box;
        }

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

        .input-section {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-bottom: 20px;
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
            min-height: 100px;
            font-family: inherit;
            box-sizing: border-box;
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

        button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .btn-secondary {
            background-color: var(--button-secondary-bg);
            color: var(--button-secondary-fg);
        }
        .btn-secondary:hover {
            background-color: var(--button-secondary-hover);
        }

        .btn-small {
            padding: 4px 10px;
            font-size: 0.8rem;
        }

        .recommendations {
            display: flex;
            flex-direction: column;
            gap: 12px;
            animation: fadeIn 0.3s ease;
        }

        .problem-card {
            background: var(--vscode-list-hoverBackground);
            border-left: 3px solid var(--vscode-list-inactiveSelectionBackground);
            padding: 12px;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .problem-card:hover {
            background: var(--vscode-list-activeSelectionBackground);
            border-left-color: var(--primary-color);
        }

        .problem-header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: 8px;
        }

        .problem-title {
            font-weight: 600;
            color: var(--text-color);
            margin: 0;
            flex: 1;
        }

        .problem-difficulty {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 3px;
            font-size: 0.75rem;
            font-weight: 600;
            margin-left: 8px;
            white-space: nowrap;
        }

        .difficulty-easy {
            background-color: rgba(78, 201, 176, 0.2);
            color: #4ec9b0;
        }

        .difficulty-medium {
            background-color: rgba(255, 184, 108, 0.2);
            color: #ffb86c;
        }

        .difficulty-hard {
            background-color: rgba(255, 118, 117, 0.2);
            color: #ff7675;
        }

        .problem-description {
            font-size: 0.9rem;
            color: var(--text-color);
            opacity: 0.8;
            margin: 8px 0;
            line-height: 1.6;
        }

        .code-section {
            margin-top: 12px;
            padding-top: 12px;
            border-top: 1px solid var(--vscode-panel-border);
        }

        .language-selector {
            display: flex;
            gap: 6px;
            margin-bottom: 10px;
            flex-wrap: wrap;
        }

        .lang-button {
            background: var(--button-secondary-bg);
            color: var(--button-secondary-fg);
            border: 1px solid var(--vscode-panel-border);
            padding: 4px 10px;
            border-radius: 3px;
            cursor: pointer;
            font-size: 0.8rem;
            transition: all 0.2s;
        }

        .lang-button.active {
            background: var(--primary-color);
            color: white;
            border-color: var(--primary-color);
        }

        .lang-button:hover {
            opacity: 0.9;
        }

        .code-block {
            background: var(--vscode-editor-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 4px;
            padding: 12px;
            overflow-x: auto;
            font-family: 'Courier New', monospace;
            font-size: 0.85rem;
            line-height: 1.5;
            color: var(--text-color);
            max-height: 400px;
            overflow-y: auto;
        }

        .code-textarea {
            width: 100%;
            background: var(--vscode-editor-background);
            color: var(--text-color);
            border: 1px solid var(--vscode-input-border);
            padding: 12px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 0.85rem;
            line-height: 1.5;
            resize: vertical;
            min-height: 300px;
            box-sizing: border-box;
        }

        .code-textarea:focus {
            outline: 1px solid var(--primary-color);
        }

        .auth-section {
            margin-top: 16px;
            padding: 12px;
            background: var(--vscode-sideBar-background);
            border-radius: 4px;
            border: 1px solid var(--vscode-panel-border);
        }

        .auth-section h4 {
            margin: 0 0 12px 0;
            font-size: 0.9rem;
            color: var(--text-color);
        }

        .auth-input-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-bottom: 12px;
        }

        .auth-input-group label {
            font-size: 0.85rem;
            color: var(--text-color);
            opacity: 0.9;
        }

        .auth-input {
            width: 100%;
            background: var(--input-bg);
            color: var(--text-color);
            border: 1px solid var(--input-border);
            padding: 6px 8px;
            border-radius: 3px;
            font-size: 0.85rem;
            box-sizing: border-box;
        }

        .auth-input:focus {
            outline: 1px solid var(--primary-color);
        }

        .submit-button {
            background: var(--success-color);
            color: white;
            width: 100%;
            padding: 8px;
            font-weight: 600;
        }

        .submit-button:hover {
            opacity: 0.9;
        }

        .problem-tags {
            gap: 6px;
            flex-wrap: wrap;
            margin-bottom: 10px;
        }

        .tag {
            background: rgba(127, 127, 127, 0.2);
            color: var(--text-color);
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 0.8rem;
            opacity: 0.7;
        }

        .problem-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 8px;
            border-top: 1px solid var(--vscode-panel-border);
            margin-top: 8px;
        }

        .problem-stats {
            font-size: 0.8rem;
            opacity: 0.6;
        }

        .problem-button {
            padding: 4px 10px;
            background-color: var(--primary-color);
            color: white;
            border: none;
            border-radius: 3px;
            font-size: 0.8rem;
            cursor: pointer;
            transition: opacity 0.2s;
        }

        .problem-button:hover {
            opacity: 0.9;
        }

        .loading {
            text-align: center;
            padding: 40px 16px;
            animation: fadeIn 0.3s ease;
        }

        .spinner {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 2px solid var(--vscode-panel-border);
            border-top-color: var(--primary-color);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin-bottom: 12px;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        .error {
            background: var(--vscode-textBlockQuote-background);
            border-left: 4px solid #ff7675;
            padding: 12px;
            border-radius: 4px;
            margin-bottom: 16px;
            color: #ff7675;
            animation: fadeIn 0.3s ease;
        }

        .empty-state {
            text-align: center;
            padding: 40px 16px;
            color: var(--text-color);
            opacity: 0.6;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎯 LeetCode Recommendations</h1>
        <p>Analyze your preferences and find suitable practice problems</p>
    </div>
    
    <div class="auth-section" style="margin-bottom: 20px; border-left: 4px solid var(--primary-color);">
        <h4>AI Recommendation</h4>
        <div style="display: flex; flex-direction: column; gap: 10px;">
            <label style="font-size: 0.85rem; color: var(--text-color); opacity: 0.9;">What kind of problems are you looking for?</label>
            <textarea id="recommendationInput" class="code-textarea" style="min-height: 80px;" 
                placeholder="e.g. I want to practice Dynamic Programming around medium difficulty..."></textarea>
            <button id="analyzeBtn">Analyze & Recommend</button>
        </div>
    </div>

    <div class="auth-section" style="margin-bottom: 20px;">
        <h4>🔐 LeetCode Authentication (Fill once)</h4>
        <div style="display: flex; gap: 10px; align-items: flex-end;">
            <div style="flex: 1;">
                <div class="auth-input-group">
                    <label>LEETCODE_SESSION:</label>
                    <input type="text" class="auth-input" id="globalSession" 
                           placeholder="Paste your LEETCODE_SESSION cookie here">
                </div>
                <div class="auth-input-group" style="margin-bottom: 0;">
                    <label>csrftoken:</label>
                    <input type="text" class="auth-input" id="globalCsrf" 
                           placeholder="Paste your csrftoken cookie here">
                </div>
            </div>
        </div>
    </div>
    
    <div style="margin-top: 20px; border-top: 1px solid var(--vscode-panel-border); padding-top: 10px; margin-bottom: 20px;">
        <h4 style="margin: 0 0 10px 0;">Recommendations</h4>
        <div id="resultContainer"></div>
    </div>
    
    <div class="input-section" id="input-section-anchor">
        <div style="display: flex; gap: 10px; margin-bottom: 8px;">
             <div style="flex: 1;">
                <label style="font-size: 0.85rem; color: var(--text-color); opacity: 0.9;">Problem ID / Slug:</label>
                <input type="text" class="auth-input" id="manualProblemId" placeholder="e.g. 1 or two-sum">
            </div>
            <div style="flex: 1;">
                <label style="font-size: 0.85rem; color: var(--text-color); opacity: 0.9;">Language:</label>
                <select class="auth-input" id="manualLang">
                    <option value="python3">python3</option>
                    <option value="cpp">cpp</option>
                    <option value="java">java</option>
                    <option value="javascript">javascript</option>
                    <option value="typescript">typescript</option>
                </select>
            </div>
        </div>
        <textarea id="manualCodeInput" class="code-textarea" placeholder="// Paste your solution code here..."></textarea>
         <button id="manualSubmitBtn" class="submit-button" style="margin-top: 10px;">
            Submit to LeetCode 🚀
        </button>
    </div>
    
    <div id="submissionResult"></div>

    <!-- Hidden original inputs to maintain compatibility if script relies on them, or we update script -->
    <div style="display:none">
        <textarea id="codeInput"></textarea>
    </div>
    


        <script>
            const vscode = acquireVsCodeApi();

            const analyzeBtn = document.getElementById('analyzeBtn');
            const recommendationInput = document.getElementById('recommendationInput');
            const resultContainer = document.getElementById('resultContainer');
            const submissionResult = document.getElementById('submissionResult');

            analyzeBtn.addEventListener('click', () => {
                const code = recommendationInput.value.trim();
                if (!code) {
                     resultContainer.innerHTML = '<div class="error">Please describe what you want to practice</div>';
                     return;
                }

                analyzeBtn.disabled = true;
                resultContainer.innerHTML = '<div class="loading"><div class="spinner"></div><p>Analyzing...</p></div>';

                vscode.postMessage({
                    type: 'analyzeCode',
                    code: code
                });
            });

            // 接收來自後端的訊息
            window.addEventListener('message', (event) => {
                const message = event.data;
                analyzeBtn.disabled = false;

                switch (message.type) {
                    case 'recommendationsReady':
                        displayRecommendations(message.data);
                        break;
                    case 'submissionResult':
                         handleSubmissionResult(message);
                        break;
                    case 'error':
                        resultContainer.innerHTML = \`<div class="error">\${message.message}</div>\`;
                        break;
                }
            });

            function handleSubmissionResult(message) {
                 const manualSubmitBtn = document.getElementById('manualSubmitBtn');
                 if (manualSubmitBtn) {
                     manualSubmitBtn.disabled = false;
                     manualSubmitBtn.textContent = 'Submit to LeetCode 🚀';
                 }

                if (!message.success) {
                    submissionResult.innerHTML = \`<div class="error">Submission Failed: \${message.error}</div>\`;
                    return;
                }

                let status = 'Unknown';
                let runtime = 'N/A';
                let memory = 'N/A';
                let errorDetails = '';
                
                // Handle different API response structures
                if (message.data.result) {
                    // Structure for Runtime Error, etc.
                    const res = message.data.result;
                    status = res.status_msg;
                    runtime = res.status_runtime || 'N/A';
                    memory = res.status_memory || 'N/A';
                    
                    if (res.full_runtime_error) {
                        errorDetails = res.full_runtime_error;
                    } else if (res.runtime_error) {
                        errorDetails = res.runtime_error;
                    } else if (res.full_compile_error) {
                        errorDetails = res.full_compile_error;
                    } else if (res.compile_error) {
                         errorDetails = res.compile_error;
                    }
                } else if (message.data.leetcode_status) {
                    // Structure for Accepted (sometimes)
                    status = message.data.leetcode_status;
                    runtime = message.data.runtime || 'N/A';
                    memory = message.data.memory || 'N/A';
                } else if (message.data.status_msg) {
                     // Fallback check
                     status = message.data.status_msg;
                }

                const statusColor = status === 'Accepted' ? 'var(--success-color)' : '#ff7675';

                let html = \`
                    <div class="problem-card" style="border-left-color: \${statusColor}; margin-top: 10px; margin-bottom: 20px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <h3 style="margin: 0; color: \${statusColor};">\${status}</h3>
                            <span style="font-size: 0.85rem; opacity: 0.8;">\${new Date().toLocaleTimeString()}</span>
                        </div>
                        <div style="margin-top: 12px; display: flex; gap: 20px;">
                            <div>
                                <div style="font-size: 0.8rem; opacity: 0.7;">Runtime</div>
                                <div style="font-weight: 600;">\${runtime}</div>
                            </div>
                            <div>
                                <div style="font-size: 0.8rem; opacity: 0.7;">Memory</div>
                                <div style="font-weight: 600;">\${memory}</div>
                            </div>
                        </div>
                \`;

                if (errorDetails) {
                    html += \`
                        <div style="margin-top: 12px; background: rgba(255, 0, 0, 0.1); padding: 8px; border-radius: 4px; overflow-x: auto;">
                            <pre style="margin: 0; font-size: 0.8rem; color: #ff7675; white-space: pre-wrap;">\${escapeHtml(errorDetails)}</pre>
                        </div>
                    \`;
                }

                html += \`</div>\`;
                submissionResult.innerHTML = html;
                
                // Scroll to result
                submissionResult.scrollIntoView({ behavior: 'smooth' });
            }

            let currentProblems = [];
            let currentlySelectedProblem = null;

            // Language change listener
            const manualLangSelect = document.getElementById('manualLang');
            if (manualLangSelect) {
                manualLangSelect.addEventListener('change', () => {
                   if (currentlySelectedProblem) {
                       const selectedLang = manualLangSelect.value;
                       const snippets = currentlySelectedProblem.codeSnippets || [];
                       
                       const snippet = snippets.find(s => s.langSlug === selectedLang) || 
                                       snippets.find(s => s.lang === 'python3') || 
                                       snippets[0];
                                       
                        if (snippet) {
                            document.getElementById('manualCodeInput').value = snippet.code;
                        }
                   } 
                });
            }

            function displayRecommendations(problems) {
                currentProblems = problems || []; // Store globally
                currentlySelectedProblem = null; // Reset selection
                
                if (!problems || problems.length === 0) {
                    resultContainer.innerHTML = '<div class="empty-state">No recommendations found</div>';
                    return;
                }

                let html = '<div class="recommendations">';
                
                problems.forEach((problem, index) => {
                    html += \`
                        <div class="problem-card">
                            <div style="display: flex; justify-content: space-between; align-items: start;">
                                <div style="flex: 1;">
                                    <div class="problem-title" onclick="openLeetCode('\${problem.slug}')">
                                        \${index + 1}. \${problem.title}
                                    </div>
                                    <span class="problem-difficulty difficulty-\${problem.difficulty.toLowerCase()}">
                                        \${problem.difficulty}
                                    </span>
                                </div>
                                <button class="problem-button" onclick='selectProblem(\${index})'>
                                    Select & Solve
                                </button>
                            </div>
                            <div class="problem-description" id="desc-\${index}">\${problem.description}</div>
                            <div class="problem-tags">
                                \${problem.tags.map(tag => \`<span class="tag">\${tag}</span>\`).join('')}
                            </div>
                        </div>
                    \`;
                });

                html += '</div>';
                resultContainer.innerHTML = html;
            }
            
            function selectProblem(index) {
                const problem = currentProblems[index];
                if (!problem) return;
                
                currentlySelectedProblem = problem;

                const slug = problem.slug;
                const snippets = problem.codeSnippets || [];

                document.getElementById('manualProblemId').value = slug;
                
                const langSelect = document.getElementById('manualLang');
                const selectedLang = langSelect.value; // keep current or default
                
                // Find snippet for selected lang or default to first
                let snippet = snippets.find(s => s.langSlug === selectedLang) || 
                              snippets.find(s => s.lang === 'python3') || 
                              snippets[0];
                              
                if (snippet) {
                     document.getElementById('manualCodeInput').value = snippet.code;
                } else {
                     document.getElementById('manualCodeInput').value = '';
                }
                
                // Switch language dropdown to match if possible (Optional but nice)
                // Actually user said "when changing language... change code", so we respect current dropdown choice
                // unless we want to force match the snippet we found? 
                // The snippet lookup uses the dropdown value, so we are good.
                
                // Scroll to result (manual submission area)
                document.getElementById('input-section-anchor').scrollIntoView({ behavior: 'smooth' });
                
                // Highlight effect
                document.getElementById('manualCodeInput').focus();
            }

            

            function toggleDescription(index) {
                const descElement = document.getElementById(\`desc-\${index}\`);
                const button = event.target;
                
                descElement.classList.toggle('expanded');
                
                if (descElement.classList.contains('expanded')) {
                    button.textContent = 'Close ▲';
                } else {
                    button.textContent = 'Expand more ▼';
                }
            }

            function switchLanguage(problemIndex, snippetIndex) {
                // 隱藏所有代碼塊
                const selector = document.getElementById(\`lang-selector-\${problemIndex}\`);
                const allButtons = selector.querySelectorAll('.lang-button');
                allButtons.forEach(btn => btn.classList.remove('active'));
                
                // 顯示選中的代碼塊
                const allCodeAreas = document.querySelectorAll(\`[id^="code-block-\${problemIndex}-"]\`);
                allCodeAreas.forEach(area => area.style.display = 'none');
                
                // 激活選中的按鈕和代碼塊
                event.target.classList.add('active');
                document.getElementById(\`code-block-\${problemIndex}-\${snippetIndex}\`).style.display = 'block';
            }

            function escapeHtml(text) {
                const map = {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#039;'
                };
                return text.replace(/[&<>"']/g, m => map[m]);
            }

            const manualSubmitBtn = document.getElementById('manualSubmitBtn');

            if (manualSubmitBtn) {
                manualSubmitBtn.addEventListener('click', () => {
                    const session = document.getElementById('globalSession').value.trim();
                    const csrf = document.getElementById('globalCsrf').value.trim();
                    const slug = document.getElementById('manualProblemId').value.trim();
                    const code = document.getElementById('manualCodeInput').value;
                    const lang = document.getElementById('manualLang').value;

                    if (!session || !csrf) {
                        vscode.postMessage({
                            type: 'error',
                            message: 'Please fill in LEETCODE_SESSION and csrftoken first'
                        });
                        return;
                    }

                    if (!slug || !code) {
                         vscode.postMessage({
                            type: 'error',
                            message: 'Please fill in Problem ID/Slug and Code'
                        });
                        return;
                    }

                    manualSubmitBtn.disabled = true;
                    manualSubmitBtn.textContent = 'Submitting...';

                    vscode.postMessage({
                        type: 'submitToLeetCode',
                        data: {
                            slug: slug,
                            code: code,
                            lang: lang,
                            leetcode_session: session,
                            csrf_token: csrf
                        }
                    });

                     // Reset button after 3 seconds (or handle via message back)
                    setTimeout(() => {
                        manualSubmitBtn.disabled = false;
                        manualSubmitBtn.textContent = 'Submit to LeetCode 🚀';
                    }, 3000);
                });
            }

            function submitCode(problemIndex, slug, questionId) {
                // 獲取全域認證資訊
                const session = document.getElementById('globalSession').value.trim();
                const csrf = document.getElementById('globalCsrf').value.trim();
                
                if (!session || !csrf) {
                    vscode.postMessage({
                            type: 'error',
                            message: 'Please fill in LEETCODE_SESSION and csrftoken at the top first'
                        });
                    return;
                }
                
                // 獲取當前選中的語言和代碼
                const selector = document.getElementById(\`lang-selector-\${problemIndex}\`);
                const activeButton = selector.querySelector('.lang-button.active');
                const activeIndex = Array.from(selector.querySelectorAll('.lang-button')).indexOf(activeButton);
                
                const codeTextarea = document.getElementById(\`code-block-\${problemIndex}-\${activeIndex}\`);
                const code = codeTextarea.value;
                
                // 發送到後端
                vscode.postMessage({
                    type: 'submitToLeetCode',
                    data: {
                        slug: slug,
                        questionId: questionId,
                        code: code,
                        lang: activeButton.textContent,
                        leetcode_session: session,
                        csrf_token: csrf
                    }
                });
            }
        </script>
    </body>
    </html>
    `;
}
