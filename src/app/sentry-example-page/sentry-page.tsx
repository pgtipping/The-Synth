'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import * as Sentry from '@sentry/nextjs';

export default function SentryPage() {
  return (
    <MainLayout>
      <div className="container mx-auto max-w-4xl px-4 py-8 md:px-8">
        <h1 className="mb-8 text-3xl font-bold">Sentry Error Testing</h1>

        <div className="space-y-8">
          <section>
            <h2 className="mb-4 text-xl font-semibold">Test Client Error</h2>
            <Button
              variant="outline"
              onClick={() => {
                throw new Error('Client Test Error');
              }}
            >
              Throw Client Error
            </Button>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold">Test API Error</h2>
            <Button
              variant="outline"
              onClick={async () => {
                const res = await fetch('/api/sentry-test-error');
                if (!res.ok) {
                  throw new Error('API Test Error');
                }
              }}
            >
              Throw API Error
            </Button>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold">Manual Error Capture</h2>
            <Button
              variant="outline"
              onClick={() => {
                try {
                  throw new Error('Manual Test Error');
                } catch (error) {
                  Sentry.captureException(error);
                }
              }}
            >
              Capture Manual Error
            </Button>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
