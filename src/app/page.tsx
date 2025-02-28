import Link from 'next/link';
import Image from 'next/image';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { format } from 'date-fns';
import { truncateHTML } from '@/lib/utils';
import { PostCard } from '@/components/blog/post-card';
import { db } from '@/server/db';
import { mockBlogs } from '@/lib/mock-data';
import { HeroButtons } from '@/components/home/hero-buttons';
import { logger } from '@/lib/logger';
import { type PostWithRelations } from '@/types/post';

const POSTS_PER_PAGE = 6;

// Helper function to extract text content without HTML tags
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

export default async function Home() {
  // Server-side data fetching
  const publishedPosts = await db.post.findMany({
    where: {
      published: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: POSTS_PER_PAGE,
    include: {
      author: {
        select: {
          name: true,
          image: true,
        },
      },
      categories: true,
      tags: true,
    },
  });

  // Transform posts for display
  const transformedPosts = publishedPosts.map((post: PostWithRelations) => {
    // Extract image URL from content
    const imageMatch = post.content.match(/<img[^>]+src="([^">]+)"/);
    let imageUrl = imageMatch ? imageMatch[1] : '';

    // If it's an S3 URL, remove the signed URL parameters
    if (imageUrl.includes('synthalyst-blog-media-dev.s3')) {
      imageUrl = imageUrl.split('?')[0];
    }

    // Debug log
    logger.info('Post ID:', post.id);
    logger.info('Post content:', post.content);
    logger.info('Extracted image URL:', imageUrl);

    // Remove image tag from content before creating excerpt
    const contentWithoutImage = post.content.replace(
      /<figure>[^]*?<\/figure>/,
      ''
    );

    return {
      id: post.id,
      title: post.title,
      excerpt: truncateHTML(stripHtml(contentWithoutImage), 150),
      author: post.author?.name || 'Anonymous',
      date: format(post.createdAt, 'MMM d, yyyy'),
      image: imageUrl,
      categories: post.categories,
      tags: post.tags,
      isReal: true as const,
    };
  });

  // Combine with mock data (will be removed later)
  const allPosts = [
    ...transformedPosts,
    ...mockBlogs.map((blog: (typeof mockBlogs)[0]) => ({
      ...blog,
      categories: [],
      tags: [],
      isReal: false as const,
    })),
  ];

  return (
    <MainLayout>
      <section className="relative bg-white py-24">
        <div className="absolute inset-0 bg-gray-50/50" />
        <div className="relative mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8">
            <div className="flex flex-col justify-center space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                  Share Your Stories,
                  <br />
                  <span className="text-primary">Inspire the World</span>
                </h1>
                <p className="text-xl text-gray-600">
                  Write with the power of AI or craft your stories
                  traditionally. Your unique voice, amplified by technology, can
                  reach and inspire readers worldwide.
                </p>
              </div>
              <HeroButtons />
            </div>
            <div className="relative mx-auto max-w-lg lg:mx-0">
              <div className="absolute -inset-4 -z-10 rounded-xl bg-gradient-to-b from-primary/5 via-primary/10 to-transparent" />
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-100 shadow-lg">
                <Image
                  src="/images/hero.jpg"
                  alt="Writing inspiration"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="latest-posts"
        className="mx-auto max-w-7xl scroll-mt-16 px-4 py-16 md:px-8"
      >
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold">Latest Posts</h2>
          <Link href="/blog/new" className="inline-block">
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              Create New Post
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {allPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>
    </MainLayout>
  );
}
