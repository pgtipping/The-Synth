import React from 'react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AIToolbar } from '@/components/editor/AIToolbar';
import { useAI } from '@/hooks/useAI';
import type { QuillInstance } from '@/components/editor/types';
import type { Range } from 'quill';

// Mock UI components
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} role="button" {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/input', () => ({
  Input: ({ placeholder, ...props }: any) => (
    <input placeholder={placeholder} role="textbox" {...props} />
  ),
}));

vi.mock('@/components/ui/textarea', () => ({
  Textarea: ({ placeholder, ...props }: any) => (
    <textarea placeholder={placeholder} role="textbox" {...props} />
  ),
}));

// Mock the useAI hook
const mockStartResearch = vi.fn();
const mockGenerateContent = vi.fn();

vi.mock('@/hooks/useAI', () => ({
  useAI: vi.fn(() => ({
    research: '',
    content: '',
    isResearching: false,
    isResearchLoading: false,
    isContentLoading: false,
    researchError: null,
    startResearch: mockStartResearch,
    generateContent: mockGenerateContent,
  })),
}));

// Mock Quill instance
const mockQuill: QuillInstance = {
  root: document.createElement('div'),
  scroll: {} as any,
  getBounds: vi.fn(),
  getFormat: vi.fn(),
  getLength: vi.fn(),
  getLine: vi.fn(),
  getSelection: vi.fn(() => ({ index: 0, length: 0 }) as Range),
  getText: vi.fn(),
  insertText: vi.fn(),
  setContents: vi.fn(),
  format: vi.fn(),
  formatLine: vi.fn(),
  formatText: vi.fn(),
  getContents: vi.fn(),
  deleteText: vi.fn(),
  removeFormat: vi.fn(),
  insertEmbed: vi.fn(),
  setSelection: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
};

// Setup test environment
beforeAll(() => {
  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

describe('AIToolbar', () => {
  it('should render the search input and button', () => {
    render(<AIToolbar quill={mockQuill} />);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should expand when search button is clicked', () => {
    render(<AIToolbar quill={mockQuill} />);

    const searchButton = screen.getByRole('button');
    fireEvent.click(searchButton);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should handle research request', async () => {
    (useAI as any).mockImplementation(() => ({
      research: '',
      content: '',
      isResearching: false,
      isResearchLoading: false,
      isContentLoading: false,
      researchError: null,
      startResearch: mockStartResearch,
      generateContent: mockGenerateContent,
    }));

    render(<AIToolbar quill={mockQuill} />);

    // Expand the toolbar
    const searchButton = screen.getByRole('button');
    fireEvent.click(searchButton);

    // Enter topic and click research
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Test Topic' } });

    const researchButton = screen.getByText(/research topic/i);
    fireEvent.click(researchButton);

    await waitFor(() => {
      expect(mockStartResearch).toHaveBeenCalledWith({ topic: 'Test Topic' });
    });
  });

  it('should show research results and generate button when research is available', () => {
    (useAI as any).mockImplementation(() => ({
      research: 'Research results',
      content: '',
      isResearching: false,
      isResearchLoading: false,
      isContentLoading: false,
      researchError: null,
      startResearch: mockStartResearch,
      generateContent: mockGenerateContent,
    }));

    render(<AIToolbar quill={mockQuill} />);

    // Expand the toolbar
    const searchButton = screen.getByRole('button');
    fireEvent.click(searchButton);

    expect(screen.getByText(/generate content/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('Research results')).toBeInTheDocument();
  });

  it('should handle content generation', async () => {
    (useAI as any).mockImplementation(() => ({
      research: 'Research results',
      content: '',
      isResearching: false,
      isResearchLoading: false,
      isContentLoading: false,
      researchError: null,
      startResearch: mockStartResearch,
      generateContent: mockGenerateContent,
    }));

    render(<AIToolbar quill={mockQuill} />);

    // Expand the toolbar
    const searchButton = screen.getByRole('button');
    fireEvent.click(searchButton);

    // Click generate content
    const generateButton = screen.getByText(/generate content/i);
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(mockGenerateContent).toHaveBeenCalledWith({
        topic: '',
        research: 'Research results',
        tone: 'professional',
        style: 'blog',
      });
    });
  });

  it('should show error message when research fails', () => {
    (useAI as any).mockImplementation(() => ({
      research: '',
      content: '',
      isResearching: false,
      isResearchLoading: false,
      isContentLoading: false,
      researchError: 'Research failed',
      startResearch: mockStartResearch,
      generateContent: mockGenerateContent,
    }));

    render(<AIToolbar quill={mockQuill} />);

    // Expand the toolbar
    const searchButton = screen.getByRole('button');
    fireEvent.click(searchButton);

    expect(screen.getByText('Research failed')).toBeInTheDocument();
  });
});
