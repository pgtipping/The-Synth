'use client';

import Quill from 'quill';
import type { BlockBlotConstructor } from './types';

const BlockEmbed = Quill.import('blots/block/embed') as BlockBlotConstructor;

export default class ImageBlot extends BlockEmbed {
  static blotName = 'image';
  static tagName = 'img';

  static create(value: string) {
    const node = super.create() as HTMLElement;

    // Decode HTML entities in the URL (like &amp;)
    const decodedUrl = value.replace(/&amp;/g, '&');
    node.setAttribute('src', decodedUrl);
    node.setAttribute('alt', 'Image');
    node.setAttribute('loading', 'lazy');

    // Add custom class for styling
    node.classList.add('blog-content-image');

    return node;
  }

  static value(node: HTMLElement) {
    return node.getAttribute('src') || '';
  }
}
