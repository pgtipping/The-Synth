'use client';

import * as React from 'react';
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { QuillInstance, QuillRange } from './types';
import type { Range, EmitterSource } from 'quill';
import Delta from 'quill-delta';
import 'react-quill-new/dist/quill.core.css';
import '../../app/styles/editor.css';
import { FloatingToolbar } from './FloatingToolbar';
import { PlusMenu } from './PlusMenu';
import registerFormats from './formats';

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// Memoize the ReactQuill component wrapper
const ReactQuillComponent = dynamic(
  async () => {
    await registerFormats();
    const { default: RQ } = await import('react-quill-new');
    const MemoizedQuill = React.memo(function QuillWithRef(props: any) {
      const editorRef = useRef<any>(null);
      return <RQ ref={editorRef} {...props} />;
    });
    return MemoizedQuill;
  },
  { ssr: false }
);

export default function QuillEditor({
  value,
  onChange,
  placeholder,
}: QuillEditorProps) {
  const editorRef = useRef<any>(null);
  const [quill, setQuill] = useState<QuillInstance | null>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [isContentSet, setIsContentSet] = useState(false);
  const mountedRef = useRef(true);

  // Memoize the editor configuration
  const editorConfig = useMemo(
    () => ({
      theme: 'bubble',
      placeholder: placeholder || 'Write your blog post...',
      modules: {
        clipboard: {
          matchVisual: false,
        },
        keyboard: {
          bindings: {
            tab: false,
            enter: {
              key: 13,
              handler: () => true,
            },
          },
        },
        toolbar: false,
        history: {
          delay: 1000,
          maxStack: 100,
          userOnly: true,
        },
      },
      className: 'editor-wrapper',
      preserveWhitespace: true,
    }),
    [placeholder]
  );

  // Initialize editor with cleanup
  useEffect(() => {
    if (!editorRef.current) return;

    let isMounted = true;
    const editor = editorRef.current;

    const initializeEditor = () => {
      try {
        const quillInstance = editor.getEditor();
        if (
          quillInstance?.root &&
          document.contains(quillInstance.root) &&
          isMounted
        ) {
          setQuill(quillInstance);
          setIsEditorReady(true);
        }
      } catch (error) {
        console.error('Failed to initialize editor:', error);
      }
    };

    // Initialize immediately and after a short delay
    initializeEditor();
    const timer = setTimeout(initializeEditor, 100);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  // Handle content updates
  useEffect(() => {
    if (!quill || !isEditorReady || isContentSet || !mountedRef.current) return;

    try {
      // Ensure we only set content once when editor is ready
      setIsContentSet(true);

      // Set initial content with a slight delay to ensure editor is ready
      const timer = setTimeout(() => {
        if (!mountedRef.current) return;

        try {
          const contents = value ? JSON.parse(value) : { ops: [] };
          const delta = new Delta(contents);
          quill.setContents(delta);
        } catch (error) {
          console.error('Failed to set initial content:', error);
          quill.setContents(new Delta({ ops: [] }));
        }
      }, 100);

      return () => {
        clearTimeout(timer);
      };
    } catch (error) {
      console.error('Error in content update effect:', error);
    }
  }, [quill, isEditorReady, value, isContentSet]);

  // Handle editor changes
  useEffect(() => {
    if (!quill || !isEditorReady || !mountedRef.current) return;

    const handleChange = () => {
      if (onChange && mountedRef.current) {
        try {
          const contents = quill.getContents();
          onChange(JSON.stringify(contents));
        } catch (error) {
          console.error('Failed to handle editor change:', error);
        }
      }
    };

    quill.on('text-change', handleChange);
    return () => {
      quill.off('text-change', handleChange);
    };
  }, [quill, isEditorReady, onChange]);

  return (
    <div className="relative min-h-[500px] w-full">
      {isEditorReady && quill && (
        <>
          <FloatingToolbar selection={null} quill={quill} />
          <PlusMenu quill={quill} />
        </>
      )}
      <ReactQuillComponent ref={editorRef} {...editorConfig} />
    </div>
  );
}
