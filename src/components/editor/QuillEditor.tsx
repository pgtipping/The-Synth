'use client';

import * as React from 'react';
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { QuillInstance, QuillRange } from './types';
import type { Range, EmitterSource } from 'quill';
import type ReactQuill from 'react-quill-new';
import Delta from 'quill-delta';
import 'react-quill-new/dist/quill.core.css';
import '../../app/styles/editor.css';
import { FloatingToolbar } from './FloatingToolbar';
import { PlusMenu } from './PlusMenu';
import { AIToolbar } from './AIToolbar';
import registerFormats from './formats';
import { isFeatureEnabled } from '@/lib/features';
import { EditorErrorBoundary } from './EditorErrorBoundary';

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

interface ReactQuillProps extends QuillEditorProps {
  theme: string;
  modules: Record<string, unknown>;
  className: string;
  preserveWhitespace: boolean;
  readOnly: boolean;
  ref?: React.Ref<ReactQuill>;
}

// Separate core Quill imports with fallback
const importQuillCore = async () => {
  try {
    if (isFeatureEnabled('OPTIMIZED_QUILL_IMPORT')) {
      const startTime = performance.now();

      const { default: Quill } = await import('quill/core');
      const { default: Clipboard } = await import('quill/modules/clipboard');
      const { default: History } = await import('quill/modules/history');
      const { default: Keyboard } = await import('quill/modules/keyboard');

      Quill.register({
        'modules/clipboard': Clipboard,
        'modules/history': History,
        'modules/keyboard': Keyboard,
      });

      const loadTime = performance.now() - startTime;
      console.log(`Optimized Quill load time: ${loadTime}ms`);

      return Quill;
    } else {
      // Use standard import as fallback
      const { default: Quill } = await import('quill');
      return Quill;
    }
  } catch (error) {
    console.error('Failed to load Quill core:', error);
    // Fallback to full Quill import
    const { default: Quill } = await import('quill');
    return Quill;
  }
};

// Separate format registration for better code splitting
const registerQuillFormats = async () => {
  if (typeof window === 'undefined') return;

  const startTime = performance.now();
  try {
    await registerFormats();
    const registerTime = performance.now() - startTime;
    console.log(`Format registration time: ${registerTime}ms`);
  } catch (error: unknown) {
    console.error('Format registration failed:', error);
    if (window?.Sentry && error instanceof Error) {
      window.Sentry.captureException(error);
    }
  }
};

// Memoize the ReactQuill component wrapper with optimized imports
const ReactQuillComponent = dynamic(
  async () => {
    const startTime = performance.now();

    try {
      // Import core Quill first
      await importQuillCore();

      // Register formats in parallel with React-Quill import
      const [_, { default: RQ }] = await Promise.all([
        registerQuillFormats(),
        import('react-quill-new'),
      ]);

      const loadTime = performance.now() - startTime;
      console.log(`Total editor load time: ${loadTime}ms`);

      // Return a simple wrapper component
      return function QuillWrapper(props: any) {
        return <RQ {...props} />;
      };
    } catch (error: unknown) {
      console.error('Failed to initialize editor:', error);
      if (window?.Sentry && error instanceof Error) {
        window.Sentry.captureException(error);
      }
      throw error; // Let error boundary handle it
    }
  },
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[500px] animate-pulse rounded-lg border bg-muted" />
    ),
  }
);

// Memoize keyboard bindings
const keyboardBindings = {
  tab: false,
  enter: {
    key: 13,
    handler: () => true,
  },
} as const;

// Memoize module configuration
const editorModules = {
  clipboard: {
    matchVisual: false,
  },
  keyboard: {
    bindings: keyboardBindings,
  },
  toolbar: false,
  history: {
    delay: 1000,
    maxStack: 100,
    userOnly: true,
  },
} as const;

export default function QuillEditor({
  value,
  onChange,
  placeholder,
}: QuillEditorProps) {
  const editorRef = useRef<ReactQuill>(null);
  const [quill, setQuill] = useState<QuillInstance | null>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [isContentSet, setIsContentSet] = useState(false);
  const [selection, setSelection] = useState<QuillRange | null>(null);
  const mountedRef = useRef(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Memoize the editor configuration
  const editorConfig = useMemo(
    () => ({
      value,
      onChange,
      theme: 'bubble',
      placeholder: placeholder || 'Write your blog post...',
      modules: editorModules,
      className: 'editor-wrapper',
      preserveWhitespace: true,
      readOnly: false,
      ref: editorRef,
    }),
    [value, onChange, placeholder]
  );

  // Initialize editor with cleanup
  useEffect(() => {
    if (!editorRef.current) return;

    let isMounted = true;
    const editor = editorRef.current;

    const initializeEditor = () => {
      try {
        console.log('Editor Debug: Initializing editor...');
        const quillInstance = editor.getEditor();
        if (
          quillInstance?.root &&
          document.contains(quillInstance.root) &&
          isMounted
        ) {
          console.log('Editor Debug: Editor instance found and mounted');
          // Ensure the editor is enabled and focusable
          quillInstance.root.setAttribute('contenteditable', 'true');
          quillInstance.enable(true);
          setQuill(quillInstance);
          setIsEditorReady(true);

          // Focus the editor after initialization
          setTimeout(() => {
            if (isMounted && quillInstance.root) {
              quillInstance.root.focus();
            }
          }, 100);
        }
      } catch (error: unknown) {
        console.error(
          'Failed to initialize editor:',
          error instanceof Error ? error.message : 'Unknown error'
        );
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

  // Handle selection changes
  useEffect(() => {
    if (!quill || !isEditorReady || !mountedRef.current) return;

    console.log('Editor Debug: Setting up selection handler');

    const handleSelection = (...args: unknown[]) => {
      const range = args[0] as QuillRange | null;
      console.log('Editor Debug: Selection changed:', range);
      setSelection(range);
    };

    quill.on('selection-change', handleSelection);
    return () => {
      quill.off('selection-change', handleSelection);
    };
  }, [quill, isEditorReady]);

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

    console.log('Editor Debug: Initializing editor event handlers');

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
    <EditorErrorBoundary>
      <div
        ref={containerRef}
        className="relative min-h-[500px] w-full"
        style={{ cursor: 'text' }}
        onClick={() => {
          if (quill?.root) {
            quill.root.focus();
          }
        }}
      >
        {isEditorReady && quill && (
          <>
            <FloatingToolbar selection={selection} quill={quill} />
            <PlusMenu quill={quill} />
            <AIToolbar quill={quill} />
          </>
        )}
        <ReactQuillComponent {...editorConfig} />
      </div>
    </EditorErrorBoundary>
  );
}
