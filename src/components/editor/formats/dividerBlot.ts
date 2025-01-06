'use client';

import Quill from 'quill';
import type { BlockEmbedConstructor } from './types';

const BlockEmbed = Quill.import('blots/block/embed') as BlockEmbedConstructor;

export default class DividerBlot extends BlockEmbed {
  static blotName = 'divider';
  static tagName = 'hr';
}
