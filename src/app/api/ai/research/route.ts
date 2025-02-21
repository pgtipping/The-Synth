import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';
import { env } from '@/env.mjs';

// OpenAI configuration
const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export const runtime = 'edge';

export async function POST(req: Request) {
  const { topic, context } = await req.json();

  // Validate request
  if (!topic) {
    return new Response('Missing topic', { status: 400 });
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a research assistant helping to gather relevant information for blog writing. 
          Focus on finding accurate, well-sourced information about the given topic.
          Provide information in a structured format that can be easily used in blog writing.`,
        },
        {
          role: 'user',
          content: `Research the following topic for a blog post: ${topic}\n\nAdditional context: ${context || 'None provided'}`,
        },
      ],
      temperature: 0.7,
      stream: true,
    });

    // Convert the response to a readable stream
    const stream = OpenAIStream(response);

    // Return the stream with the appropriate headers
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error('AI Research Error:', error);
    return new Response('Error processing request', { status: 500 });
  }
}
