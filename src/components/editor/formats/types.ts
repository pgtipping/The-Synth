import type Delta from 'quill-delta';

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

export interface BlotConstructor {
  new (): {
    domNode: Node;
    attach(): void;
    detach(): void;
    format(name: string, value: unknown): void;
  };
  blotName: string;
  tagName: string | string[];
  create: (value: string | Record<string, unknown>) => Node;
  formats?: (domNode: Node) => Record<string, unknown>;
}

export interface InlineBlotConstructor extends BlotConstructor {
  scope: number;
  formats: (domNode: Node) => Record<string, unknown>;
}

export interface BlockBlotConstructor extends BlotConstructor {
  scope: number;
  formats: (domNode: Node) => Record<string, unknown>;
}

export interface BlockEmbedConstructor extends BlotConstructor {
  scope: number;
  value: (domNode: Node) => string | Record<string, unknown>;
}

// Instead of extending Quill, we'll define our own interface
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
  getFormat: (range: QuillRange) => QuillFormats;
  format: (format: string, value: boolean | number | string | null) => void;
  getSelection: (focus?: boolean) => QuillRange | null;
  getLine: (
    index: number
  ) => [{ offset: () => number; length: () => number }, number];
  getText: (index: number, length: number) => string;
  insertText: (index: number, text: string, source?: string) => Delta;
  insertEmbed: (
    index: number,
    type: string,
    value: string,
    source?: string
  ) => Delta;
  setSelection: (index: number, length: number, source?: string) => void;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  off: (event: string, handler: (...args: unknown[]) => void) => void;
}
