'use client';

import { logger } from '@/lib/logger';

let formatsRegistered = false;

// Register all formats
async function registerFormats() {
  if (formatsRegistered) {
    logger.info('Formats already registered');
    return;
  }
  if (typeof window === 'undefined') {
    logger.info('Skipping format registration on server-side');
    return;
  }

  try {
    logger.info('Starting format registration...');
    const { default: Quill } = await import('quill');

    // Import blots dynamically based on initial requirements
    const basicBlots = await Promise.all([
      import('./boldBlot'),
      import('./italicBlot'),
      import('./linkBlot'),
      import('./headerBlot'),
    ]);

    // Register basic blots first for faster initial load
    const [BoldBlot, ItalicBlot, LinkBlot, HeaderBlot] = basicBlots.map(
      (module) => module.default
    );

    const basicFormats = {
      'formats/bold': BoldBlot,
      'formats/italic': ItalicBlot,
      'formats/link': LinkBlot,
      'formats/header': HeaderBlot,
    };

    // Register basic formats
    Quill.register(basicFormats);

    // Load and register advanced formats asynchronously
    const advancedBlots = await Promise.all([
      import('./blockquoteBlot'),
      import('./dividerBlot'),
      import('./imageBlot'),
      import('./videoBlot'),
      import('./audioBlot'),
      import('./embedBlot'),
    ]);

    const [
      BlockquoteBlot,
      DividerBlot,
      ImageBlot,
      VideoBlot,
      AudioBlot,
      EmbedBlot,
    ] = advancedBlots.map((module) => module.default);

    const advancedFormats = {
      'formats/blockquote': BlockquoteBlot,
      'formats/divider': DividerBlot,
      'formats/image': ImageBlot,
      'formats/video': VideoBlot,
      'formats/audio': AudioBlot,
      'formats/embed': EmbedBlot,
    };

    // Verify each blot has required static properties
    Object.entries({ ...basicFormats, ...advancedFormats }).forEach(
      ([name, blot]) => {
        if (!blot.blotName || !blot.tagName) {
          throw new Error(`Invalid blot configuration for ${name}`);
        }
      }
    );

    // Register advanced formats
    Quill.register(advancedFormats);
    formatsRegistered = true;

    // Verify registration
    const verifyFormats = Object.keys({ ...basicFormats, ...advancedFormats })
      .map((format) => {
        try {
          const blot = Quill.import(format);
          return blot ? format : null;
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    logger.info('Successfully registered formats:', verifyFormats);
  } catch (error) {
    logger.error('Failed to register format:', error);
    formatsRegistered = false;
    throw error;
  }
}

export default registerFormats;
