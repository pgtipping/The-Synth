'use client';

import { MainLayout } from '@/components/layout/main-layout';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { trpc } from '@/lib/trpc';
import { ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { type RouterOutputs } from '@/server/api/root';
import { type TRPCClientErrorLike } from '@trpc/client';
import { type AppRouter } from '@/server/api/root';
import { CategoryList } from '@/components/category/CategoryList';
import { TagList } from '@/components/tag/TagList';

const QuillEditor = dynamic(() => import('@/components/editor/QuillEditor'), {
  ssr: false,
});

export default function EditPost({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  const {
    data: post,
    isLoading,
    error,
  } = trpc.posts.getPostById.useQuery({ id: params.id });

  // Initialize form data once when post is loaded
  useEffect(() => {
    if (post && !isInitialized) {
      setTitle(post.title);
      setContent(post.content);
      setSelectedCategoryIds(post.categories.map((c) => c.id));
      setSelectedTagIds(post.tags.map((t) => t.id));
      setIsInitialized(true);
    }
  }, [post, isInitialized]);

  const updateDraft = trpc.posts.updateDraft.useMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Post updated successfully',
      });
    },
    onError: (error) => {
      console.error('Update post error:', error);
      toast({
        title: 'Error',
        description:
          error.message || 'Failed to update post. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const togglePublish = trpc.posts.togglePublish.useMutation({
    onSuccess: (data) => {
      toast({
        title: 'Success',
        description: data.message,
      });
      router.push(`/blog/${data.data.id}`);
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to publish. Please try again.',
        variant: 'destructive',
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

    // Remove any potentially problematic content
    const sanitizedContent = content
      .replace(/javascript:/gi, '')
      .replace(/data:/gi, '')
      .replace(/vbscript:/gi, '');

    updateDraft.mutate({
      id: params.id,
      title,
      content: sanitizedContent,
      categoryIds: selectedCategoryIds,
      tagIds: selectedTagIds,
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

    // First save any changes
    await updateDraft.mutateAsync({
      id: params.id,
      title,
      content,
      categoryIds: selectedCategoryIds,
      tagIds: selectedTagIds,
    });

    // Then publish the post
    togglePublish.mutate({
      id: params.id,
      published: true,
    });
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="mb-8 flex items-center justify-between">
          <Link href={`/blog/${params.id}`} className="nav-button">
            <ArrowLeftIcon className="icon-sm mr-2" />
            Back to Post
          </Link>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleSave}
              disabled={updateDraft.isPending}
            >
              {updateDraft.isPending ? 'Saving...' : 'Save'}
            </Button>
            <Button onClick={handlePublish} disabled={togglePublish.isPending}>
              {togglePublish.isPending ? 'Publishing...' : 'Publish'}
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

          <div className="space-y-6">
            <CategoryList
              selectedIds={selectedCategoryIds}
              onSelect={(id: string) =>
                setSelectedCategoryIds([...selectedCategoryIds, id])
              }
              onDeselect={(id: string) =>
                setSelectedCategoryIds(
                  selectedCategoryIds.filter((cid) => cid !== id)
                )
              }
            />
            <TagList
              selectedIds={selectedTagIds}
              onSelect={(id: string) =>
                setSelectedTagIds([...selectedTagIds, id])
              }
              onDeselect={(id: string) =>
                setSelectedTagIds(selectedTagIds.filter((tid) => tid !== id))
              }
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
