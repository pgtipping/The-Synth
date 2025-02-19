import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize AI clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const gemini = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

export async function POST(request: Request) {
  try {
    const { operation, content, context } = await request.json();

    if (!process.env.OPENAI_API_KEY || !process.env.GOOGLE_AI_API_KEY) {
      return NextResponse.json(
        { error: 'API keys not configured' },
        { status: 500 }
      );
    }

    let result;
    if (operation === 'research') {
      // Use GPT-4 for research
      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content:
              'You are a research assistant. Provide detailed, factual information with sources.',
          },
          {
            role: 'user',
            content: `Research: ${content}\nContext: ${context}`,
          },
        ],
        response_format: { type: 'json_object' },
      });

      result = JSON.parse(response.choices[0].message.content || '{}');
    } else if (operation === 'factCheck') {
      // Use Gemini for fact checking
      const model = gemini.getGenerativeModel({ model: 'gemini-pro' });
      const response = await model.generateContent(`
        Fact check this content and provide sources:
        ${content}
        
        Context: ${context}
      `);

      result = {
        content: response.response.text(),
        timestamp: new Date().toISOString(),
      };
    } else {
      return NextResponse.json({ error: 'Invalid operation' }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('AI API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
