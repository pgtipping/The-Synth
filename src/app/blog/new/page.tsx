'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeftIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { trpc } from '@/lib/trpc';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { type RouterOutputs, type AppRouter } from '@/server/api/root';
import { type TRPCClientErrorLike } from '@trpc/client';
import { CategoryList } from '@/components/category/CategoryList';
import { TagList } from '@/components/tag/TagList';
import { useSession } from 'next-auth/react';
import { EditorErrorBoundary } from '@/components/editor/EditorErrorBoundary';

const QuillEditor = dynamic(() => import('@/components/editor/QuillEditor'), {
  ssr: false,
  loading: () => (
    <div className="min-h-[500px] animate-pulse rounded-lg border bg-muted" />
  ),
});

export default function CreatePost() {
  const router = useRouter();
  const { toast } = useToast();
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  const createDraft = trpc.posts.createDraft.useMutation({
    onSuccess: (result: RouterOutputs['posts']['createDraft']) => {
      toast({
        title: 'Success',
        description: 'Draft saved successfully',
      });
      router.push(`/drafts/${result.data.id}/edit`);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to save draft. Please try again.',
      });
    },
  });

  const togglePublish = trpc.posts.togglePublish.useMutation({
    onSuccess: (result: RouterOutputs['posts']['togglePublish']) => {
      toast({
        title: 'Success',
        description: 'Post published successfully',
      });
      router.push(`/blog/${result.data.id}`);
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      console.error('Publish error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to publish. Please try again.',
        variant: 'destructive',
      });
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle authentication after all hooks are called
  useEffect(() => {
    if (mounted && !session && status !== 'loading') {
      router.push('/api/auth/signin');
    }
  }, [mounted, session, status, router]);

  // Memoize the editor component
  const memoizedEditor = useMemo(
    () => (
      <EditorErrorBoundary>
        <QuillEditor
          key="editor"
          value={content}
          onChange={setContent}
          placeholder="Write your blog post..."
        />
      </EditorErrorBoundary>
    ),
    [content, setContent]
  );

  // Memoize title change handler
  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(e.target.value);
    },
    []
  );

  const handleSaveDraft = async () => {
    if (!title || !content) {
      toast({
        title: 'Missing Fields',
        description: 'Please enter a title and content',
      });
      return;
    }

    createDraft.mutate({
      title,
      content,
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

    try {
      const sanitizedContent = content
        .replace(/javascript:/gi, '')
        .replace(/data:/gi, '')
        .replace(/vbscript:/gi, '');

      // First create the draft
      const result = await createDraft.mutateAsync({
        title,
        content: sanitizedContent,
        categoryIds: selectedCategoryIds,
        tagIds: selectedTagIds,
      });

      // Then publish it
      togglePublish.mutate({
        id: result.data.id,
        published: true,
      });
    } catch (error) {
      console.error('Error in handlePublish:', error);
      toast({
        title: 'Error',
        description: 'Failed to publish. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handlePreview = async () => {
    if (!title || !content) {
      toast({
        title: 'Missing Fields',
        description: 'Please enter a title and content to preview',
      });
      return;
    }

    const result = await createDraft.mutateAsync({
      title,
      content,
    });

    window.open(`/drafts/preview/${result.data.id}`, '_blank');
  };

  // Show loading state while checking authentication
  if (!mounted || status === 'loading') {
    return (
      <MainLayout>
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
          <div className="space-y-4">
            <div className="h-12 w-48 animate-pulse rounded-md bg-muted" />
            <div className="h-96 animate-pulse rounded-lg bg-muted" />
          </div>
        </div>
      </MainLayout>
    );
  }

  // Don't render anything while redirecting
  if (!session) {
    return null;
  }

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="nav-button">
            <ArrowLeftIcon className="icon-sm mr-2" />
            Back to Posts
          </Link>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="gap-2"
            >
              {showPreview ? (
                <>
                  <EyeOffIcon className="h-4 w-4" />
                  Hide Preview
                </>
              ) : (
                <>
                  <EyeIcon className="h-4 w-4" />
                  Show Preview
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              onClick={handlePreview}
              disabled={createDraft.isPending}
            >
              Open Preview
            </Button>
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={createDraft.isPending}
            >
              {createDraft.isPending ? 'Saving...' : 'Save Draft'}
            </Button>
            <Button onClick={handlePublish} disabled={togglePublish.isPending}>
              {togglePublish.isPending ? 'Publishing...' : 'Publish'}
            </Button>
          </div>
        </div>

        <div
          className={cn(
            'grid gap-8',
            showPreview ? 'lg:grid-cols-2' : 'grid-cols-1'
          )}
        >
          <div className="space-y-8">
            <Input
              type="text"
              placeholder="Enter your blog title..."
              className="border-none bg-transparent text-4xl font-bold placeholder:text-muted-foreground/50 focus-visible:ring-0"
              value={title}
              onChange={handleTitleChange}
            />

            <div className="min-h-[500px] rounded-lg border bg-card">
              {memoizedEditor}
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

          {showPreview && (
            <div className="space-y-8">
              <div className="rounded-lg border bg-card p-8">
                <h1 className="mb-8 text-4xl font-bold">
                  {title || 'Untitled Post'}
                </h1>
                <div
                  className="prose prose-gray dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: content || 'No content yet...',
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
