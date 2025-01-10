'use client';

import ReactQuill, { Quill } from 'react-quill';
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
  success: boolean;
  url: string;
  key: string;
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
    const urlTab = dialog.querySelector(
      'button:first-child'
    ) as HTMLButtonElement;
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
          throw new Error(
            'URL must point to an image file (JPG, PNG, GIF, WebP)'
          );
        }

        const editor = quill.getEditor();
        const selection = editor.getSelection(true) as RangeStatic;

        // Insert newline before image
        editor.insertText(selection.index, '\n', (Quill as any).sources.USER);

        // Insert image with URL only
        editor.insertEmbed(
          selection.index + 1,
          'image',
          url,
          (Quill as any).sources.USER
        );

        // Move cursor after image
        editor.setSelection(
          selection.index + 2,
          0,
          (Quill as any).sources.SILENT
        );

        toast({
          title: 'Success',
          description: 'Image added successfully',
        });
      } catch (error) {
        console.error('Image URL insert failed:', error);
        toast({
          title: 'Error',
          description:
            error instanceof Error ? error.message : 'Invalid image URL',
          variant: 'destructive',
        });
      }

      document.body.removeChild(dialog);
      onClose();
    };

    // Handle upload tab click
    uploadTab.onclick = () => {
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

            // Insert newline before image
            editor.insertText(
              selection.index,
              '\n',
              (Quill as any).sources.USER
            );

            // Insert image with URL only
            editor.insertEmbed(
              selection.index + 1,
              'image',
              url,
              (Quill as any).sources.USER
            );

            // Move cursor after image
            editor.setSelection(
              selection.index + 2,
              0,
              (Quill as any).sources.SILENT
            );

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
        document.body.removeChild(dialog);
      };
      input.click();
    };

    // Handle dialog close
    dialog.onclick = (e) => {
      if (e.target === dialog) {
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
          <button class="px-4 py-2 text-foreground border-b-2 border-primary">Embed link</button>
          <button class="px-4 py-2 text-muted-foreground">Upload</button>
        </div>
        <div class="space-y-4">
          <input type="text" placeholder="Paste the video link..." class="w-full px-3 py-2 rounded-md border bg-background text-foreground" />
          <div class="text-sm text-muted-foreground">Works with YouTube, Vimeo, Instagram, and TikTok</div>
          <button class="w-full bg-primary text-primary-foreground rounded-md py-2">Embed video</button>
        </div>
      </div>
    `;

    document.body.appendChild(dialog);

    // Get elements
    const embedTab = dialog.querySelector(
      'button:first-child'
    ) as HTMLButtonElement;
    const uploadTab = dialog.querySelector(
      'button:nth-child(2)'
    ) as HTMLButtonElement;
    const input = dialog.querySelector('input') as HTMLInputElement;
    const embedButton = dialog.querySelector(
      '.bg-primary'
    ) as HTMLButtonElement;

    // Handle embed
    embedButton.onclick = async () => {
      const url = input.value.trim();
      if (!url) return;

      try {
        const urlObj = new URL(url);
        let embedUrl: string;

        // YouTube
        if (
          urlObj.hostname.includes('youtube.com') ||
          urlObj.hostname.includes('youtu.be')
        ) {
          const videoId = url.split('v=')[1];
          if (!videoId) {
            throw new Error('Could not find YouTube video ID');
          }
          const ampersandPosition = videoId.indexOf('&');
          const cleanVideoId =
            ampersandPosition !== -1
              ? videoId.substring(0, ampersandPosition)
              : videoId;
          embedUrl = `https://www.youtube.com/embed/${cleanVideoId}`;
        }
        // Vimeo
        else if (urlObj.hostname.includes('vimeo.com')) {
          const videoId = urlObj.pathname.split('/').pop();
          if (!videoId) {
            throw new Error('Could not find Vimeo video ID');
          }
          embedUrl = `https://player.vimeo.com/video/${videoId}`;
        }
        // Instagram
        else if (urlObj.hostname.includes('instagram.com')) {
          const postId = urlObj.pathname.split('/p/')[1]?.split('/')[0];
          if (!postId) {
            throw new Error('Could not find Instagram post ID');
          }
          embedUrl = `https://www.instagram.com/p/${postId}/embed`;
        }
        // TikTok
        else if (urlObj.hostname.includes('tiktok.com')) {
          const videoId = urlObj.pathname.split('/video/')[1];
          if (!videoId) {
            throw new Error('Could not find TikTok video ID');
          }
          embedUrl = `https://www.tiktok.com/embed/v2/${videoId}`;
        } else {
          throw new Error(
            'Unsupported video platform. We support YouTube, Vimeo, Instagram, and TikTok.'
          );
        }

        const editor = quill.getEditor();
        const selection = editor.getSelection(true) as RangeStatic;

        // 1. Insert newline
        editor.insertText(selection.index, '\n', (Quill as any).sources.USER);

        // 2. Insert embed at next position
        editor.insertEmbed(
          selection.index + 1,
          'video',
          embedUrl,
          (Quill as any).sources.USER
        );

        // 3. Format with dimensions
        editor.formatText(selection.index + 1, 1, {
          height: '170',
          width: '400',
        });

        // 4. Move cursor after embed
        editor.setSelection(
          selection.index + 2,
          0,
          (Quill as any).sources.SILENT
        );

        toast({
          title: 'Success',
          description: 'Video embedded successfully',
        });
      } catch (error) {
        console.error('Video embed failed:', error);
        toast({
          title: 'Error',
          description:
            error instanceof Error
              ? error.message
              : 'Failed to embed video. Please check the URL and try again.',
          variant: 'destructive',
        });
      }

      document.body.removeChild(dialog);
      onClose();
    };

    // Handle upload tab click
    uploadTab.onclick = () => {
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
            editor.insertEmbed(selection.index, 'video', url, 'user');
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
        document.body.removeChild(dialog);
      };
      input.click();
    };

    // Handle dialog close
    dialog.onclick = (e) => {
      if (e.target === dialog) {
        document.body.removeChild(dialog);
        onClose();
      }
    };
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
