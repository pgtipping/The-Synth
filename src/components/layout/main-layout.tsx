'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { PlusIcon } from '@radix-ui/react-icons';

interface MainLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function MainLayout({ children, className, ...props }: MainLayoutProps) {
  const { data: session, status } = useSession();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4 md:px-8">
          <Link href="/" className="text-lg font-semibold">
            Cozy Corner
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/category/travel"
              className="text-muted-foreground hover:text-foreground"
            >
              Travel Tips
            </Link>
            <Link
              href="/category/cooking"
              className="text-muted-foreground hover:text-foreground"
            >
              Cooking Recipes
            </Link>
            <Link
              href="/category/lifestyle"
              className="text-muted-foreground hover:text-foreground"
            >
              Lifestyle Hacks
            </Link>
            {session ? (
              <>
                <Link
                  href="/drafts"
                  className="text-muted-foreground hover:text-foreground"
                >
                  My Drafts
                </Link>
                <Button asChild size="sm">
                  <Link href="/blog/new">
                    <PlusIcon className="mr-2 h-4 w-4" />
                    New Post
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => signOut()}>
                  Sign Out
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={() => signIn()}>
                Sign In
              </Button>
            )}
          </nav>
        </div>
      </header>

      <main className={cn('w-full', className)} {...props}>
        {children}
      </main>
    </div>
  );
}
