'use client';

import Quill from 'quill';
import type { BlockBlotConstructor } from './types';

const BlockEmbed = Quill.import('blots/block/embed') as BlockBlotConstructor;

export default class VideoBlot extends BlockEmbed {
  static blotName = 'video';
  static tagName = 'figure';

  static create(url: string) {
    const node = super.create() as HTMLElement;
    const video = document.createElement('video');
    video.setAttribute('src', url);
    video.setAttribute('controls', 'true');
    video.setAttribute('preload', 'metadata');
    video.className = 'w-full rounded-lg';
    node.appendChild(video);
    return node;
  }

  static value(node: HTMLElement) {
    const video = node.querySelector('video');
    return video?.getAttribute('src') || '';
  }
}
