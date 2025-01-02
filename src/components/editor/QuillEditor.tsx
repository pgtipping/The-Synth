'use client';

import { useEffect, useRef, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.bubble.css';
import Scratchpad from './Scratchpad';
import Toolbar from './Toolbar';

// Import Quill types
const Block = Quill.import('blots/block') as any;
const Inline = Quill.import('blots/inline') as any;

// Custom Link Blot
class LinkBlot extends Inline {
  static blotName = 'link';
  static tagName = 'a';

  static create(value: string) {
    const node = super.create();
    node.setAttribute('href', value);
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer');
    return node;
  }

  static formats(node: HTMLElement) {
    return node.getAttribute('href');
  }
}

// Custom Image Blot with caption support
class ImageBlot extends Block {
  static blotName = 'image';
  static tagName = 'figure';

  static create(value: { url: string; caption?: string }) {
    const node = super.create();
    const img = document.createElement('img');
    img.setAttribute('src', value.url);
    node.appendChild(img);
    if (value.caption) {
      const caption = document.createElement('figcaption');
      caption.textContent = value.caption;
      node.appendChild(caption);
    }
    return node;
  }

  static value(node: HTMLElement) {
    const img = node.querySelector('img');
    const caption = node.querySelector('figcaption');
    return {
      url: img?.getAttribute('src') || '',
      caption: caption?.textContent || '',
    };
  }
}

// Custom Video Blot
class VideoBlot extends Block {
  static blotName = 'video';
  static tagName = 'figure';

  static create(value: string) {
    const node = super.create();
    const video = document.createElement('video');
    video.setAttribute('src', value);
    video.setAttribute('controls', 'true');
    node.appendChild(video);
    return node;
  }

  static value(node: HTMLElement) {
    const video = node.querySelector('video');
    return video?.getAttribute('src') || '';
  }
}

// Custom Audio Blot
class AudioBlot extends Block {
  static blotName = 'audio';
  static tagName = 'figure';

  static create(value: string) {
    const node = super.create();
    const audio = document.createElement('audio');
    audio.setAttribute('src', value);
    audio.setAttribute('controls', 'true');
    node.appendChild(audio);
    return node;
  }

  static value(node: HTMLElement) {
    const audio = node.querySelector('audio');
    return audio?.getAttribute('src') || '';
  }
}

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onAIChange?: (content: string) => void;
  onToggleAI?: (enabled: boolean) => void;
}

export default function QuillEditor({
  value,
  onChange,
  placeholder,
  onAIChange,
  onToggleAI,
}: QuillEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const [selection, setSelection] = useState<{
    index: number;
    length: number;
  } | null>(null);
  const [aiEnabled, setAiEnabled] = useState(false);

  const handleFormat = (format: string, value?: any) => {
    if (quillRef.current && selection) {
      quillRef.current.format(format, value);
    }
  };

  const handleInsert = (type: 'image' | 'video' | 'audio', url: string) => {
    if (quillRef.current && selection) {
      switch (type) {
        case 'image':
          quillRef.current.insertEmbed(
            selection.index,
            'image',
            { url },
            'user'
          );
          break;
        case 'video':
          quillRef.current.insertEmbed(selection.index, 'video', url, 'user');
          break;
        case 'audio':
          quillRef.current.insertEmbed(selection.index, 'audio', url, 'user');
          break;
      }
    }
  };

  const handleError = (error: string) => {
    alert(error);
  };

  useEffect(() => {
    if (editorRef.current && !quillRef.current) {
      const editor = new Quill(editorRef.current, {
        theme: 'bubble',
        placeholder: placeholder || 'Tell your story...',
        modules: {
          toolbar: false, // Disable default toolbar
          clipboard: {
            matchVisual: false,
          },
          keyboard: {
            bindings: {
              'list autofill': {
                prefix: /^\s*?(\d+\.|-|\*|\[ ?\]|\[x\])$/,
                handler(range: any, context: any) {
                  // Handle list autofill
                },
              },
            },
          },
        },
      });

      // Handle selection change to show/hide toolbar
      editor.on('selection-change', (range) => {
        if (range) {
          setSelection({ index: range.index, length: range.length });
          setShowToolbar(range.length > 0);
        } else {
          setSelection(null);
          setShowToolbar(false);
        }
      });

      // Handle text change
      editor.on('text-change', () => {
        const content = editor.root.innerHTML;
        onChange(content);
      });

      // Set initial content
      if (value) {
        editor.root.innerHTML = value;
      }

      quillRef.current = editor;
    }

    return () => {
      if (quillRef.current) {
        quillRef.current = null;
      }
    };
  }, []);

  const handleImageInsert = () => {
    const url = prompt('Enter image URL or upload:');
    const caption = prompt('Enter image caption (optional):');

    if (url && quillRef.current && selection) {
      quillRef.current.insertEmbed(
        selection.index,
        'image',
        { url, caption },
        'user'
      );
    }
  };

  const handleVideoInsert = () => {
    const url = prompt('Enter video URL or upload:');
    if (url && quillRef.current && selection) {
      quillRef.current.insertEmbed(selection.index, 'video', url, 'user');
    }
  };

  const handleAudioInsert = () => {
    const url = prompt('Enter audio URL or upload:');
    if (url && quillRef.current && selection) {
      quillRef.current.insertEmbed(selection.index, 'audio', url, 'user');
    }
  };

  const handleLinkInsert = () => {
    if (quillRef.current && selection) {
      const url = prompt('Enter link URL:');
      if (url) {
        quillRef.current.format('link', url);
      }
    }
  };

  return (
    <div className="editor-wrapper">
      <Toolbar
        onFormat={handleFormat}
        onInsert={handleInsert}
        onError={handleError}
      />

      <div className="editor-container">
        <div ref={editorRef} />
      </div>

      <Scratchpad
        onContentChange={(content) => {
          if (aiEnabled && onAIChange) {
            onAIChange(content);
          }
        }}
        onToggleAI={(enabled) => {
          setAiEnabled(enabled);
          if (onToggleAI) {
            onToggleAI(enabled);
          }
        }}
        onSystemInstructionChange={(instruction) => {
          // Handle system instruction change
        }}
      />

      <style jsx global>{`
        .editor-wrapper {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .editor-container {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
            'Helvetica Neue', Arial, sans-serif;
          margin-top: 1rem;
          padding: 0 1rem;
        }

        .editor-container .ql-editor {
          padding: 1rem;
          font-size: 1.25rem;
          line-height: 1.6;
        }

        .editor-container .ql-editor p {
          margin-bottom: 1.5rem;
        }

        .editor-container .ql-editor h1 {
          font-size: 2.5rem;
          margin-bottom: 1.5rem;
        }

        .editor-container .ql-editor h2 {
          font-size: 2rem;
          margin-bottom: 1.25rem;
        }

        .editor-container .ql-editor h3 {
          font-size: 1.75rem;
          margin-bottom: 1rem;
        }

        .editor-container .ql-editor blockquote {
          border-left: 4px solid #ddd;
          padding-left: 1rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: #555;
        }

        .editor-container .ql-editor img {
          max-width: 100%;
          margin: 1.5rem 0;
        }

        .editor-container .ql-editor figcaption {
          text-align: center;
          color: #666;
          font-size: 0.875rem;
          margin-top: 0.5rem;
        }

        .editor-container .ql-bubble .ql-tooltip {
          background-color: #000;
          border-radius: 4px;
        }

        .editor-container .ql-bubble .ql-tooltip input[type='text'] {
          background: transparent;
          color: white;
          border: none;
          border-bottom: 1px solid white;
        }

        /* Hide default Quill toolbar */
        .editor-container .ql-toolbar {
          display: none;
        }

        /* Custom floating toolbar */
        .editor-container .ql-bubble .ql-tooltip {
          z-index: 20;
        }

        /* Medium-style placeholder */
        .editor-container .ql-editor.ql-blank::before {
          font-style: normal;
          font-size: 1.5rem;
          color: #999;
          left: 1rem;
        }

        /* Medium-style focus */
        .editor-container .ql-editor:focus {
          outline: none;
        }
      `}</style>
    </div>
  );
}
