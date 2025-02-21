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
import React, { useEffect, useState, Suspense, lazy } from 'react';
import { type TRPCClientErrorLike } from '@trpc/client';
import { type AppRouter } from '@/server/api/root';
import { CategoryList } from '@/components/category/CategoryList';
import { TagList } from '@/components/tag/TagList';

// Lazy load editor components
const QuillEditor = dynamic(
  () =>
    import('@/components/editor/QuillEditor').then((mod) => ({
      default: mod.default,
      __esModule: true,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[500px] animate-pulse rounded-lg border bg-muted" />
    ),
  }
);

// Lazy load category and tag components
const CategoryListComponent = lazy(
  () => import('@/components/category/CategoryList')
);
const TagListComponent = lazy(() => import('@/components/tag/TagList'));

export default function EditPost({ params }: { params: { id: string } }) {
  const id = params.id;
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
  } = trpc.posts.getPostById.useQuery({ id });

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
              The post you&apos;re looking for doesn&apos;t exist or you
              don&apos;t have permission to edit it.
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
      id,
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
      id,
      title,
      content,
      categoryIds: selectedCategoryIds,
      tagIds: selectedTagIds,
    });

    // Then publish the post
    togglePublish.mutate({
      id,
      published: true,
    });
  };

  return (
    <MainLayout>
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <Link href={`/blog/${id}`} className="nav-button">
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

        <div className="mt-8 space-y-6">
          <Input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-2xl font-bold"
          />

          <Suspense
            fallback={
              <div className="min-h-[500px] animate-pulse rounded-lg border bg-muted" />
            }
          >
            <QuillEditor
              value={content}
              onChange={(value) => setContent(value)}
              placeholder="Write your blog post..."
            />
          </Suspense>

          <div className="space-y-4">
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

          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={handleSave}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={updateDraft.isPending}>
              {updateDraft.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
