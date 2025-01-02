import Link from 'next/link';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';

// Mock data - replace with API call
const drafts = [
  {
    id: '1',
    title: 'Understanding TypeScript Generics',
    excerpt:
      'A deep dive into TypeScript generics and their practical applications...',
    lastEdited: '2023-12-30',
  },
  {
    id: '2',
    title: 'React Server Components Explained',
    excerpt: 'Everything you need to know about React Server Components...',
    lastEdited: '2023-12-29',
  },
];

export default function DraftsPage() {
  return (
    <MainLayout>
      <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Drafts</h1>
          <Link href="/blog/new">
            <Button>
              <PlusIcon className="icon-sm mr-2" />
              New Post
            </Button>
          </Link>
        </div>

        <div className="space-y-6">
          {drafts.map((draft) => (
            <article
              key={draft.id}
              className="rounded-lg border bg-card p-6 transition-shadow hover:shadow-md"
            >
              <h2 className="mb-2 text-2xl font-semibold">
                <Link
                  href={`/blog/${draft.id}/edit`}
                  className="hover:text-primary"
                >
                  {draft.title}
                </Link>
              </h2>
              <p className="mb-4 text-muted-foreground">{draft.excerpt}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Last edited on {draft.lastEdited}
                </span>
                <div className="flex items-center gap-2">
                  <Link href={`/blog/${draft.id}/edit`}>
                    <Button variant="outline" size="sm">
                      Continue Editing
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
