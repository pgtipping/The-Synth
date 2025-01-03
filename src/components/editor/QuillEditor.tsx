'use client';

import { useEffect, useRef, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.bubble.css';
import { Button } from '@/components/ui/button';

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function QuillEditor({
  value,
  onChange,
  placeholder,
}: QuillEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);

  // Initialize Quill
  useEffect(() => {
    if (editorRef.current && !quillRef.current) {
      const editor = new Quill(editorRef.current, {
        theme: 'bubble',
        placeholder: placeholder || 'Tell your story...',
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ header: 1 }, { header: 2 }, { header: 3 }],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link', 'image', 'video'],
            ['clean'],
          ],
        },
      });

      editor.on('text-change', () => {
        const content = editor.root.innerHTML;
        onChange(content);
      });

      quillRef.current = editor;
    }

    return () => {
      if (quillRef.current) {
        quillRef.current = null;
      }
    };
  }, []);

  // Update content when value prop changes
  useEffect(() => {
    if (quillRef.current && value !== quillRef.current.root.innerHTML) {
      quillRef.current.root.innerHTML = value;
    }
  }, [value]);

  return (
    <div className="editor-wrapper">
      <div ref={editorRef} className="min-h-[500px] p-4" />
    </div>
  );
}
