'use client';

import ReactQuill from 'react-quill';
import { useCallback, useEffect, useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Icons } from '../icons';
import {
  Bold,
  Italic,
  Link as LinkIcon,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code2,
  Underline,
  Strikethrough,
} from 'lucide-react';

// Add the new icons to the Icons object
const EditorIcons = {
  ...Icons,
  bold: Bold,
  italic: Italic,
  link: LinkIcon,
  h1: Heading1,
  h2: Heading2,
  h3: Heading3,
  quote: Quote,
  code: Code2,
  underline: Underline,
  strikethrough: Strikethrough,
} as const;

interface FloatingToolbarProps {
  quill: ReactQuill;
  selection: { index: number; length: number } | null;
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
  quill,
  selection,
}: FloatingToolbarProps): JSX.Element | null {
  const [position, setPosition] = useState({ top: -1000, left: -1000 });
  const [isVisible, setIsVisible] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [formats, setFormats] = useState<FormatState>({
    bold: false,
    italic: false,
    link: false,
    header: false,
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

    const editor = quill.getEditor();
    const bounds = editor.getBounds(selection.index, selection.length);

    // Simple positioning above selection, moved 100px to the right
    setPosition({
      top: bounds.top - 50,
      left: bounds.left + bounds.width / 2 + 200,
    });
    setIsVisible(true);
  }, [quill, selection]);

  const updateFormats = useCallback(() => {
    if (!quill || !selection) {
      setFormats({
        bold: false,
        italic: false,
        link: false,
        header: false,
        blockquote: false,
        'code-block': false,
        underline: false,
        strike: false,
      });
      return;
    }

    const editor = quill.getEditor();
    const currentFormats = editor.getFormat(selection);

    setFormats({
      bold: Boolean(currentFormats.bold),
      italic: Boolean(currentFormats.italic),
      link: Boolean(currentFormats.link),
      header: currentFormats.header || false,
      blockquote: Boolean(currentFormats.blockquote),
      'code-block': Boolean(currentFormats['code-block']),
      underline: Boolean(currentFormats.underline),
      strike: Boolean(currentFormats.strike),
    });
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

    const editor = quill.getEditor();
    if (format === 'header') {
      editor.format('header', false);
    } else {
      editor.format(format, !formats[format]);
    }
    updateFormats();
  };

  const setHeader = (level: number): void => {
    if (!quill || !selection) return;

    const editor = quill.getEditor();
    editor.format('header', formats.header === level ? false : level);
    updateFormats();
  };

  const insertLink = (): void => {
    if (!quill || !selection) return;

    const url = window.prompt('Enter URL:');
    if (url) {
      const editor = quill.getEditor();
      editor.format('link', url);
      updateFormats();
    }
  };

  if (!isVisible) return null;

  return (
    <div
      ref={toolbarRef}
      className="floating-toolbar absolute z-[9999] flex items-center gap-1 rounded-lg border bg-white p-1 shadow-lg"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateX(-50%)',
        whiteSpace: 'nowrap',
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
