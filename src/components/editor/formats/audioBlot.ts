'use client';

import Quill from 'quill';
import type { BlockBlotConstructor } from './types';

const BlockEmbed = Quill.import('blots/block/embed') as BlockBlotConstructor;

export default class AudioBlot extends BlockEmbed {
  static blotName = 'audio';
  static tagName = 'figure';

  static create(url: string) {
    const node = super.create() as HTMLElement;
    const audio = document.createElement('audio');
    audio.setAttribute('src', url);
    audio.setAttribute('controls', 'true');
    audio.setAttribute('preload', 'metadata');
    audio.className = 'w-full';
    node.appendChild(audio);
    return node;
  }

  static value(node: HTMLElement) {
    const audio = node.querySelector('audio');
    return audio?.getAttribute('src') || '';
  }
}
