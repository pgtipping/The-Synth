'use client';

import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { PlusIcon } from '@radix-ui/react-icons';
import { useState, useEffect } from 'react';

export function NavigationMenu() {
  const [mounted, setMounted] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Static links that are always shown
  const staticLinks = (
    <>
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
    </>
  );

  if (!mounted) {
    return (
      <nav className="flex items-center space-x-6 text-sm font-medium">
        {staticLinks}
      </nav>
    );
  }

  return (
    <nav className="flex items-center space-x-6 text-sm font-medium">
      {staticLinks}
      {session ? (
        <>
          <Link
            href="/drafts"
            className="text-muted-foreground hover:text-foreground"
          >
            My Drafts
          </Link>
          <Link href="/blog/new" className="inline-block">
            <Button size="sm">
              <PlusIcon className="mr-2 h-4 w-4" />
              New Post
            </Button>
          </Link>
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
  );
}
