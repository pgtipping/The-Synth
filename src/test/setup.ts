import { beforeAll } from 'vitest';
import { Window } from 'happy-dom';

// Set up window object for tests
beforeAll(() => {
  const window = new Window();
  global.window = window as unknown as Window & typeof globalThis;
  global.document = window.document as unknown as Document;
  global.navigator = window.navigator as unknown as Navigator;
});
