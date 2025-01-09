'use client';

import Quill from 'quill';
import type { BlockEmbedConstructor } from './types';

const BlockEmbed = Quill.import('blots/block/embed') as BlockEmbedConstructor;

interface EmbedValue {
  url: string;
  html?: string;
}

class EmbedBlot extends BlockEmbed {
  static blotName = 'embed';
  static tagName = 'figure';
  static className = 'embed-container';

  static create(value: EmbedValue) {
    const node = super.create() as HTMLElement;
    const wrapper = document.createElement('div');
    wrapper.className = 'embed-wrapper';

    // Handle different embed types
    if (value.url.includes('twitter.com')) {
      // For tweets, we'll need to load the Twitter widget script
      const tweetWrapper = document.createElement('div');
      tweetWrapper.setAttribute('data-tweet-url', value.url);
      wrapper.appendChild(tweetWrapper);

      // Load Twitter widget if not already loaded
      if (!window.twttr) {
        const script = document.createElement('script');
        script.src = 'https://platform.twitter.com/widgets.js';
        document.head.appendChild(script);
      }

      // Render tweet once Twitter widget is loaded
      if (window.twttr) {
        window.twttr.widgets.load(wrapper);
      }
    } else if (value.html) {
      // For other embeds that provide HTML
      wrapper.innerHTML = value.html;
    } else {
      // Fallback to a link
      const link = document.createElement('a');
      link.href = value.url;
      link.textContent = value.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      wrapper.appendChild(link);
    }

    node.appendChild(wrapper);
    return node;
  }

  static value(node: HTMLElement): EmbedValue {
    const wrapper = node.querySelector('.embed-wrapper');
    const link = wrapper?.querySelector('a');
    const tweetWrapper = wrapper?.querySelector('[data-tweet-url]');

    if (tweetWrapper) {
      return { url: tweetWrapper.getAttribute('data-tweet-url') || '' };
    } else if (link) {
      return { url: link.href };
    }

    return { url: '', html: wrapper?.innerHTML };
  }
}

export default EmbedBlot;

// Add types for Twitter widget
declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: (element?: HTMLElement) => void;
      };
    };
  }
}
