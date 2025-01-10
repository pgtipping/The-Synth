'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeftIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
import Link from 'next/link';
import QuillEditor from '@/components/editor/QuillEditor';
import { trpc } from '@/lib/trpc';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

export default function CreatePost() {
  const router = useRouter();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const createDraft = trpc.posts.createDraft.useMutation({
    onSuccess: (result) => {
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

  const publish = trpc.posts.publish.useMutation({
    onSuccess: (result) => {
      toast({
        title: 'Success',
        description: 'Post published successfully',
      });
      router.push(`/blog/${result.data.id}`);
    },
    onError: (error) => {
      console.error('Publish error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to publish. Please try again.',
        variant: 'destructive',
      });
    },
  });

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
      console.log('Publishing post with:', {
        titleLength: title.length,
        contentLength: content.length,
      });

      const sanitizedContent = content
        .replace(/javascript:/gi, '')
        .replace(/data:/gi, '')
        .replace(/vbscript:/gi, '');

      publish.mutate({
        title,
        content: sanitizedContent,
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

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/blog" className="nav-button">
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
            <Button onClick={handlePublish} disabled={publish.isPending}>
              {publish.isPending ? 'Publishing...' : 'Publish'}
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
