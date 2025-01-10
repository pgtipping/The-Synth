'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { PostActions } from '@/components/blog/post-actions';

export default function BlogPost({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const {
    data: post,
    isLoading,
    error,
    refetch,
  } = trpc.posts.getPostById.useQuery({ id: params.id });

  // Handle errors in useEffect to prevent re-renders
  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load post. Please try again.',
      });
    }
  }, [error, toast]);

  // Calculate read time (rough estimate: 200 words per minute)
  const wordCount = post?.content?.split(/\s+/).length ?? 0;
  const readTime = Math.ceil(wordCount / 200);

  return (
    <MainLayout>
      <div className="bg-gray-50/50 dark:bg-gray-900/50">
        <article className="mx-auto max-w-[700px] px-4 py-12 md:px-8">
          {isLoading ? (
            <div className="animate-pulse space-y-8">
              <div className="h-8 w-48 rounded bg-muted" />
              <div className="h-96 rounded-lg bg-muted shadow-sm" />
            </div>
          ) : !post ? (
            <div className="rounded-lg bg-background p-8 text-center shadow-sm">
              <h1 className="text-2xl font-bold">Post not found</h1>
              <p className="mt-2 text-muted-foreground">
                The post you're looking for doesn't exist or you don't have
                permission to view it.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-8 flex items-center justify-between">
                <Link href="/" className="nav-button">
                  <ArrowLeftIcon className="icon-sm mr-2" />
                  Back to Posts
                </Link>
                {session?.user?.id === post.authorId && (
                  <PostActions
                    postId={post.id}
                    published={post.published}
                    onPublishToggle={refetch}
                  />
                )}
              </div>

              <div className="overflow-hidden rounded-lg bg-background shadow-sm">
                <div className="border-b bg-muted/30 px-4 py-6">
                  <div className="space-y-4">
                    <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
                      {post.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                      <span>By {post.author?.name || 'Anonymous'}</span>
                      <span>•</span>
                      <span>
                        {format(new Date(post.createdAt), 'MMMM d, yyyy')}
                      </span>
                      <span>•</span>
                      <span>{readTime} min read</span>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          post.published
                            ? 'bg-green-100 text-green-700 dark:bg-green-700/20 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-700/20 dark:text-yellow-400'
                        }`}
                      >
                        {post.published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-2">
                  <div
                    className="prose prose-lg prose-gray dark:prose-invert mx-auto max-w-[700px]"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />
                </div>
              </div>
            </>
          )}
        </article>
      </div>
    </MainLayout>
  );
}
