import type Quill from 'quill';

export interface BlotConstructor {
  new (): any;
  blotName: string;
  tagName: string | string[];
  create(value?: any): Node;
  formats?(node: HTMLElement): any;
}

export interface InlineBlotConstructor extends BlotConstructor {
  scope: number;
}

export interface BlockBlotConstructor extends BlotConstructor {
  scope: number;
  formats(node: HTMLElement): any;
}

export interface BlockEmbedConstructor extends BlotConstructor {
  scope: number;
  value(node: HTMLElement): any;
}

export interface QuillEditor extends Quill {
  root: HTMLDivElement;
}
