'use client';

import ReactQuill from 'react-quill';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Icons } from '../icons';
import { Bold, Italic, Link as LinkIcon } from 'lucide-react';

// Add the new icons to the Icons object
const EditorIcons = {
  ...Icons,
  bold: Bold,
  italic: Italic,
  link: LinkIcon,
} as const;

interface FloatingToolbarProps {
  quill: ReactQuill;
  selection: { index: number; length: number } | null;
}

interface FormatState {
  bold: boolean;
  italic: boolean;
  link: boolean;
}

export function FloatingToolbar({
  quill,
  selection,
}: FloatingToolbarProps): JSX.Element | null {
  const [position, setPosition] = useState({ top: -1000, left: -1000 });
  const [isVisible, setIsVisible] = useState(false);
  const [formats, setFormats] = useState<FormatState>({
    bold: false,
    italic: false,
    link: false,
  });

  const updatePosition = useCallback(() => {
    if (!quill || !selection || selection.length === 0) return;

    const editor = quill.getEditor();
    const bounds = editor.getBounds(selection.index, selection.length);
    const editorRoot = editor.root;
    const editorBounds = editorRoot.getBoundingClientRect();

    // Position toolbar above the selection
    setPosition({
      top: bounds.top + editorBounds.top + window.scrollY - 60, // 30px above selection
      left: bounds.left + editorBounds.left + bounds.width / 2 + 50, // Center horizontally
    });

    setIsVisible(true);
  }, [quill, selection]);

  const updateFormats = useCallback(() => {
    if (!quill || !selection) return;

    const editor = quill.getEditor();
    const currentFormats = editor.getFormat(selection);
    setFormats({
      bold: Boolean(currentFormats.bold),
      italic: Boolean(currentFormats.italic),
      link: Boolean(currentFormats.link),
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
    editor.format(format, !formats[format]);
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
      className="fixed z-[9999] flex items-center gap-1 rounded-lg border bg-white p-1 shadow-lg"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateX(-50%)',
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
