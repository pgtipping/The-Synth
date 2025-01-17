import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { TagPosts } from '../../../../components/blog/TagPosts';
import { MainLayout } from '@/components/layout/main-layout';

interface TagPageProps {
  params: {
    slug: string;
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const tag = await db.tag.findUnique({
    where: { slug: params.slug },
    include: {
      posts: {
        where: { published: true },
        orderBy: { createdAt: 'desc' },
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
      },
    },
  });

  if (!tag) {
    notFound();
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold">
          Posts tagged with &quot;{tag.name}&quot;
        </h1>
        <TagPosts tag={tag} />
      </div>
    </MainLayout>
  );
}
