'use client';

import Link from 'next/link';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';

interface Draft {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  categories: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  tags: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

export default function DraftsPage() {
  const { toast } = useToast();
  const utils = trpc.useUtils();
  const { data: draftsData, isLoading } = trpc.posts.getDrafts.useQuery({});

  const deleteDraft = trpc.posts.deleteDraft.useMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Draft deleted successfully',
      });
      utils.posts.getDrafts.invalidate();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete draft. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleDelete = async (id: string) => {
    deleteDraft.mutate({ id });
  };

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
          {isLoading ? (
            <div className="space-y-6">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-lg border bg-card p-6"
                >
                  <div className="mb-2 h-8 w-2/3 rounded bg-muted" />
                  <div className="mb-4 h-4 w-full rounded bg-muted" />
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-32 rounded bg-muted" />
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-32 rounded bg-muted" />
                      <div className="h-8 w-20 rounded bg-muted" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : draftsData?.items.length === 0 ? (
            <div className="rounded-lg border bg-card p-8 text-center">
              <h2 className="text-xl font-semibold">No drafts yet</h2>
              <p className="text-muted-foreground">
                You haven&apos;t created any drafts yet. Click &quot;New
                Post&quot; to get started.
              </p>
            </div>
          ) : (
            draftsData?.items.map((draft: Draft) => (
              <article
                key={draft.id}
                className="rounded-lg border bg-card p-6 transition-shadow hover:shadow-md"
              >
                <h2 className="mb-2 text-2xl font-semibold">
                  <Link
                    href={`/drafts/${draft.id}/edit`}
                    className="hover:text-primary"
                  >
                    {draft.title}
                  </Link>
                </h2>
                <div
                  className="prose-sm mb-4 text-muted-foreground"
                  dangerouslySetInnerHTML={{
                    __html: draft.content.substring(0, 200) + '...',
                  }}
                />
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-2">
                    <span className="text-sm text-muted-foreground">
                      Last edited on{' '}
                      {format(new Date(draft.updatedAt), 'MMM d, yyyy')}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {draft.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {draft.categories.map((category) => (
                            <Link
                              key={category.id}
                              href={`/blog/category/${category.slug}`}
                              className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/20"
                            >
                              {category.name}
                            </Link>
                          ))}
                        </div>
                      )}
                      {draft.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {draft.tags.map((tag) => (
                            <Link
                              key={tag.id}
                              href={`/blog/tag/${tag.slug}`}
                              className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                              #{tag.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/drafts/${draft.id}/edit`}>
                      <Button variant="outline" size="sm">
                        Continue Editing
                      </Button>
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10"
                        >
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Draft</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this draft? This
                            action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(draft.id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
}
