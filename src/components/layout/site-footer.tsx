'use client';

import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
        <p className="text-muted-foreground text-center text-sm leading-loose md:text-left">
          Built by{' '}
          <Link
            href="https://github.com/yourusername"
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4"
          >
            Your Name
          </Link>
          . The source code is available on{' '}
          <Link
            href="https://github.com/yourusername/blog-web-app"
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4"
          >
            GitHub
          </Link>
          .
        </p>
        <div className="flex items-center space-x-1">
          <nav className="flex items-center space-x-6 text-sm">
            <Link
              href="/terms"
              className="hover:text-foreground/80 transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="hover:text-foreground/80 transition-colors"
            >
              Privacy
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
