import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { ZodError } from 'zod';
import { db } from '@/lib/db';
import type { Session } from 'next-auth';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { headers } from 'next/headers';

interface CreateContextOptions {
  session: Session | null;
}

export const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    db,
  };
};

export const createTRPCContext = async (opts: {
  req?: Request;
  res?: Response;
}) => {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      console.error('No session or user found in context');
    } else {
      console.log('Session found:', {
        userId: session.user.id,
        email: session.user.email,
      });
    }

    return createInnerTRPCContext({
      session,
    });
  } catch (error) {
    console.error('Error getting session:', error);
    return createInnerTRPCContext({
      session: null,
    });
  }
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;

export const publicProcedure = t.procedure;

const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to perform this action',
    });
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);
