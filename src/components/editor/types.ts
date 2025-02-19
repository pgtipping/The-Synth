import type Delta from 'quill-delta';
import type { Range } from 'quill';

export interface QuillInstance {
  root: HTMLDivElement;
  scroll: {
    domNode: Node;
    descendants: (predicate: (blot: unknown) => boolean) => unknown[];
  };
  getBounds: (
    index: number,
    length: number
  ) => { top: number; left: number; width: number };
  getFormat: (range: Range) => QuillFormats;
  format: (format: string, value: boolean | number | string | null) => void;
  formatText: (
    index: number,
    length: number,
    format: string,
    value: boolean | number | string | null
  ) => void;
  formatLine: (
    index: number,
    length: number,
    format: string,
    value: boolean | number | string | null
  ) => void;
  removeFormat: (index: number, length: number) => void;
  getSelection: (focus?: boolean) => Range | null;
  getLine: (
    index: number
  ) => [{ offset: () => number; length: () => number }, number];
  getText: (index: number, length: number) => string;
  insertText: (index: number, text: string, source?: QuillSource) => Delta;
  insertEmbed: (
    index: number,
    type: string,
    value: string,
    source?: QuillSource
  ) => Delta;
  setSelection: (index: number, length: number, source?: QuillSource) => void;
  deleteText: (index: number, length: number, source?: QuillSource) => Delta;
  getContents: (index?: number, length?: number) => Delta;
  setContents: (delta: Delta, source?: QuillSource) => Delta;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  off: (event: string, handler: (...args: unknown[]) => void) => void;
}

export interface QuillRange {
  index: number;
  length: number;
}

export interface QuillFormats {
  header?: 1 | 2 | 3;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  link?: string;
  'code-block'?: boolean;
  blockquote?: boolean;
  strike?: boolean;
}

export type QuillSource = 'user' | 'api' | 'silent';
