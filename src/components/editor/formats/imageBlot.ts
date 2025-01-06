'use client';

import Quill from 'quill';
import type { BlockBlotConstructor } from './types';

const BlockEmbed = Quill.import('blots/block/embed') as BlockBlotConstructor;

interface ImageValue {
  alt: string;
  url: string;
}

export default class ImageBlot extends BlockEmbed {
  static blotName = 'image';
  static tagName = 'figure';

  static create(value: ImageValue) {
    const node = super.create() as HTMLElement;
    const img = document.createElement('img');
    img.setAttribute('src', value.url);
    img.setAttribute('alt', value.alt);
    img.setAttribute('loading', 'lazy');
    node.appendChild(img);
    return node;
  }

  static value(node: HTMLElement) {
    const img = node.querySelector('img');
    return {
      alt: img?.getAttribute('alt') || '',
      url: img?.getAttribute('src') || '',
    };
  }
}
