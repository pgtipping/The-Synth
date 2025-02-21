import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

export const runtime = 'edge';

const SYSTEM_PROMPT = `You are the Provider agent for The Synth blog platform. Your role is to:
1. Fetch and process content from various sources using Google Search
2. Generate multiple related content pieces
3. Process reference materials
4. Extract key content and insights
5. Perform fact-checking

Focus on our core categories:
- Innovation & Tech
- Professional Growth
- Learning Lab
- Productivity & Tools
- Industry Insights
- Community Corner

Ensure all content is:
- Evidence-based and practical
- Forward-thinking and solution-oriented
- Authoritative yet approachable
- Progressive and innovative
- Focused on actionable insights

Format your responses with proper markdown:
- Use ## for main sections
- Use bullet points for lists
- Include source links in [text](url) format
- Separate sections with newlines
- Keep paragraphs concise`;

// Helper to format text chunks for streaming
function formatChunk(text: string): string {
  // Remove excessive newlines
  text = text.replace(/\n{3,}/g, '\n\n');
  // Ensure proper markdown list formatting
  text = text.replace(/(?<=\n)[-*]\s/g, '* ');
  // Ensure proper heading formatting
  text = text.replace(/(?<=\n)#(?!#)\s/g, '## ');
  return text;
}

export async function POST(req: Request) {
  try {
    // Rate limiting check
    const identifier = req.headers.get('x-forwarded-for') || 'anonymous';
    const { success } = await checkRateLimit(identifier, 'research');

    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const { query, context, materials } = await req.json();

    if (!query?.trim()) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    if (!process.env.GOOGLE_AI_API_KEY) {
      return NextResponse.json(
        { error: 'Google AI API key not configured' },
        { status: 500 }
      );
    }

    // Initialize Gemini Pro model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Create chat with safety settings
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: SYSTEM_PROMPT }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    });

    // Send the research query
    const result = await chat.sendMessageStream([
      {
        text: `
Research Query: ${query}
Additional Context: ${context || 'None provided'}
Reference Materials: ${materials ? JSON.stringify(materials) : 'None provided'}

Please provide:
## Key Findings and Insights
* Important discoveries
* Main takeaways
* Critical points

## Relevant Statistics and Data
* Key metrics
* Important numbers
* Trend data

## Expert Perspectives
* Industry leader views
* Expert opinions
* Professional insights

## Industry Trends
* Current developments
* Future predictions
* Market shifts

## Implementation Guidelines
* Practical steps
* Best practices
* Action items

## Sources and References
* [Source Name](URL)
* Additional references
`,
      },
    ]);

    // Convert the response to a ReadableStream with formatting
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let buffer = '';
          for await (const chunk of result.stream) {
            const text = chunk.text();
            buffer += text;

            // Process buffer when we have a complete sentence or section
            if (buffer.match(/[.!?]\s|^\s*[-*]\s|^\s*#{1,6}\s/m)) {
              const formattedText = formatChunk(buffer);
              controller.enqueue(new TextEncoder().encode(formattedText));
              buffer = '';
            }
          }
          // Flush any remaining content
          if (buffer) {
            const formattedText = formatChunk(buffer);
            controller.enqueue(new TextEncoder().encode(formattedText));
          }
          controller.close();
        } catch (error) {
          console.error('Stream processing error:', error);
          controller.error(error);
        }
      },
    });

    // Return the streaming response
    return new Response(stream);
  } catch (error) {
    console.error('AI Provider Error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: `Failed to process research request: ${errorMessage}` },
      { status: 500 }
    );
  }
}
