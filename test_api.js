// test_api.js
const axios = require('axios'); // Ensure axios is installed: npm install axios

const apiUrl = 'https://amd.coltengroup.org/api/v1/llm/generate';

async function testApi(prompt) {
    try {
        console.log(`Sending request to: ${apiUrl}`);
        console.log(`Prompt: "${prompt.substring(0, 100)}"...`);

        const headers = {
            'accept': 'application/json',
            'Content-Type': 'application/json'
        };

        const data = {
            prompt: prompt
        };

        const response = await axios.post(apiUrl, data, { headers });

        console.log('\n--- API Response Status ---');
        console.log(`Status: ${response.status}`);
        console.log(`Status Text: ${response.statusText}`);

        console.log('\n--- API Response Data (Raw) ---');
        console.log(response.data.generated_text);

    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('\n--- Axios Error ---');
            console.error(`Error Status: ${error.response ? error.response.status : 'N/A'}`);
            console.error(`Error Data: ${error.response ? JSON.stringify(error.response.data, null, 2) : 'N/A'}`);
            console.error(`Error Message: ${error.message}`);
        } else {
            console.error('\n--- General Error ---');
            console.error(error);
        }
    }
}

// --- Main execution ---
// 使用一個非常簡單的Prompt來測試基本功能
const simpleTestPrompt = "Hello, what is your name?"; 

testApi(simpleTestPrompt);