'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';

export default function EditPost({ params }: { params: { id: string } }) {
  return (
    <MainLayout>
      <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
        <div className="mb-8 flex items-center justify-between">
          <Link href={`/blog/${params.id}`} className="nav-button">
            <ArrowLeftIcon className="icon-sm mr-2" />
            Back to Post
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="outline">Save Draft</Button>
            <Button>Update</Button>
          </div>
        </div>

        <div className="space-y-8">
          <Input
            type="text"
            placeholder="Enter your blog title..."
            className="border-none bg-transparent text-4xl font-bold placeholder:text-muted-foreground/50 focus-visible:ring-0"
          />

          <div className="min-h-[500px] rounded-lg border bg-card p-4">
            {/* Quill editor will go here */}
            <div className="h-full">
              <textarea
                placeholder="Write your blog post..."
                className="h-full w-full resize-none border-none bg-transparent placeholder:text-muted-foreground/50 focus-visible:ring-0"
              />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
