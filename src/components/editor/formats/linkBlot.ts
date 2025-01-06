'use client';

import Quill from 'quill';
import type { InlineBlotConstructor } from './types';

const Inline = Quill.import('blots/inline') as InlineBlotConstructor;

export default class LinkBlot extends Inline {
  static blotName = 'link';
  static tagName = 'a';

  static create(value: string) {
    const node = super.create() as HTMLElement;
    node.setAttribute('href', value);
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer');
    return node;
  }

  static formats(node: HTMLElement) {
    return node.getAttribute('href');
  }
}
