'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import {
  PlusIcon,
  Pencil2Icon,
  TrashIcon,
  EyeOpenIcon,
} from '@radix-ui/react-icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { useSession } from 'next-auth/react';

export default function DraftsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [orderBy, setOrderBy] = useState<'updatedAt' | 'createdAt' | 'title'>(
    'updatedAt'
  );
  const [orderDir, setOrderDir] = useState<'desc' | 'asc'>('desc');

  const {
    data: draftsData,
    isLoading: draftsLoading,
    error: draftsError,
    refetch,
  } = trpc.posts.getDrafts.useQuery(
    {
      orderBy,
      orderDir,
    },
    {
      enabled: status === 'authenticated',
    }
  );

  const deleteDraft = trpc.posts.deleteDraft.useMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Draft deleted successfully',
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete draft',
        variant: 'destructive',
      });
    },
  });

  // Handle errors in useEffect to prevent re-renders
  useEffect(() => {
    if (draftsError) {
      toast({
        title: 'Error',
        description: 'Failed to load drafts. Please try again.',
        variant: 'destructive',
      });
    }
  }, [draftsError, toast]);

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        {status === 'loading' ? (
          <div className="flex items-center justify-center">
            <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-primary" />
          </div>
        ) : status === 'unauthenticated' ? (
          // Handle this case in the UI instead of redirecting
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <h2 className="mb-2 text-xl font-semibold">Sign in Required</h2>
            <p className="mb-4 text-muted-foreground">
              Please sign in to view your drafts
            </p>
            <Button asChild>
              <Link href="/api/auth/signin">Sign In</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-8 flex items-center justify-between">
              <h1 className="text-3xl font-bold">My Drafts</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Select
                    value={orderBy}
                    onValueChange={(value) =>
                      setOrderBy(value as typeof orderBy)
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="updatedAt">Last Updated</SelectItem>
                      <SelectItem value="createdAt">Created Date</SelectItem>
                      <SelectItem value="title">Title</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={orderDir}
                    onValueChange={(value) =>
                      setOrderDir(value as typeof orderDir)
                    }
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Order" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">Newest</SelectItem>
                      <SelectItem value="asc">Oldest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button asChild>
                  <Link href="/blog/new">
                    <PlusIcon className="mr-2 h-4 w-4" />
                    New Post
                  </Link>
                </Button>
              </div>
            </div>

            {draftsLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="space-y-2">
                      <div className="h-4 w-3/4 rounded bg-muted" />
                      <div className="h-3 w-1/2 rounded bg-muted" />
                    </CardHeader>
                    <CardContent>
                      <div className="h-20 rounded bg-muted" />
                    </CardContent>
                    <CardFooter>
                      <div className="h-9 w-full rounded bg-muted" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : !draftsData?.items.length ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <h2 className="mb-2 text-xl font-semibold">No drafts yet</h2>
                <p className="mb-4 text-muted-foreground">
                  Start writing your first blog post
                </p>
                <Button asChild>
                  <Link href="/blog/new">
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Create New Post
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {draftsData?.items.map((draft) => (
                  <Card key={draft.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="line-clamp-2">
                          {draft.title}
                        </CardTitle>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            draft.published
                              ? 'bg-green-100 text-green-700 dark:bg-green-700/20 dark:text-green-400'
                              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-700/20 dark:text-yellow-400'
                          }`}
                        >
                          {draft.published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <CardDescription>
                        Last updated {format(new Date(draft.updatedAt), 'PPp')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div
                        className="line-clamp-3 text-sm text-muted-foreground"
                        dangerouslySetInnerHTML={{
                          __html: draft.content.substring(0, 150) + '...',
                        }}
                      />
                    </CardContent>
                    <CardFooter className="justify-between">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/blog/${draft.id}/edit`}>
                            <Pencil2Icon className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link
                            href={`/blog/preview/${draft.id}`}
                            target="_blank"
                          >
                            <EyeOpenIcon className="mr-2 h-4 w-4" />
                            Preview
                          </Link>
                        </Button>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <TrashIcon className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete your draft.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                deleteDraft.mutate({ id: draft.id })
                              }
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}
