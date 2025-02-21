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
    if (!quill || !selection) {
      console.log('FloatingToolbar Debug: Missing quill or selection');
      console.log('FloatingToolbar Debug: Quill:', !!quill);
      console.log('FloatingToolbar Debug: Selection:', selection);
      setIsVisible(false);
      return;
    }

    try {
      console.log('FloatingToolbar Debug: Updating position');
      // Only show for non-empty selections
      if (selection.length === 0) {
        console.log('FloatingToolbar Debug: Empty selection');
        setIsVisible(false);
        return;
      }

      console.log('FloatingToolbar Debug: Selection:', {
        index: selection.index,
        length: selection.length,
      });

      // Get the bounds of the selection
      const rangeBounds = quill.getBounds(selection.index, selection.length);
      if (!rangeBounds) {
        console.log('FloatingToolbar Debug: No range bounds');
        setIsVisible(false);
        return;
      }

      console.log('FloatingToolbar Debug: Range bounds:', rangeBounds);

      // Get editor root element bounds
      const editorBounds = quill.root.getBoundingClientRect();
      const editorTop = window.scrollY + editorBounds.top;

      // Calculate toolbar position
      const toolbarTop = editorTop + rangeBounds.top - 10; // Position above selection
      const toolbarLeft = editorBounds.left + rangeBounds.left;

      const toolbarPosition = {
        top: toolbarTop,
        left: toolbarLeft,
      };

      console.log('FloatingToolbar Debug: Setting position:', toolbarPosition);

      // Set position and show toolbar
      setPosition(toolbarPosition);
      setIsVisible(true);
    } catch (error) {
      console.error(
        'FloatingToolbar Debug: Position update failed',
        error instanceof Error ? error.message : 'Unknown error'
      );
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
    if (!quill || !selection) {
      console.log(
        'FloatingToolbar Debug: Missing quill or selection in effect'
      );
      console.log('FloatingToolbar Debug: Quill:', !!quill);
      console.log('FloatingToolbar Debug: Selection:', selection);
      setIsVisible(false);
      return;
    }

    // Only show toolbar for non-empty selections
    if (selection.length > 0) {
      console.log('FloatingToolbar Debug: Valid selection detected');
      console.log('FloatingToolbar Debug: Selection:', selection);
      // Update immediately and then again after a short delay
      updatePosition();
      const positionTimeout = setTimeout(() => {
        console.log('FloatingToolbar Debug: Running delayed position update');
        updatePosition();
        updateFormats();
      }, 10);

      return () => {
        console.log('FloatingToolbar Debug: Cleaning up position timeout');
        clearTimeout(positionTimeout);
      };
    } else {
      console.log('FloatingToolbar Debug: No selection length, hiding toolbar');
      setIsVisible(false);
    }
  }, [quill, selection, updatePosition, updateFormats]);

  // Add scroll and resize handlers
  useEffect(() => {
    if (!quill?.root) {
      console.log('FloatingToolbar: No quill root for viewport handlers');
      return;
    }

    console.log('FloatingToolbar: Setting up viewport handlers');
    const handleViewportChange = () => {
      const currentSelection = quill.getSelection();
      if (currentSelection && currentSelection.length > 0) {
        console.log('FloatingToolbar: Viewport change with selection');
        requestAnimationFrame(updatePosition);
      }
    };

    // Listen for scroll events on both window and editor root
    window.addEventListener('scroll', handleViewportChange, { passive: true });
    window.addEventListener('resize', handleViewportChange, { passive: true });
    quill.root.addEventListener('scroll', handleViewportChange, {
      passive: true,
    });

    return () => {
      console.log('FloatingToolbar: Cleaning up viewport handlers');
      window.removeEventListener('scroll', handleViewportChange);
      window.removeEventListener('resize', handleViewportChange);
      quill.root.removeEventListener('scroll', handleViewportChange);
    };
  }, [quill, updatePosition]);

  // Add styles to ensure toolbar is visible
  const toolbarStyle = {
    position: 'fixed' as const,
    top: `${position.top}px`,
    left: `${position.left}px`,
    zIndex: 9999,
    backgroundColor: 'var(--background)',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border)',
    padding: '4px',
    display: 'flex',
    gap: '2px',
    alignItems: 'center',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    pointerEvents: 'auto' as const,
    userSelect: 'none' as const,
    transform: 'translateY(-100%)',
  };

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
    <div ref={toolbarRef} className={styles.toolbar} style={toolbarStyle}>
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
