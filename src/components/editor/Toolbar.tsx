'use client';

import { useState, useRef } from 'react';
import UploadHandler from './UploadHandler';

interface ToolbarProps {
  onFormat: (format: string, value?: any) => void;
  onInsert: (type: 'image' | 'video' | 'audio', url: string) => void;
  onError: (error: string) => void;
}

export default function Toolbar({ onFormat, onInsert, onError }: ToolbarProps) {
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const uploadHandler = UploadHandler({
    onUpload: async (file, type) => {
      // TODO: Implement actual upload logic
      return URL.createObjectURL(file);
    },
    onError,
  });

  const handleFormatClick = (format: string, value?: any) => {
    onFormat(format, value);
  };

  const handleInsertMedia = (type: 'image' | 'video' | 'audio') => {
    uploadHandler.handleFileInput(type, (url) => {
      onInsert(type, url);
    });
  };

  return (
    <div className="toolbar-container">
      <div className="toolbar-main">
        <button onClick={() => handleFormatClick('bold')}>B</button>
        <button onClick={() => handleFormatClick('italic')}>I</button>
        <button onClick={() => handleFormatClick('underline')}>U</button>
        <button onClick={() => handleFormatClick('strike')}>S</button>

        <button onClick={() => handleFormatClick('header', 1)}>H1</button>
        <button onClick={() => handleFormatClick('header', 2)}>H2</button>
        <button onClick={() => handleFormatClick('header', 3)}>H3</button>

        <button onClick={() => handleFormatClick('blockquote')}>"</button>
        <button onClick={() => handleFormatClick('code-block')}>{'</>'}</button>

        <button onClick={() => handleInsertMedia('image')}>Image</button>
        <button onClick={() => handleInsertMedia('video')}>Video</button>
        <button onClick={() => handleInsertMedia('audio')}>Audio</button>

        <button onClick={() => setShowMoreOptions(!showMoreOptions)}>
          More ▼
        </button>
      </div>

      {showMoreOptions && (
        <div className="toolbar-extra">
          <button onClick={() => handleFormatClick('list', 'ordered')}>
            1.
          </button>
          <button onClick={() => handleFormatClick('list', 'bullet')}>•</button>
          <button onClick={() => handleFormatClick('align', 'center')}>
            Center
          </button>
          <button onClick={() => handleFormatClick('align', 'right')}>
            Right
          </button>
          <button onClick={() => handleFormatClick('link')}>Link</button>
          <button onClick={() => handleFormatClick('clean')}>Clear</button>
        </div>
      )}

      <style jsx>{`
        .toolbar-container {
          position: sticky;
          top: 0;
          background: white;
          z-index: 100;
          padding: 0.5rem;
          border-bottom: 1px solid #eaeaea;
        }

        .toolbar-main,
        .toolbar-extra {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-bottom: 0.5rem;
        }

        button {
          background: #f0f0f0;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.2s;
        }

        button:hover {
          background: #ddd;
        }

        button:active {
          background: #ccc;
        }
      `}</style>
    </div>
  );
}
