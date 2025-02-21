import { useCallback, useState } from 'react';
import { useCompletion } from 'ai/react';
import {
  AIService,
  ResearchRequest,
  ContentGenerationRequest,
} from '@/lib/services/ai';

export interface UseAIOptions {
  endpoint?: string;
  onError?: (error: Error) => void;
  onFinish?: (content: string) => void;
  onStart?: () => void;
}

export function useAI({
  endpoint = '/api/ai/generate',
  onError,
  onFinish,
  onStart,
}: UseAIOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    completion,
    complete,
    error,
    stop,
    isLoading: isGenerating,
  } = useCompletion({
    api: endpoint,
    onError: (error: Error) => {
      setIsLoading(false);
      onError?.(error);
    },
    onFinish: (content: string) => {
      setIsLoading(false);
      onFinish?.(content);
    },
  });

  const generate = useCallback(
    async (content: string, context?: string) => {
      try {
        setIsLoading(true);
        onStart?.();
        await complete(JSON.stringify({ content, context }));
      } catch (error) {
        console.error('AI Generation Error:', error);
        onError?.(error as Error);
      }
    },
    [complete, onError, onStart]
  );

  return {
    content: completion,
    generate,
    error,
    stop,
    isLoading: isLoading || isGenerating,
  };
}
