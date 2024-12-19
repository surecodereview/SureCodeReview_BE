const fs = require('fs').promises;
const path = require('path');
const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const PROMPT_FILE_PATH = path.join(__dirname, '..', 'code', 'prompt.txt'); // 프롬프트 파일 경로

const reviewCode = async (changes) => {
    try {
        const promptContent = await fs.readFile(PROMPT_FILE_PATH, 'utf-8');
        const combinedPrompt = promptContent.replace("{{code_diff}}", changes);

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: "You are a professional code reviewer, software engineer, and an expert in analyzing git diff outputs and C programming.\n\nYour task is to:\n- Provide a detailed and structured review of the provided git diff.\n- Identify issues, suggest improvements, and highlight good practices.\n- Clearly explain your review points in Korean for better understanding.\n- Maintain a professional and constructive tone in your responses.\n- Use Markdown for formatting, including code blocks, where necessary."
                },
                {
                    role: 'user',
                    content: combinedPrompt
                }
            ],
        });

        const greetingMsg = "안녕하세요! 슈어코드리뷰봇 입니다.\n\n";
        console.log(response.choices[0].message.content);
        return greetingMsg + response.data.choices[0].message.content;
    } catch (error) {
        console.error('Error in reviewCode:', error);
        throw error;
    }
};

module.exports = {
    reviewCode
};
