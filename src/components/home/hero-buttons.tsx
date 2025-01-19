'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';

export function HeroButtons() {
  return (
    <div className="flex items-center gap-4">
      <Link href="/blog/new" className="inline-block">
        <Button size="lg" className="gap-2">
          <PlusIcon className="h-5 w-5" />
          Start Writing
        </Button>
      </Link>
      <Button
        variant="outline"
        size="lg"
        onClick={() => {
          document
            .getElementById('latest-posts')
            ?.scrollIntoView({ behavior: 'smooth' });
        }}
      >
        Explore Posts
      </Button>
    </div>
  );
}
