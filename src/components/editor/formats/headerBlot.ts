'use client';

import Quill from 'quill';
import type { BlockBlotConstructor } from './types';

const Block = Quill.import('blots/block') as BlockBlotConstructor;

export default class HeaderBlot extends Block {
  static blotName = 'header';
  static tagName = ['h1', 'h2', 'h3'];

  static formats(node: HTMLElement) {
    return HeaderBlot.tagName.indexOf(node.tagName.toLowerCase()) + 1;
  }
}
