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

  // Debug logging
  useEffect(() => {
    if (post) {
      console.log('Full post data:', JSON.stringify(post, null, 2));
      console.log('Categories:', {
        raw: post.categories,
        mapped: post.categories.map((c) => ({ id: c.id, name: c.name })),
        count: post.categories.length,
      });
      console.log('Tags:', {
        raw: post.tags,
        mapped: post.tags.map((t) => ({ id: t.id, name: t.name })),
        count: post.tags.length,
      });
    }
  }, [post]);

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
                    {(post.categories.length > 0 || post.tags.length > 0) && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {post.categories.map((category) => (
                          <Link
                            key={category.id}
                            href={`/blog/category/${category.slug}`}
                            className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary hover:bg-primary/20"
                          >
                            {category.name}
                          </Link>
                        ))}
                        {post.tags.map((tag) => (
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
