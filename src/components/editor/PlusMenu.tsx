'use client';

import ReactQuill from 'react-quill';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Icons } from '../icons';
import { Image, Video, Code, Link as LinkIcon, Plus } from 'lucide-react';
import { useToast } from '../ui/use-toast';

// Add editor-specific icons
const EditorIcons = {
  ...Icons,
  image: Image,
  video: Video,
  code: Code,
  link: LinkIcon,
  plus: Plus,
} as const;

// File size limits in bytes
const FILE_SIZE_LIMITS = {
  image: 5 * 1024 * 1024, // 5MB
  video: 15 * 1024 * 1024, // 15MB
} as const;

interface PlusMenuProps {
  quill: ReactQuill;
  onClose: () => void;
}

interface Position {
  top: number;
  left: number;
}

interface RangeStatic {
  index: number;
  length: number;
}

interface UploadResponse {
  url: string;
  error?: string;
}

function formatFileSize(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)}MB`;
}

export function PlusMenu({ quill, onClose }: PlusMenuProps): JSX.Element {
  const [position, setPosition] = useState<Position>({
    top: -1000,
    left: -1000,
  });
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!quill) return;

    const editor = quill.getEditor();

    const handleCursorChange = () => {
      const selection = editor.getSelection();
      if (!selection) {
        setIsVisible(false);
        return;
      }

      // Get the line information
      const [line] = editor.getLine(selection.index);
      if (!line) {
        setIsVisible(false);
        return;
      }

      // Get the line's content
      const lineContent = editor.getText(line.offset(), line.length());

      // Check if cursor is at the start of the line AND line is empty
      const isAtLineStart = line.offset() === selection.index;
      const isLineEmpty = lineContent.trim() === '';

      if (!isAtLineStart || !isLineEmpty) {
        setIsVisible(false);
        return;
      }

      // Get the cursor position at line start
      const bounds = editor.getBounds(line.offset(), 0);
      const editorRoot = editor.root;
      const editorBounds = editorRoot.getBoundingClientRect();

      // Calculate absolute position
      const top = bounds.top + editorBounds.top + window.scrollY - 4;
      const left = editorBounds.left;

      setPosition({ top, left });
      setIsVisible(true);
    };

    // Handle Enter key press
    const handleEnter = () => {
      // Force immediate check and then another after DOM update
      handleCursorChange();
      requestAnimationFrame(() => {
        handleCursorChange();
      });
    };

    // Handle text changes
    const handleTextChange = () => {
      requestAnimationFrame(handleCursorChange);
    };

    // Handle keyboard events
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleEnter();
      }
    };

    // Set up event listeners
    editor.on('selection-change', handleCursorChange);
    editor.on('text-change', handleTextChange);
    editor.root.addEventListener('keydown', handleKeyDown);

    // Initial position check
    handleCursorChange();

    return () => {
      editor.off('selection-change', handleCursorChange);
      editor.off('text-change', handleTextChange);
      editor.root.removeEventListener('keydown', handleKeyDown);
    };
  }, [quill]);

  const validateFileSize = (
    file: File,
    type: keyof typeof FILE_SIZE_LIMITS
  ): boolean => {
    if (file.size > FILE_SIZE_LIMITS[type]) {
      toast({
        title: 'File too large',
        description: `Maximum file size is ${formatFileSize(FILE_SIZE_LIMITS[type])}. Consider using embed for larger ${type}s.`,
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };

  const uploadFile = async (
    file: File,
    type: 'image' | 'video'
  ): Promise<string> => {
    if (!validateFileSize(file, type)) {
      throw new Error('File size exceeds limit');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data: UploadResponse = await response.json();

    if (data.error || !data.url) {
      throw new Error(data.error || 'Upload failed');
    }

    return data.url;
  };

  const handleImageUpload = async (): Promise<void> => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        try {
          setIsUploading(true);
          const url = await uploadFile(file, 'image');
          const editor = quill.getEditor();
          const selection = editor.getSelection(true) as RangeStatic;
          editor.insertEmbed(selection.index, 'image', {
            alt: file.name,
            url: url,
          });
          editor.setSelection(selection.index + 1, 0);
          toast({
            title: 'Success',
            description: 'Image uploaded successfully',
          });
        } catch (error) {
          if (
            error instanceof Error &&
            error.message === 'File size exceeds limit'
          ) {
            // Already handled by validateFileSize
            return;
          }
          console.error('Image upload failed:', error);
          toast({
            title: 'Error',
            description: 'Failed to upload image. Please try again.',
            variant: 'destructive',
          });
        } finally {
          setIsUploading(false);
        }
      }
    };
    input.click();
    onClose();
  };

  const handleVideoUpload = async (): Promise<void> => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        try {
          setIsUploading(true);
          const url = await uploadFile(file, 'video');
          const editor = quill.getEditor();
          const selection = editor.getSelection(true) as RangeStatic;
          editor.insertEmbed(selection.index, 'video', {
            url: url,
          });
          editor.setSelection(selection.index + 1, 0);
          toast({
            title: 'Success',
            description: 'Video uploaded successfully',
          });
        } catch (error) {
          if (
            error instanceof Error &&
            error.message === 'File size exceeds limit'
          ) {
            // Already handled by validateFileSize
            return;
          }
          console.error('Video upload failed:', error);
          toast({
            title: 'Error',
            description: 'Failed to upload video. Please try again.',
            variant: 'destructive',
          });
        } finally {
          setIsUploading(false);
        }
      }
    };
    input.click();
    onClose();
  };

  const handleEmbedInsert = (): void => {
    const url = window.prompt('Enter URL (YouTube, Vimeo, Twitter, etc.):');
    if (url) {
      try {
        const editor = quill.getEditor();
        const selection = editor.getSelection(true) as RangeStatic;
        editor.insertEmbed(selection.index, 'embed', { url });
        editor.setSelection(selection.index + 1, 0);
        toast({
          title: 'Success',
          description: 'Content embedded successfully',
        });
      } catch (error) {
        console.error('Embed insertion failed:', error);
        toast({
          title: 'Error',
          description:
            'Failed to embed content. Please check the URL and try again.',
          variant: 'destructive',
        });
      }
    }
    onClose();
  };

  const handleCodeBlockInsert = (): void => {
    const editor = quill.getEditor();
    const selection = editor.getSelection(true) as RangeStatic;
    editor.format('code-block', true);
    editor.setSelection(selection.index + 1, 0);
    onClose();
  };

  const toggleMenu = (): void => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {isVisible && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            transform: `translate3d(${position.left - 40}px, ${position.top}px, 0)`,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMenu}
            className={`plus-button z-[9999] ${isOpen ? 'open' : ''}`}
            aria-label="Add content"
            disabled={isUploading}
            data-tooltip="Add an image, video, link, or codeblock"
          >
            {isUploading ? (
              <Icons.spinner className="h-5 w-5 animate-spin" />
            ) : (
              <EditorIcons.plus className="h-5 w-5" />
            )}
          </Button>

          {isOpen && (
            <div className="plus-menu z-[9999]">
              <Button
                className="plus-menu-btn"
                onClick={handleImageUpload}
                disabled={isUploading}
                data-tooltip={`Image (max ${formatFileSize(FILE_SIZE_LIMITS.image)})`}
              >
                <EditorIcons.image className="h-4 w-4" />
              </Button>

              <Button
                className="plus-menu-btn"
                onClick={handleVideoUpload}
                disabled={isUploading}
                data-tooltip={`Video (max ${formatFileSize(FILE_SIZE_LIMITS.video)})`}
              >
                <EditorIcons.video className="h-4 w-4" />
              </Button>

              <Button
                className="plus-menu-btn"
                onClick={handleEmbedInsert}
                disabled={isUploading}
                data-tooltip="Embed external content"
              >
                <EditorIcons.link className="h-4 w-4" />
              </Button>

              <Button
                className="plus-menu-btn"
                onClick={handleCodeBlockInsert}
                disabled={isUploading}
                data-tooltip="Insert code block"
              >
                <EditorIcons.code className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
