'use client';

import Quill from 'quill';
import type { BlockEmbedConstructor } from './types';

const BlockEmbed = Quill.import('blots/block/embed') as BlockEmbedConstructor;

interface VideoFormat {
  height?: string;
  width?: string;
}

export default class VideoBlot extends BlockEmbed {
  static blotName = 'video';
  static tagName = 'iframe';

  static create(url: string) {
    const node = super.create() as HTMLElement;
    node.setAttribute('src', url);
    node.setAttribute('frameborder', '0');
    node.setAttribute('allowfullscreen', 'true');
    return node;
  }

  static formats(node: HTMLElement): VideoFormat {
    // We still need to report unregistered embed formats
    const format: VideoFormat = {};
    if (node.hasAttribute('height')) {
      const height = node.getAttribute('height');
      if (height) format.height = height;
    }
    if (node.hasAttribute('width')) {
      const width = node.getAttribute('width');
      if (width) format.width = width;
    }
    return format;
  }
}
