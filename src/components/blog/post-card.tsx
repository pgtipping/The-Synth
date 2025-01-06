'use client';

import Link from 'next/link';
import Image from 'next/image';

interface Post {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  image?: string;
  category?: string;
  isReal: boolean;
}

export function PostCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/blog/${post.id}`}
      className="group block overflow-hidden rounded-lg border bg-card transition-all hover:shadow-md"
    >
      {post.image && (
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
        {!post.isReal && post.category && (
          <div className="mb-2 text-sm font-medium text-muted-foreground">
            {post.category}
          </div>
        )}
        <h2 className="mb-2 line-clamp-2 text-lg font-semibold group-hover:text-primary">
          {post.title}
        </h2>
        <p
          className="mb-4 line-clamp-2 text-sm text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: post.excerpt }}
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>By {post.author}</span>
          <span>{post.date}</span>
        </div>
      </div>
    </Link>
  );
}
