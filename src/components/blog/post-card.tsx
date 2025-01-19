'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Post {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  image?: string;
  categories?: Array<{ id: string; name: string; slug: string }>;
  tags?: Array<{ id: string; name: string; slug: string }>;
  isReal: boolean;
}

export function PostCard({ post }: { post: Post }) {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/blog/${post.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group block cursor-pointer overflow-hidden rounded-lg border bg-card transition-all hover:shadow-md"
    >
      {post.image && (
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={post.image.replace(/&amp;/g, '&')}
            alt={post.title}
            width={400}
            height={225}
            className="h-full w-full object-cover"
            onError={(e) => {
              console.error('Error loading image:', post.image);
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}
      <div className="p-4">
        {!post.isReal && post.categories && post.categories.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {post.categories.map((category) => (
              <Link
                key={category.id}
                href={`/blog/category/${category.slug}`}
                className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary hover:bg-primary/20"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                {category.name}
              </Link>
            ))}
          </div>
        )}
        <h2 className="mb-2 line-clamp-2 text-lg font-semibold group-hover:text-primary">
          {post.title}
        </h2>
        <p
          className="mb-4 line-clamp-2 text-sm text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: post.excerpt }}
        />
        <div className="flex flex-wrap items-center justify-between gap-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>By {post.author}</span>
            <span>•</span>
            <span>{post.date}</span>
          </div>
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/blog/tag/${tag.slug}`}
                  className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
