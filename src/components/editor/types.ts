import Quill from 'quill';
import type { Range } from 'quill';

export type QuillInstance = Quill;
export type QuillRange = Range | null;

export interface QuillBounds {
  top: number;
  left: number;
  width: number;
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
