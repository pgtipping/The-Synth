import { performance } from 'perf_hooks';
import { describe, it, expect, vi } from 'vitest';
import { isFeatureEnabled } from '@/lib/features';

// Mock window.Sentry
global.window = {
  Sentry: {
    captureException: vi.fn(),
  },
} as any;

describe('Editor Performance Tests', () => {
  it('Standard Import Performance', async () => {
    const startTime = performance.now();
    const { default: Quill } = await import('quill');
    const standardImportTime = performance.now() - startTime;

    console.log(
      `Standard Quill Import Time: ${standardImportTime.toFixed(2)}ms`
    );
    expect(standardImportTime).toBeLessThan(2000); // Standard import should be under 2s
  });

  it('Optimized Import Performance', async () => {
    vi.stubEnv('NEXT_PUBLIC_OPTIMIZED_QUILL_IMPORT', 'true');

    const startTime = performance.now();
    const { default: Quill } = await import('quill/core');
    const { default: Clipboard } = await import('quill/modules/clipboard');
    const { default: History } = await import('quill/modules/history');
    const { default: Keyboard } = await import('quill/modules/keyboard');

    Quill.register({
      'modules/clipboard': Clipboard,
      'modules/history': History,
      'modules/keyboard': Keyboard,
    });

    const optimizedImportTime = performance.now() - startTime;

    console.log(
      `Optimized Quill Import Time: ${optimizedImportTime.toFixed(2)}ms`
    );
    expect(optimizedImportTime).toBeLessThan(1000); // Optimized import should be under 1s
  });

  it('Format Registration Performance', async () => {
    const startTime = performance.now();
    const { default: registerFormats } = await import('../formats');
    await registerFormats();
    const registerTime = performance.now() - startTime;

    console.log(`Format Registration Time: ${registerTime.toFixed(2)}ms`);
    expect(registerTime).toBeLessThan(500); // Format registration should be under 500ms
  });

  it('Performance Improvements', async () => {
    // Standard import
    const startTime1 = performance.now();
    const { default: StandardQuill } = await import('quill');
    const standardImportTime = performance.now() - startTime1;

    // Optimized import
    vi.stubEnv('NEXT_PUBLIC_OPTIMIZED_QUILL_IMPORT', 'true');
    const startTime2 = performance.now();
    const { default: OptimizedQuill } = await import('quill/core');
    const { default: Clipboard } = await import('quill/modules/clipboard');
    const { default: History } = await import('quill/modules/history');
    const { default: Keyboard } = await import('quill/modules/keyboard');

    OptimizedQuill.register({
      'modules/clipboard': Clipboard,
      'modules/history': History,
      'modules/keyboard': Keyboard,
    });
    const optimizedImportTime = performance.now() - startTime2;

    // Format registration
    const startTime3 = performance.now();
    const { default: registerFormats } = await import('../formats');
    await registerFormats();
    const registerTime = performance.now() - startTime3;

    const improvement =
      ((standardImportTime - optimizedImportTime) / standardImportTime) * 100;

    console.log('\nPerformance Summary:');
    console.log('-------------------');
    console.log(`Standard Import: ${standardImportTime.toFixed(2)}ms`);
    console.log(`Optimized Import: ${optimizedImportTime.toFixed(2)}ms`);
    console.log(`Format Registration: ${registerTime.toFixed(2)}ms`);
    console.log(`Import Time Improvement: ${improvement.toFixed(2)}%`);

    expect(improvement).toBeGreaterThan(30); // Should show at least 30% improvement
  });

  it('Memory Usage', () => {
    const used = process.memoryUsage();

    console.log('\nMemory Usage:');
    console.log('-------------');
    console.log(`Heap Used: ${(used.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Heap Total: ${(used.heapTotal / 1024 / 1024).toFixed(2)} MB`);
    console.log(`RSS: ${(used.rss / 1024 / 1024).toFixed(2)} MB`);

    expect(used.heapUsed / 1024 / 1024).toBeLessThan(100); // Heap usage should be under 100MB
  });
});
