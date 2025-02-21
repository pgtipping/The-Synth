import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { checkRateLimit } from '@/lib/rate-limit';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export const runtime = 'edge';

const SYSTEM_PROMPT = `You are the Creator agent for The Synth blog platform, an expert content writer specializing in tech and professional growth topics. Your role is to generate high-quality, engaging blog content that follows our style guide:

VOICE & TONE:
- Authoritative yet approachable
- Progressive and innovative
- Solution-oriented
- Evidence-based and practical

CONTENT STRUCTURE:
1. Strong, engaging introduction
2. Clear section headings
3. Practical examples and case studies
4. Actionable takeaways
5. Compelling conclusion

QUALITY REQUIREMENTS:
- Original and unique perspectives
- Well-researched with data support
- Clear and concise writing
- Proper citation of sources
- SEO-optimized content
- Engaging storytelling

Focus on our core categories:
- Innovation & Tech
- Professional Growth
- Learning Lab
- Productivity & Tools
- Industry Insights
- Community Corner

Always maintain:
- Technical accuracy
- Current industry standards
- Practical implementation steps
- Reader engagement
- Educational value

FORMAT REQUIREMENTS:
- Use markdown formatting
- Use ## for main sections
- Use ### for subsections
- Use * for bullet points
- Include [links](url) for citations
- Keep paragraphs concise (3-4 sentences)
- Use code blocks with language specification`;

// Helper to format text chunks for streaming
function formatChunk(text: string): string {
  // Remove excessive newlines
  text = text.replace(/\n{3,}/g, '\n\n');
  // Ensure proper markdown list formatting
  text = text.replace(/(?<=\n)[-*]\s/g, '* ');
  // Ensure proper heading formatting
  text = text.replace(/(?<=\n)#(?!#)\s/g, '## ');
  text = text.replace(/(?<=\n)#{2}(?!#)\s/g, '## ');
  text = text.replace(/(?<=\n)#{3}\s/g, '### ');
  return text;
}

export async function POST(req: Request) {
  try {
    // Rate limiting check
    const identifier = req.headers.get('x-forwarded-for') || 'anonymous';
    const { success } = await checkRateLimit(identifier, 'generate');

    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const { prompt, context, outline } = await req.json();

    if (!prompt?.trim()) {
      return NextResponse.json(
        { error: 'Writing prompt is required' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      stream: true,
      temperature: 0.7,
      max_tokens: 4000,
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: `
Writing Task: ${prompt}
Additional Context: ${context || 'None provided'}
Content Outline: ${outline ? JSON.stringify(outline) : 'None provided'}

Please generate a high-quality blog post following our content structure and quality requirements.
Use proper markdown formatting and maintain consistent heading hierarchy.
`,
        },
      ],
    });

    // Convert the response to a ReadableStream with formatting
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let buffer = '';
          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              buffer += content;

              // Process buffer when we have a complete sentence, section, or markdown block
              if (buffer.match(/[.!?]\s|^\s*[-*]\s|^\s*#{1,6}\s|```/m)) {
                const formattedText = formatChunk(buffer);
                controller.enqueue(new TextEncoder().encode(formattedText));
                buffer = '';
              }
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
    console.error('AI Creator Error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: `Failed to generate content: ${errorMessage}` },
      { status: 500 }
    );
  }
}
