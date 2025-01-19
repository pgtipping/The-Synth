'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { NoSSRNav } from './no-ssr-nav';

interface MainLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function MainLayout({ children, className, ...props }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4 md:px-8">
          <Link href="/" className="text-lg font-semibold">
            Cozy Corner
          </Link>
          <NoSSRNav />
        </div>
      </header>

      <main className={cn('w-full', className)} {...props}>
        {children}
      </main>
    </div>
  );
}
