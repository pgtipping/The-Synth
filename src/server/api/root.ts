import { createTRPCRouter } from '@/server/api/trpc';
import { authRouter } from '@/server/api/routers/auth';
import { postsRouter } from './routers/posts';
import { categoryRouter } from './routers/category';
import { tagRouter } from './routers/tag';
import { imageRouter } from './routers/image';
import { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

export const appRouter = createTRPCRouter({
  auth: authRouter,
  posts: postsRouter,
  categories: categoryRouter,
  tags: tagRouter,
  image: imageRouter,
});

export type AppRouter = typeof appRouter;
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
