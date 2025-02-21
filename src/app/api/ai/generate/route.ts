import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';
import { NextResponse } from 'next/server';

// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    // Extract the content from the request
    const { content, context } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Ask OpenAI for a streaming completion
    const response = await openai.chat.completions.create({
      model: 'gpt-4-0125-preview',
      stream: true,
      messages: [
        {
          role: 'system',
          content:
            "You are a helpful writing assistant. Help improve and generate content while maintaining the author's voice and style.",
        },
        {
          role: 'user',
          content: `Content: ${content}\nContext: ${context}`,
        },
      ],
    });

    // Convert the response into a friendly text-stream
    const stream = OpenAIStream(response as any);

    // Return a StreamingTextResponse, which will stream the response
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error('AI Generation Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}
