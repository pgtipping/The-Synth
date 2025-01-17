import type { Post, Tag, Category, User } from '@prisma/client';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/shared/Badge';

interface PostWithRelations extends Post {
  author: Pick<User, 'name' | 'image'>;
  categories: Category[];
  tags: Tag[];
}

interface TagWithPosts extends Tag {
  posts: PostWithRelations[];
}

interface TagPostsProps {
  tag: TagWithPosts;
}

export function TagPosts({ tag }: TagPostsProps) {
  if (tag.posts.length === 0) {
    return (
      <div className="text-center text-gray-500">
        No posts found with this tag.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {tag.posts.map((post) => (
        <article
          key={post.id}
          className="rounded-lg border bg-white p-6 shadow-sm"
        >
          <Link
            href={`/blog/${post.slug}`}
            className="block hover:text-blue-600"
          >
            <h2 className="mb-2 text-2xl font-semibold">{post.title}</h2>
          </Link>
          <div className="mb-4 flex items-center gap-4 text-sm text-gray-600">
            <span>By {post.author.name}</span>
            <span>•</span>
            <time dateTime={post.createdAt.toISOString()}>
              {formatDistanceToNow(post.createdAt, { addSuffix: true })}
            </time>
          </div>
          <div className="mb-4 flex flex-wrap gap-2">
            {post.categories.map((category) => (
              <Link
                key={category.id}
                href={`/blog/category/${category.slug}`}
                className="hover:text-blue-600"
              >
                <Badge variant="secondary">{category.name}</Badge>
              </Link>
            ))}
            {post.tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/blog/tag/${tag.slug}`}
                className="hover:text-blue-600"
              >
                <Badge>{tag.name}</Badge>
              </Link>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
