'use client';

import ReactQuill from 'react-quill';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import 'react-quill/dist/quill.bubble.css';
import '../../app/styles/editor.css';
import { FloatingToolbar } from './FloatingToolbar';
import { PlusMenu } from './PlusMenu';
import registerFormats from './formats';

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// Dynamically import ReactQuill with no SSR
const ReactQuillComponent = dynamic(
  async () => {
    const { default: RQ } = await import('react-quill');
    return function comp({ forwardedRef, ...props }: any) {
      return <RQ ref={forwardedRef} {...props} />;
    };
  },
  { ssr: false }
);

export default function QuillEditor({
  value,
  onChange,
  placeholder,
}: QuillEditorProps) {
  const quillRef = useRef<ReactQuill>(null);
  const [selection, setSelection] = useState<{
    index: number;
    length: number;
  } | null>(null);

  useEffect(() => {
    if (quillRef.current) {
      const initQuill = async () => {
        // Register formats on the client side
        await registerFormats();

        const quill = quillRef.current;
        if (!quill) return;

        const editor = quill.getEditor();

        // Configure Quill for Medium-like experience
        editor.root.dataset.placeholder = placeholder || 'Tell your story...';

        // Handle selection changes
        editor.on('selection-change', (range) => {
          if (range) {
            // Only update selection if there is a range
            setSelection(range);
          } else {
            // Clear selection when nothing is selected
            setSelection(null);
          }
        });
      };

      initQuill().catch(console.error);
    }
  }, [placeholder]);

  return (
    <>
      <div className="editor-wrapper">
        <ReactQuillComponent
          forwardedRef={quillRef}
          theme="bubble"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="min-h-[500px] p-4"
          modules={{
            toolbar: false,
            keyboard: {
              bindings: {
                tab: false,
                'list autofill': false,
                'hr autofill': false,
                'code block': false,
              },
            },
          }}
          formats={[
            'bold',
            'italic',
            'link',
            'blockquote',
            'header',
            'divider',
            'code-block',
            'image',
            'video',
            'audio',
            'embed',
          ]}
        />

        {quillRef.current && (
          <FloatingToolbar quill={quillRef.current} selection={selection} />
        )}
      </div>
      {quillRef.current && (
        <PlusMenu
          quill={quillRef.current}
          onClose={() => {
            const editor = quillRef.current?.getEditor();
            editor?.focus();
          }}
        />
      )}
    </>
  );
}
