import { env } from '@/env.mjs';

export interface ResearchRequest {
  topic: string;
  context?: string;
}

export interface ContentGenerationRequest {
  topic: string;
  research: string;
  tone?: string;
  style?: string;
}

export class AIService {
  private static instance: AIService;

  private constructor() {}

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async research(request: ResearchRequest): Promise<ReadableStream> {
    const response = await fetch('/api/ai/research', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Research request failed');
    }

    return response.body as ReadableStream;
  }

  async generateContent(
    request: ContentGenerationRequest
  ): Promise<ReadableStream> {
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Content generation failed');
    }

    return response.body as ReadableStream;
  }
}
