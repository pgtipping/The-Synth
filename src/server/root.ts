import { router } from "./trpc";

export const appRouter = router({
  // Add your routers here
});

export type AppRouter = typeof appRouter;
