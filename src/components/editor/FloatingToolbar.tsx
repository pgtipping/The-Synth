'use client';

import * as React from 'react';
import { useCallback, useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  Underline,
  Code2,
  Quote,
  LinkIcon,
  Heading1 as H1Icon,
  Heading2 as H2Icon,
  Heading3 as H3Icon,
  Strikethrough as StrikethroughIcon,
} from 'lucide-react';
import styles from './FloatingToolbar.module.css';
import { toast } from '@/components/ui/use-toast';
import type { QuillInstance, QuillRange } from './types';

// Add the new icons to the Icons object
const EditorIcons = {
  bold: Bold,
  italic: Italic,
  link: LinkIcon,
  h1: H1Icon,
  h2: H2Icon,
  h3: H3Icon,
  quote: Quote,
  code: Code2,
  underline: Underline,
  strikethrough: StrikethroughIcon,
} as const;

interface FloatingToolbarProps {
  selection: QuillRange | null;
  quill: QuillInstance;
}

interface FormatState {
  bold: boolean;
  italic: boolean;
  link: boolean;
  header: number | false;
  blockquote: boolean;
  'code-block': boolean;
  underline: boolean;
  strike: boolean;
}

export function FloatingToolbar({
  selection,
  quill,
}: FloatingToolbarProps): JSX.Element | null {
  const [position, setPosition] = useState({ top: -1000, left: -1000 });
  const [isVisible, setIsVisible] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [formats, setFormats] = useState<FormatState>({
    bold: false,
    italic: false,
    link: false,
    header: 0,
    blockquote: false,
    'code-block': false,
    underline: false,
    strike: false,
  });

  const updatePosition = useCallback(() => {
    if (!quill || !selection || selection.length === 0) {
      setIsVisible(false);
      return;
    }

    try {
      const bounds = quill.getBounds(selection.index, selection.length);
      if (!bounds) {
        setIsVisible(false);
        return;
      }

      setPosition({
        top: bounds.top - 50,
        left: bounds.left + bounds.width / 2 + 200,
      });
      setIsVisible(true);
    } catch (error) {
      toast({
        title: 'Editor Error',
        description: 'Failed to update toolbar position',
        variant: 'destructive',
      });
      setIsVisible(false);
    }
  }, [quill, selection]);

  const updateFormats = useCallback(() => {
    if (!quill || !selection) {
      setFormats({
        bold: false,
        italic: false,
        link: false,
        header: 0,
        blockquote: false,
        'code-block': false,
        underline: false,
        strike: false,
      });
      return;
    }

    try {
      const currentFormats = quill.getFormat(selection);

      setFormats({
        bold: Boolean(currentFormats.bold),
        italic: Boolean(currentFormats.italic),
        link: Boolean(currentFormats.link),
        header:
          typeof currentFormats.header === 'number' ? currentFormats.header : 0,
        blockquote: Boolean(currentFormats.blockquote),
        'code-block': Boolean(currentFormats['code-block']),
        underline: Boolean(currentFormats.underline),
        strike: Boolean(currentFormats.strike),
      });
    } catch (error) {
      toast({
        title: 'Editor Error',
        description: 'Failed to update formatting',
        variant: 'destructive',
      });
      setFormats({
        bold: false,
        italic: false,
        link: false,
        header: 0,
        blockquote: false,
        'code-block': false,
        underline: false,
        strike: false,
      });
    }
  }, [quill, selection]);

  useEffect(() => {
    if (selection && selection.length > 0) {
      updatePosition();
      updateFormats();
    } else {
      setIsVisible(false);
    }
  }, [selection, updatePosition, updateFormats]);

  const toggleFormat = (format: keyof FormatState): void => {
    if (!quill || !selection) return;

    try {
      if (format === 'header') {
        quill.removeFormat(selection.index, selection.length);
      } else if (format === 'code-block') {
        const value = !formats['code-block'];
        quill.removeFormat(selection.index, selection.length);
        quill.formatLine(
          selection.index,
          selection.length,
          'code-block',
          value
        );
      } else {
        const value = !formats[format];
        quill.formatText(selection.index, selection.length, format, value);
      }
      updateFormats();
    } catch (error) {
      console.error('Error toggling format:', error);
      toast({
        title: 'Editor Error',
        description: 'Failed to update formatting',
        variant: 'destructive',
      });
    }
  };

  const setHeader = (level: number): void => {
    if (!quill || !selection) return;

    try {
      quill.removeFormat(selection.index, selection.length);
      if (level > 0) {
        quill.formatLine(selection.index, selection.length, 'header', level);
      }
      updateFormats();
    } catch (error) {
      console.error('Error setting header:', error);
      toast({
        title: 'Editor Error',
        description: 'Failed to update header formatting',
        variant: 'destructive',
      });
    }
  };

  const insertLink = (): void => {
    if (!quill || !selection) return;

    const url = window.prompt('Enter URL:');
    if (url) {
      quill.format('link', url);
      updateFormats();
    }
  };

  if (!isVisible) return null;

  return (
    <div
      ref={toolbarRef}
      className={styles.toolbar}
      style={{
        top: position.top + 'px',
        left: position.left + 'px',
      }}
    >
      <Button
        variant={formats.bold ? 'default' : 'ghost'}
        size="icon"
        onClick={() => toggleFormat('bold')}
        type="button"
        aria-label="Bold"
      >
        <EditorIcons.bold className="h-4 w-4" />
      </Button>
      <Button
        variant={formats.italic ? 'default' : 'ghost'}
        size="icon"
        onClick={() => toggleFormat('italic')}
        type="button"
        aria-label="Italic"
      >
        <EditorIcons.italic className="h-4 w-4" />
      </Button>
      <Button
        variant={formats.underline ? 'default' : 'ghost'}
        size="icon"
        onClick={() => toggleFormat('underline')}
        type="button"
        aria-label="Underline"
      >
        <EditorIcons.underline className="h-4 w-4" />
      </Button>
      <Button
        variant={formats.strike ? 'default' : 'ghost'}
        size="icon"
        onClick={() => toggleFormat('strike')}
        type="button"
        aria-label="Strikethrough"
      >
        <EditorIcons.strikethrough className="h-4 w-4" />
      </Button>
      <div className="mx-1 h-4 w-[1px] bg-border" />
      <Button
        variant={formats.header === 1 ? 'default' : 'ghost'}
        size="icon"
        onClick={() => setHeader(1)}
        type="button"
        aria-label="Heading 1"
      >
        <EditorIcons.h1 className="h-4 w-4" />
      </Button>
      <Button
        variant={formats.header === 2 ? 'default' : 'ghost'}
        size="icon"
        onClick={() => setHeader(2)}
        type="button"
        aria-label="Heading 2"
      >
        <EditorIcons.h2 className="h-4 w-4" />
      </Button>
      <Button
        variant={formats.header === 3 ? 'default' : 'ghost'}
        size="icon"
        onClick={() => setHeader(3)}
        type="button"
        aria-label="Heading 3"
      >
        <EditorIcons.h3 className="h-4 w-4" />
      </Button>
      <div className="mx-1 h-4 w-[1px] bg-border" />
      <Button
        variant={formats.blockquote ? 'default' : 'ghost'}
        size="icon"
        onClick={() => toggleFormat('blockquote')}
        type="button"
        aria-label="Blockquote"
      >
        <EditorIcons.quote className="h-4 w-4" />
      </Button>
      <Button
        variant={formats['code-block'] ? 'default' : 'ghost'}
        size="icon"
        onClick={() => toggleFormat('code-block')}
        type="button"
        aria-label="Code Block"
      >
        <EditorIcons.code className="h-4 w-4" />
      </Button>
      <div className="mx-1 h-4 w-[1px] bg-border" />
      <Button
        variant={formats.link ? 'default' : 'ghost'}
        size="icon"
        onClick={insertLink}
        type="button"
        aria-label="Link"
      >
        <EditorIcons.link className="h-4 w-4" />
      </Button>
    </div>
  );
}
