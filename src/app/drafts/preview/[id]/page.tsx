'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
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

export default function PreviewPost({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const {
    data: post,
    isLoading,
    error,
  } = trpc.posts.getPostById.useQuery({ id: params.id });

  const publish = trpc.posts.publish.useMutation({
    onSuccess: (result) => {
      toast({
        title: 'Success',
        description: 'Post published successfully',
      });
      router.push(`/blog/${result.data.id}`);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to publish. Please try again.',
      });
    },
  });

  const handlePublish = async () => {
    if (!post?.title || !post?.content) {
      toast({
        title: 'Missing Fields',
        description: 'Post must have a title and content',
      });
      return;
    }

    publish.mutate({
      id: params.id,
      title: post.title,
      content: post.content,
    });
  };

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
          <Link href={`/drafts/${params.id}/edit`} className="nav-button">
            <ArrowLeftIcon className="icon-sm mr-2" />
            Back to Editor
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href={`/drafts/${params.id}/edit`}>Edit</Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button disabled={publish.isPending}>
                  {publish.isPending ? 'Publishing...' : 'Publish'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will publish your post and make it visible to everyone.
                    You can still edit it after publishing.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handlePublish}>
                    Publish
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-8">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Preview Mode</div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Status:</span>
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
