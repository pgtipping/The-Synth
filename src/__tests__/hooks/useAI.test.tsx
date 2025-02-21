import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAI } from '@/hooks/useAI';

// Mock the useCompletion hook
const mockComplete = vi.fn();
vi.mock('ai/react', () => ({
  useCompletion: vi.fn(() => ({
    completion: '',
    complete: mockComplete,
    isLoading: false,
    error: null,
  })),
}));

describe('useAI Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockComplete.mockResolvedValue('Mocked completion');
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useAI());

    expect(result.current.research).toBe('');
    expect(result.current.content).toBe('');
    expect(result.current.isResearching).toBe(false);
    expect(result.current.isResearchLoading).toBe(false);
    expect(result.current.isContentLoading).toBe(false);
    expect(result.current.researchError).toBeNull();
    expect(result.current.contentError).toBeNull();
  });

  it('should handle research request', async () => {
    const { result } = renderHook(() => useAI());

    await act(async () => {
      await result.current.startResearch({ topic: 'Test Topic' });
    });

    expect(result.current.isResearching).toBe(false);
    expect(result.current.researchError).toBeNull();
    expect(mockComplete).toHaveBeenCalledWith(
      JSON.stringify({ topic: 'Test Topic' })
    );
  });

  it('should handle content generation request', async () => {
    const { result } = renderHook(() => useAI());

    await act(async () => {
      await result.current.generateContent({
        topic: 'Test Topic',
        research: 'Test Research',
      });
    });

    expect(result.current.isContentLoading).toBe(false);
    expect(mockComplete).toHaveBeenCalledWith(
      JSON.stringify({
        topic: 'Test Topic',
        research: 'Test Research',
      })
    );
  });

  it('should handle research errors', async () => {
    mockComplete.mockRejectedValueOnce(new Error('Research failed'));

    const { result } = renderHook(() => useAI());

    await act(async () => {
      await result.current.startResearch({ topic: 'Test Topic' });
    });

    expect(result.current.researchError).toBe('Research failed');
  });
});
