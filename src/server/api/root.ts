import { createTRPCRouter } from '@/server/api/trpc';
import { authRouter } from '@/server/api/routers/auth';
import { postsRouter } from './routers/posts';

export const appRouter = createTRPCRouter({
  auth: authRouter,
  posts: postsRouter,
});

export type AppRouter = typeof appRouter;
