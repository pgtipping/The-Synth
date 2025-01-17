import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { CategoryPosts } from '@/components/blog/CategoryPosts';

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const category = await db.category.findUnique({
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

  if (!category) {
    notFound();
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold">
          Posts in category &quot;{category.name}&quot;
        </h1>
        <CategoryPosts category={category} />
      </div>
    </MainLayout>
  );
}
