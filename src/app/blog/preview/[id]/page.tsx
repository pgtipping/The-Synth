'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { useToast } from '@/components/ui/use-toast';

export default function PreviewPost({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const {
    data: post,
    isLoading,
    error,
  } = trpc.posts.getPostById.useQuery({ id: params.id });

  if (error) {
    toast({
      title: 'Error',
      description: 'Failed to load post. Please try again.',
    });
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 w-48 rounded bg-muted" />
            <div className="h-96 rounded bg-muted" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!post) {
    return (
      <MainLayout>
        <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Post not found</h1>
            <p className="mt-2 text-muted-foreground">
              The post you're looking for doesn't exist or you don't have
              permission to view it.
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
        <div className="mb-8 flex items-center justify-between">
          <Link href={`/blog/${params.id}/edit`} className="nav-button">
            <ArrowLeftIcon className="icon-sm mr-2" />
            Back to Editor
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href={`/blog/${params.id}/edit`}>Edit</Link>
            </Button>
            <Button>Publish</Button>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-8">
          <div className="mb-4 text-sm text-muted-foreground">Preview Mode</div>
          <h1 className="mb-8 text-4xl font-bold">{post.title}</h1>
          <div
            className="prose prose-gray dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </div>
    </MainLayout>
  );
}
