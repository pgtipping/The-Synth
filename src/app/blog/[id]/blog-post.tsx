import Link from 'next/link';
import Image from 'next/image';
import { MainLayout } from '@/components/layout/main-layout';
import { ArrowLeftIcon } from 'lucide-react';
import { PostActions } from '@/components/blog/post-actions';

// Mock data - replace with API call
const blog = {
  id: '1',
  title: 'Getting Started with Next.js 13',
  content: `
    <h2>Introduction</h2>
    <p>Next.js 13 introduces several groundbreaking features that revolutionize how we build web applications. In this comprehensive guide, we'll explore the new app directory structure, server components, and more.</p>
    
    <h2>The App Directory</h2>
    <p>The app directory is a new paradigm for organizing your Next.js application. It provides a more intuitive way to handle routing, layouts, and data fetching.</p>
    
    <h2>Server Components</h2>
    <p>React Server Components allow you to write UI that can be rendered and cached on the server. This results in smaller JavaScript bundles and improved performance.</p>
  `,
  author: 'John Doe',
  date: '2023-12-01',
  readTime: '5 min read',
  status: 'published',
  image: '/images/travel.jpg',
};

export default function BlogPost({ params }: { params: { id: string } }) {
  return (
    <MainLayout>
      <article className="mx-auto max-w-4xl px-4 py-8 md:px-8">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="nav-button">
            <ArrowLeftIcon className="icon-sm mr-2" />
            Back to Posts
          </Link>
          <PostActions />
        </div>

        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg">
          <Image
            src={blog.image}
            alt={blog.title}
            fill
            sizes="(max-width: 1536px) 100vw, 896px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority
          />
        </div>

        <div className="prose prose-gray dark:prose-invert lg:prose-lg mx-auto mt-8 max-w-none">
          <h1 className="mb-4">{blog.title}</h1>
          <div className="mb-8 flex items-center gap-4 text-sm text-muted-foreground">
            <span>{blog.author}</span>
            <span>•</span>
            <span>{blog.date}</span>
            <span>•</span>
            <span>{blog.readTime}</span>
            {blog.status === 'draft' && (
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium">
                Draft
              </span>
            )}
          </div>

          <div
            className="[&>h2]:mb-4 [&>h2]:mt-8 [&>h2]:text-xl [&>h2]:font-semibold [&>p]:mb-4 [&>p]:leading-7"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </div>
      </article>
    </MainLayout>
  );
}
