'use client';

let formatsRegistered = false;

// Register all formats
async function registerFormats() {
  if (formatsRegistered) return;
  if (typeof window === 'undefined') return; // Skip registration on server-side

  try {
    const { default: Quill } = await import('quill');

    const BoldBlot = (await import('./boldBlot')).default;
    const ItalicBlot = (await import('./italicBlot')).default;
    const LinkBlot = (await import('./linkBlot')).default;
    const BlockquoteBlot = (await import('./blockquoteBlot')).default;
    const HeaderBlot = (await import('./headerBlot')).default;
    const DividerBlot = (await import('./dividerBlot')).default;
    const ImageBlot = (await import('./imageBlot')).default;
    const VideoBlot = (await import('./videoBlot')).default;
    const AudioBlot = (await import('./audioBlot')).default;
    const EmbedBlot = (await import('./embedBlot')).default;

    Quill.register({
      'formats/bold': BoldBlot,
      'formats/italic': ItalicBlot,
      'formats/link': LinkBlot,
      'formats/blockquote': BlockquoteBlot,
      'formats/header': HeaderBlot,
      'formats/divider': DividerBlot,
      'formats/image': ImageBlot,
      'formats/video': VideoBlot,
      'formats/audio': AudioBlot,
      'formats/embed': EmbedBlot,
    });
    formatsRegistered = true;
  } catch (error) {
    console.error('Error registering Quill formats:', error);
  }
}

export default registerFormats;
