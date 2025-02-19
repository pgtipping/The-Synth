import type { Post, User, Category, Tag } from '.prisma/client';

export type PostWithRelations = Post & {
  author: Pick<User, 'name' | 'image'> | null;
  categories: Category[];
  tags: Tag[];
};
