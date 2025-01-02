import Link from 'next/link';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';

export default function BlogListing() {
  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Blog Posts</h1>
          <Link href="/blog/new">
            <Button>
              <PlusIcon className="icon-sm mr-2" />
              New Post
            </Button>
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}
