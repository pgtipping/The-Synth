'use client';

import * as React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAI } from '@/hooks/useAI';
import type { QuillInstance } from './types';
import { toast } from '@/components/ui/use-toast';

interface AIToolbarProps {
  quill: QuillInstance;
}

export function AIToolbar({ quill }: AIToolbarProps) {
  const [selectedText, setSelectedText] = useState('');

  const { generate, isLoading, stop } = useAI({
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
    onFinish: (content) => {
      // Insert the generated content at cursor position or replace selection
      const range = quill.getSelection();
      if (range) {
        if (range.length > 0) {
          quill.deleteText(range.index, range.length);
        }
        quill.insertText(range.index, content);
      }
    },
  });

  const handleImprove = async () => {
    const range = quill.getSelection();
    if (!range) {
      toast({
        title: 'No text selected',
        description: 'Please select some text to improve.',
        variant: 'default',
      });
      return;
    }

    const text = quill.getText(range.index, range.length);
    setSelectedText(text);

    await generate(
      text,
      "Please improve this text while maintaining the author's voice and style."
    );
  };

  const handleExpand = async () => {
    const range = quill.getSelection();
    if (!range) {
      toast({
        title: 'No text selected',
        description: 'Please select some text to expand.',
        variant: 'default',
      });
      return;
    }

    const text = quill.getText(range.index, range.length);
    setSelectedText(text);

    await generate(
      text,
      "Please expand this text with more details and examples while maintaining the author's voice and style."
    );
  };

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleImprove}
        disabled={isLoading}
      >
        {isLoading ? 'Improving...' : 'Improve'}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleExpand}
        disabled={isLoading}
      >
        {isLoading ? 'Expanding...' : 'Expand'}
      </Button>
      {isLoading && (
        <Button variant="destructive" size="sm" onClick={() => stop()}>
          Stop
        </Button>
      )}
    </div>
  );
}
