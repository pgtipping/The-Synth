'use client';

import Quill from 'quill';
import type { BlockBlotConstructor } from './types';

const Block = Quill.import('blots/block') as BlockBlotConstructor;

export default class BlockquoteBlot extends Block {
  static blotName = 'blockquote';
  static tagName = 'blockquote';
}
