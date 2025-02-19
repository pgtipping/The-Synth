'use client';

import * as React from 'react';
import { useEffect, useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Image, Video, Code2, Link as LinkIcon, Plus } from 'lucide-react';
import { useToast } from '../ui/use-toast';
import type { QuillInstance, QuillSource } from './types';

interface Position {
  top: number;
  left: number;
}

interface UploadResponse {
  success: boolean;
  url?: string;
  error?: string;
}

// Add editor-specific icons
const EditorIcons = {
  image: Image,
  video: Video,
  code: Code2,
  link: LinkIcon,
  plus: Plus,
} as const;

// Define Quill sources
const QUILL_SOURCES = {
  USER: 'user' as QuillSource,
  SILENT: 'silent' as QuillSource,
} as const;

// File size limits in bytes
const FILE_SIZE_LIMITS = {
  image: 5 * 1024 * 1024, // 5MB
  video: 15 * 1024 * 1024, // 15MB
} as const;

interface PlusMenuProps {
  quill: QuillInstance;
  onClose?: () => void;
}

const formatFileSize = (bytes: number): string => {
  const mb = bytes / (1024 * 1024);
  return `${mb}MB`;
};

export function PlusMenu({
  quill,
  onClose = () => {},
}: PlusMenuProps): JSX.Element {
  const [position, setPosition] = useState<Position>({
    top: -1000,
    left: -1000,
  });
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const editorRef = useRef<QuillInstance | null>(null);
  const observerRef = useRef<MutationObserver | null>(null);
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      // Cleanup observer if it exists
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Keep a stable reference to the editor instance
  useEffect(() => {
    if (quill?.root && document.contains(quill.root)) {
      editorRef.current = quill;
    }
  }, [quill]);

  useEffect(() => {
    if (!editorRef.current) {
      setIsVisible(false);
      return;
    }

    const editor = editorRef.current;

    // Simplified handler for cursor/text changes
    const updateMenuVisibility = () => {
      try {
        const selection = editor.getSelection();
        if (!selection) {
          setIsVisible(false);
          return;
        }

        // Get text content of current line
        const [line] = editor.getLine(selection.index);
        const lineContent = editor.getText(line.offset(), line.length());

        // Simple rule: show menu if cursor is at start of empty line
        const shouldShow =
          selection.index === line.offset() && lineContent.trim() === '';

        if (shouldShow) {
          const bounds = editor.getBounds(selection.index, 0);
          const editorBounds = editor.root.getBoundingClientRect();

          setPosition({
            top: bounds.top + editorBounds.top + window.scrollY,
            left: editorBounds.left + 40,
          });
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      } catch (error) {
        console.error('PlusMenu: Update failed', error);
        setIsVisible(false);
      }
    };

    // Set up event listeners
    editor.on('selection-change', updateMenuVisibility);
    editor.on('text-change', updateMenuVisibility);

    // Initial check
    updateMenuVisibility();

    // Cleanup
    return () => {
      editor.off('selection-change', updateMenuVisibility);
      editor.off('text-change', updateMenuVisibility);
    };
  }, [editorRef.current]);

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

    if (!data.success || !data.url) {
      throw new Error(data.error || 'Upload failed');
    }

    return data.url;
  };

  const handleImageUpload = async (): Promise<void> => {
    // Create a dialog for image options
    const dialog = document.createElement('div');
    dialog.className =
      'fixed inset-0 flex items-center justify-center bg-black/50 z-[9999]';
    dialog.innerHTML = `
      <div class="bg-background rounded-lg shadow-lg w-[400px] p-4">
        <div class="flex border-b mb-4">
          <button class="px-4 py-2 text-foreground border-b-2 border-primary">URL</button>
          <button class="px-4 py-2 text-muted-foreground">Upload</button>
        </div>
        <div class="space-y-4">
          <input type="text" placeholder="Paste the image URL..." class="w-full px-3 py-2 rounded-md border bg-background text-foreground" />
          <div class="text-sm text-muted-foreground">Supported formats: JPG, PNG, GIF, WebP</div>
          <button class="w-full bg-primary text-primary-foreground rounded-md py-2">Add image</button>
        </div>
      </div>
    `;

    document.body.appendChild(dialog);

    // Get elements
    const uploadTab = dialog.querySelector(
      'button:nth-child(2)'
    ) as HTMLButtonElement;
    const input = dialog.querySelector('input') as HTMLInputElement;
    const addButton = dialog.querySelector('.bg-primary') as HTMLButtonElement;

    // Handle URL insert
    addButton.onclick = async () => {
      const url = input.value.trim();
      if (!url) return;

      try {
        // Validate URL
        const urlObj = new URL(url);
        const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(urlObj.pathname);
        if (!isImage) {
          toast({
            title: 'Invalid Image URL',
            description:
              'URL must point to an image file (JPG, PNG, GIF, WebP)',
            variant: 'destructive',
          });
          return;
        }

        const selection = quill.getSelection(true);
        if (!selection) return;

        // Insert newline before image
        quill.insertText(selection.index, '\n', QUILL_SOURCES.USER);

        // Insert image with URL only
        quill.insertEmbed(
          selection.index + 1,
          'image',
          url,
          QUILL_SOURCES.USER
        );

        // Insert newline after image
        quill.insertText(selection.index + 2, '\n', QUILL_SOURCES.USER);

        // Move cursor after image
        quill.setSelection(selection.index + 3, 0, QUILL_SOURCES.SILENT);

        // Close dialog
        document.body.removeChild(dialog);
        onClose();
      } catch (error) {
        toast({
          title: 'Error',
          description:
            error instanceof Error ? error.message : 'Failed to insert image',
          variant: 'destructive',
        });
      }
    };

    // Handle file upload
    uploadTab.onclick = () => {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.style.display = 'none';

      fileInput.onchange = async (event) => {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        if (!file) return;

        try {
          setIsUploading(true);
          const url = await uploadFile(file, 'image');

          const selection = quill.getSelection(true);
          if (!selection) return;

          // Insert newline before image
          quill.insertText(selection.index, '\n', QUILL_SOURCES.USER);

          // Insert image
          quill.insertEmbed(
            selection.index + 1,
            'image',
            url,
            QUILL_SOURCES.USER
          );

          // Insert newline after image
          quill.insertText(selection.index + 2, '\n', QUILL_SOURCES.USER);

          // Move cursor after image
          quill.setSelection(selection.index + 3, 0, QUILL_SOURCES.SILENT);

          // Close dialog
          document.body.removeChild(dialog);
          onClose();
        } catch (error) {
          toast({
            title: 'Upload Failed',
            description:
              error instanceof Error ? error.message : 'Failed to upload image',
            variant: 'destructive',
          });
        } finally {
          setIsUploading(false);
        }
      };

      fileInput.click();
    };

    // Handle dialog close
    dialog.onclick = (event) => {
      if (event.target === dialog) {
        document.body.removeChild(dialog);
        onClose();
      }
    };
  };

  const handleVideoUpload = async (): Promise<void> => {
    // Create a dialog for video options
    const dialog = document.createElement('div');
    dialog.className =
      'fixed inset-0 flex items-center justify-center bg-black/50 z-[9999]';
    dialog.innerHTML = `
      <div class="bg-background rounded-lg shadow-lg w-[400px] p-4">
        <div class="flex border-b mb-4">
          <button class="px-4 py-2 text-foreground border-b-2 border-primary">URL</button>
          <button class="px-4 py-2 text-muted-foreground">Upload</button>
        </div>
        <div class="space-y-4">
          <input type="text" placeholder="Paste the video URL..." class="w-full px-3 py-2 rounded-md border bg-background text-foreground" />
          <div class="text-sm text-muted-foreground">Supported formats: MP4, WebM</div>
          <button class="w-full bg-primary text-primary-foreground rounded-md py-2">Add video</button>
        </div>
      </div>
    `;

    document.body.appendChild(dialog);

    // Get elements
    const uploadTab = dialog.querySelector(
      'button:nth-child(2)'
    ) as HTMLButtonElement;
    const input = dialog.querySelector('input') as HTMLInputElement;
    const addButton = dialog.querySelector('.bg-primary') as HTMLButtonElement;

    // Handle URL insert
    addButton.onclick = async () => {
      const url = input.value.trim();
      if (!url) return;

      try {
        // Validate URL
        const urlObj = new URL(url);
        const isVideo = /\.(mp4|webm)$/i.test(urlObj.pathname);
        if (!isVideo) {
          toast({
            title: 'Invalid Video URL',
            description: 'URL must point to a video file (MP4, WebM)',
            variant: 'destructive',
          });
          return;
        }

        const selection = quill.getSelection(true);
        if (!selection) return;

        // Insert newline before video
        quill.insertText(selection.index, '\n', QUILL_SOURCES.USER);

        // Insert video
        quill.insertEmbed(
          selection.index + 1,
          'video',
          url,
          QUILL_SOURCES.USER
        );

        // Insert newline after video
        quill.insertText(selection.index + 2, '\n', QUILL_SOURCES.USER);

        // Move cursor after video
        quill.setSelection(selection.index + 3, 0, QUILL_SOURCES.SILENT);

        // Close dialog
        document.body.removeChild(dialog);
        onClose();
      } catch (error) {
        toast({
          title: 'Error',
          description:
            error instanceof Error ? error.message : 'Failed to insert video',
          variant: 'destructive',
        });
      }
    };

    // Handle file upload
    uploadTab.onclick = () => {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'video/*';
      fileInput.style.display = 'none';

      fileInput.onchange = async (event) => {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        if (!file) return;

        try {
          setIsUploading(true);
          const url = await uploadFile(file, 'video');

          const selection = quill.getSelection(true);
          if (!selection) return;

          // Insert newline before video
          quill.insertText(selection.index, '\n', QUILL_SOURCES.USER);

          // Insert video
          quill.insertEmbed(
            selection.index + 1,
            'video',
            url,
            QUILL_SOURCES.USER
          );

          // Insert newline after video
          quill.insertText(selection.index + 2, '\n', QUILL_SOURCES.USER);

          // Move cursor after video
          quill.setSelection(selection.index + 3, 0, QUILL_SOURCES.SILENT);

          // Close dialog
          document.body.removeChild(dialog);
          onClose();
        } catch (error) {
          toast({
            title: 'Upload Failed',
            description:
              error instanceof Error ? error.message : 'Failed to upload video',
            variant: 'destructive',
          });
        } finally {
          setIsUploading(false);
        }
      };

      fileInput.click();
    };

    // Handle dialog close
    dialog.onclick = (event) => {
      if (event.target === dialog) {
        document.body.removeChild(dialog);
        onClose();
      }
    };
  };

  const handleEmbedInsert = (): void => {
    const selection = quill.getSelection(true);
    if (!selection) return;

    const url = window.prompt('Enter URL to embed:');
    if (!url) return;

    try {
      // Insert newline before embed
      quill.insertText(selection.index, '\n', QUILL_SOURCES.USER);

      // Insert embed
      quill.insertEmbed(selection.index + 1, 'embed', url, QUILL_SOURCES.USER);

      // Insert newline after embed
      quill.insertText(selection.index + 2, '\n', QUILL_SOURCES.USER);

      // Move cursor after embed
      quill.setSelection(selection.index + 3, 0, QUILL_SOURCES.SILENT);
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to insert embed',
        variant: 'destructive',
      });
    }
  };

  const handleCodeBlockInsert = (): void => {
    const selection = quill.getSelection(true);
    if (!selection) return;

    try {
      // Insert newlines and code block
      quill.insertText(selection.index, '\n', QUILL_SOURCES.USER);
      quill.insertText(selection.index + 1, ' ', QUILL_SOURCES.USER);
      quill.format('code-block', true);
      quill.insertText(selection.index + 2, '\n', QUILL_SOURCES.USER);

      // Move cursor to code block
      quill.setSelection(selection.index + 1, 0, QUILL_SOURCES.SILENT);
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to insert code block',
        variant: 'destructive',
      });
    }
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
            top: `${position.top}px`,
            left: `${position.left}px`,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            pointerEvents: 'auto',
            zIndex: 9999,
          }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMenu}
            className={`plus-button ${isOpen ? 'open' : ''}`}
            aria-label="Add content"
            disabled={isUploading}
            data-tooltip="Add an image, video, link, or codeblock"
          >
            {isUploading ? (
              <svg
                className="h-5 w-5 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <EditorIcons.plus className="h-5 w-5" />
            )}
          </Button>

          {isOpen && (
            <div
              className="plus-menu"
              style={{
                position: 'absolute',
                left: '100%',
                marginLeft: '8px',
                top: '0',
                zIndex: 9999,
                pointerEvents: 'auto',
              }}
            >
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
