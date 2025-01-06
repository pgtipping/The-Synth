'use client';

import Quill from 'quill';
import type { InlineBlotConstructor } from './types';

const Inline = Quill.import('blots/inline') as InlineBlotConstructor;

export default class BoldBlot extends Inline {
  static blotName = 'bold';
  static tagName = 'strong';
}
