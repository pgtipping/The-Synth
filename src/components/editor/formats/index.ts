'use client';

let formatsRegistered = false;

// Register all formats
async function registerFormats() {
  if (formatsRegistered) {
    console.log('Formats already registered');
    return;
  }
  if (typeof window === 'undefined') {
    console.log('Skipping format registration on server-side');
    return;
  }

  try {
    console.log('Starting format registration...');
    const { default: Quill } = await import('quill');

    // Import all blots
    const imports = await Promise.all([
      import('./boldBlot'),
      import('./italicBlot'),
      import('./linkBlot'),
      import('./blockquoteBlot'),
      import('./headerBlot'),
      import('./dividerBlot'),
      import('./imageBlot'),
      import('./videoBlot'),
      import('./audioBlot'),
      import('./embedBlot'),
    ]);

    const [
      BoldBlot,
      ItalicBlot,
      LinkBlot,
      BlockquoteBlot,
      HeaderBlot,
      DividerBlot,
      ImageBlot,
      VideoBlot,
      AudioBlot,
      EmbedBlot,
    ] = imports.map((module) => module.default);

    // Verify each blot before registration
    const blots = {
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
    };

    // Verify each blot has required static properties
    Object.entries(blots).forEach(([name, blot]) => {
      if (!blot.blotName || !blot.tagName) {
        throw new Error(`Invalid blot configuration for ${name}`);
      }
    });

    // Register all blots
    Quill.register(blots);
    formatsRegistered = true;

    // Verify registration by checking if blots can be imported
    const verifyFormats = Object.keys(blots)
      .map((format) => {
        try {
          const blot = Quill.import(format);
          return blot ? format : null;
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    console.log('Successfully registered formats:', verifyFormats);
  } catch (error) {
    console.error('Error registering Quill formats:', error);
    formatsRegistered = false;
    throw error; // Re-throw to handle in component
  }
}

export default registerFormats;
