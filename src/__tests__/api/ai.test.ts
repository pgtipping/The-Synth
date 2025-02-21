import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as researchHandler } from '@/app/api/ai/research/route';
import { POST as generateHandler } from '@/app/api/ai/generate/route';

// Mock environment variables
vi.mock('@/env.mjs', () => ({
  env: {
    OPENAI_API_KEY: 'test-key',
  },
}));

// Mock OpenAI
vi.mock('openai', () => ({
  default: class MockOpenAI {
    constructor() {
      return {
        chat: {
          completions: {
            create: vi.fn().mockResolvedValue({
              choices: [
                {
                  message: {
                    content: 'Mocked response content',
                  },
                },
              ],
            }),
          },
        },
      };
    }
  },
}));

// Mock AI SDK
vi.mock('ai', () => ({
  OpenAIStream: vi.fn().mockImplementation(() => new ReadableStream()),
  StreamingTextResponse: vi
    .fn()
    .mockImplementation((stream) => new Response(stream)),
}));

describe('AI API Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Research API', () => {
    it('should return 400 if topic is missing', async () => {
      const request = new Request('http://localhost:3000/api/ai/research', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await researchHandler(request);
      expect(response.status).toBe(400);
    });

    it('should handle research request successfully', async () => {
      const request = new Request('http://localhost:3000/api/ai/research', {
        method: 'POST',
        body: JSON.stringify({
          topic: 'Test Topic',
          context: 'Test Context',
        }),
      });

      const response = await researchHandler(request);
      expect(response.status).toBe(200);
    });
  });

  describe('Generate API', () => {
    it('should return 400 if required fields are missing', async () => {
      const request = new Request('http://localhost:3000/api/ai/generate', {
        method: 'POST',
        body: JSON.stringify({
          topic: 'Test Topic',
          // Missing research field
        }),
      });

      const response = await generateHandler(request);
      expect(response.status).toBe(400);
    });

    it('should handle content generation request successfully', async () => {
      const request = new Request('http://localhost:3000/api/ai/generate', {
        method: 'POST',
        body: JSON.stringify({
          topic: 'Test Topic',
          research: 'Test Research',
          tone: 'professional',
          style: 'blog',
        }),
      });

      const response = await generateHandler(request);
      expect(response.status).toBe(200);
    });
  });
});
