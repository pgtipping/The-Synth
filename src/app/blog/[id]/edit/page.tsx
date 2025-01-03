'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { trpc } from '@/lib/trpc';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

const QuillEditor = dynamic(() => import('@/components/editor/QuillEditor'), {
  ssr: false,
  loading: () => (
    <div className="min-h-[500px] animate-pulse rounded-lg border bg-muted" />
  ),
});

export default function EditPost({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const {
    data: post,
    isLoading,
    error,
  } = trpc.posts.getPostById.useQuery({ id: params.id });

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content);
    }
  }, [post]);

  const updateDraft = trpc.posts.updateDraft.useMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Draft updated successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update draft. Please try again.',
      });
    },
  });

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

  if (isLoading) {
    return (
      <MainLayout>
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 w-48 rounded bg-muted" />
            <div className="h-96 rounded bg-muted" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !post) {
    return (
      <MainLayout>
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Post not found</h1>
            <p className="mt-2 text-muted-foreground">
              The post you're looking for doesn't exist or you don't have
              permission to edit it.
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const handleSave = async () => {
    if (!title || !content) {
      toast({
        title: 'Missing Fields',
        description: 'Please enter a title and content',
      });
      return;
    }

    updateDraft.mutate({
      id: params.id,
      title,
      content,
    });
  };

  const handlePublish = async () => {
    if (!title || !content) {
      toast({
        title: 'Missing Fields',
        description: 'Please enter a title and content',
      });
      return;
    }

    publish.mutate({
      id: params.id,
      title,
      content,
    });
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/blog/drafts" className="nav-button">
            <ArrowLeftIcon className="icon-sm mr-2" />
            Back to Drafts
          </Link>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleSave}
              disabled={updateDraft.isPending}
            >
              {updateDraft.isPending ? 'Saving...' : 'Save'}
            </Button>
            <Button onClick={handlePublish} disabled={publish.isPending}>
              {publish.isPending ? 'Publishing...' : 'Publish'}
            </Button>
          </div>
        </div>

        <div className="space-y-8">
          <Input
            type="text"
            placeholder="Enter your blog title..."
            className="border-none bg-transparent text-4xl font-bold placeholder:text-muted-foreground/50 focus-visible:ring-0"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="min-h-[500px] rounded-lg border bg-card">
            <QuillEditor
              value={content}
              onChange={setContent}
              placeholder="Write your blog post..."
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
