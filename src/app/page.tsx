'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { format } from 'date-fns';
import { stripHtml } from '@/lib/utils';

interface MockPost {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  image: string;
  category: string;
  isReal: false;
}

interface RealPost {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  isReal: true;
}

type Post = MockPost | RealPost;

function isMockPost(post: Post): post is MockPost {
  return !post.isReal;
}

// Mock data - will be removed later
const mockBlogs = [
  {
    id: '1',
    title: 'Explore the World: Travel Adventures Await You!',
    excerpt:
      'Discover hidden gems and breathtaking destinations that will take you away. From exhilarating backpacking to luxury retreats, every journey has a story to tell.',
    author: 'Emily Johnson',
    date: 'Jan 16, 2023',
    image: '/images/travel.jpg',
    category: 'Travel Tips',
  },
  {
    id: '2',
    title: 'Wanderlust: Discover Hidden Gems',
    excerpt:
      'Traveling opens up a world of experiences that enrich our lives. From breathtaking landscapes to vibrant cultures, every journey has a story to tell.',
    author: 'Jane Smith',
    date: 'Jan 15, 2023',
    image: '/images/wanderlust.jpg',
    category: 'Lifestyle Hacks',
  },
  {
    id: '3',
    title: 'Delicious Recipes for Every Occasion',
    excerpt:
      "Cooking is an art, and the kitchen is your canvas. Whether you're looking for quick weeknight meals or elaborate dinner party dishes, we've got you covered.",
    author: 'Michael Chen',
    date: 'Jan 14, 2023',
    image: '/images/cooking.jpg',
    category: 'Cooking Recipes',
  },
];

export default function Home() {
  const {
    data: postsData,
    isLoading,
    error,
  } = trpc.posts.getPublishedPosts.useQuery({
    orderBy: 'createdAt',
    orderDir: 'desc',
  });

  // Combine mock and real posts
  const allPosts: Post[] = [
    ...(postsData?.items || []).map((post) => ({
      id: post.id,
      title: post.title,
      excerpt: stripHtml(post.content).substring(0, 150) + '...',
      author: post.author?.name || 'Anonymous',
      date: format(new Date(post.createdAt), 'MMM d, yyyy'),
      isReal: true as const,
    })),
    ...mockBlogs.map((blog) => ({
      ...blog,
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
              <div className="flex items-center gap-4">
                <Link href="/blog/new">
                  <Button size="lg" className="gap-2">
                    <PlusIcon className="h-5 w-5" />
                    Start Writing
                  </Button>
                </Link>
                <a href="#latest-posts">
                  <Button variant="outline" size="lg">
                    Explore Posts
                  </Button>
                </a>
              </div>
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
          <Link href="/blog/new">
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              Create New Post
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse overflow-hidden rounded-lg border bg-card"
              >
                <div className="h-48 bg-muted" />
                <div className="space-y-3 p-4">
                  <div className="h-4 w-1/4 rounded bg-muted" />
                  <div className="h-6 w-3/4 rounded bg-muted" />
                  <div className="h-4 w-full rounded bg-muted" />
                  <div className="flex justify-between">
                    <div className="h-4 w-1/3 rounded bg-muted" />
                    <div className="h-4 w-1/4 rounded bg-muted" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {allPosts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.id}`}
                className="group block overflow-hidden rounded-lg border bg-card transition-all hover:shadow-md"
              >
                {isMockPost(post) && (
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image
                      src={post.image}
                      alt={post.title}
                      width={400}
                      height={225}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  {isMockPost(post) && (
                    <div className="mb-2 text-sm font-medium text-muted-foreground">
                      {post.category}
                    </div>
                  )}
                  <h2 className="mb-2 line-clamp-2 text-lg font-semibold group-hover:text-primary">
                    {post.title}
                  </h2>
                  <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>By {post.author}</span>
                    <span>{post.date}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </MainLayout>
  );
}
