require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

console.log('Key shuru hoti hai isse:', process.env.GEMINI_API_KEY?.substring(0, 15));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test() {
  try {
const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
    const result = await model.generateContent('Say hello in one word');
    console.log('SUCCESS:', result.response.text());
  } catch (error) {
    console.log('ASLI ERROR YE HAI:');
    console.log(error.message);
  }
}

test();