'use client';

import Quill from 'quill';
import type { BlockBlotConstructor } from './types';

const BlockEmbed = Quill.import('blots/block/embed') as BlockBlotConstructor;

interface EmbedValue {
  url: string;
  html?: string;
}

export default class EmbedBlot extends BlockEmbed {
  static blotName = 'embed';
  static tagName = 'figure';
  static className = 'embed-container';

  static create(value: EmbedValue) {
    const node = super.create() as HTMLElement;
    const wrapper = document.createElement('div');
    wrapper.className = 'embed-wrapper';

    // Handle different embed types
    if (value.url.includes('youtube.com') || value.url.includes('youtu.be')) {
      const videoId = this.getYouTubeVideoId(value.url);
      if (videoId) {
        const iframe = document.createElement('iframe');
        iframe.setAttribute('src', `https://www.youtube.com/embed/${videoId}`);
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allowfullscreen', 'true');
        wrapper.appendChild(iframe);
      }
    } else if (value.url.includes('vimeo.com')) {
      const videoId = this.getVimeoVideoId(value.url);
      if (videoId) {
        const iframe = document.createElement('iframe');
        iframe.setAttribute('src', `https://player.vimeo.com/video/${videoId}`);
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allowfullscreen', 'true');
        wrapper.appendChild(iframe);
      }
    } else if (value.url.includes('twitter.com')) {
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
    const iframe = wrapper?.querySelector('iframe');
    const link = wrapper?.querySelector('a');
    const tweetWrapper = wrapper?.querySelector('[data-tweet-url]');

    if (iframe) {
      return { url: iframe.src };
    } else if (tweetWrapper) {
      return { url: tweetWrapper.getAttribute('data-tweet-url') || '' };
    } else if (link) {
      return { url: link.href };
    }

    return { url: '', html: wrapper?.innerHTML };
  }

  private static getYouTubeVideoId(url: string): string | null {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  }

  private static getVimeoVideoId(url: string): string | null {
    const regExp = /vimeo\.com\/(?:video\/)?([0-9]+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  }
}

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
