const fs = require('fs').promises;
const path = require('path');
const ollama = require('ollama').default; // .default 추가

const PROMPT_FILE_PATH = path.join(__dirname, '..', 'code', 'prompt.txt');

const reviewCode = async (changes) => {
    try {
        console.log('Starting reviewCode function');
        const promptContent = await fs.readFile(PROMPT_FILE_PATH, 'utf-8');
        const combined_prompt = promptContent.replace("{{code_diff}}", changes);
        console.log('Combined prompt created:', combined_prompt);

        // Ollama API를 사용하여 모델에 요청
        const response = await ollama.chat({
            model: 'llama3.1', // 사용할 모델 이름
            messages: [{ role: 'user', content: combined_prompt }],
        });

        // 응답 처리
        console.log('Received response from Llama:', response.message.content);
        return response.message.content; // Llama의 응답 반환
    } catch (error) {
        console.error('Error in reviewCode:', error);
        throw error;
    }
}

module.exports = {
    reviewCode
};
