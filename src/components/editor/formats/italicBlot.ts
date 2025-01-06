'use client';

import Quill from 'quill';
import type { InlineBlotConstructor } from './types';

const Inline = Quill.import('blots/inline') as InlineBlotConstructor;

export default class ItalicBlot extends Inline {
  static blotName = 'italic';
  static tagName = 'em';
}
