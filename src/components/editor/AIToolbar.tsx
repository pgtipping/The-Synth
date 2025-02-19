'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ResearchPanel } from './ResearchPanel';
import { Search } from 'lucide-react';

interface AIToolbarProps {
  onInsert: (content: string) => void;
  selectedText?: string;
}

export function AIToolbar({ onInsert, selectedText }: AIToolbarProps) {
  const [activePanel, setActivePanel] = useState<'research' | null>(null);

  return (
    <div className="flex items-center gap-2">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setActivePanel('research')}
          >
            <Search className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[800px] sm:max-w-[800px]">
          <SheetHeader>
            <SheetTitle>AI Research Assistant</SheetTitle>
            <SheetDescription>
              Research and fact-check your content using AI
            </SheetDescription>
          </SheetHeader>
          {activePanel === 'research' && (
            <ResearchPanel onInsert={onInsert} selectedText={selectedText} />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
