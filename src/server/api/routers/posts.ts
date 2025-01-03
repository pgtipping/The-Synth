import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '@/server/api/trpc';
import slugify from 'slugify';

const postInput = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
});

export const postsRouter = createTRPCRouter({
  createDraft: protectedProcedure
    .input(postInput)
    .mutation(async ({ ctx, input }) => {
      const { title, content } = input;

      // Generate a unique slug from the title
      const baseSlug = slugify(title, { lower: true, strict: true });
      let slug = baseSlug;
      let counter = 1;

      // Keep checking until we find a unique slug
      while (await ctx.db.post.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      const post = await ctx.db.post.create({
        data: {
          title,
          content,
          slug,
          published: false,
          authorId: ctx.session.user.id,
        },
      });

      return {
        status: 201,
        message: 'Draft saved successfully',
        data: post,
      };
    }),

  publish: protectedProcedure
    .input(
      z.object({
        id: z.string().optional(),
        title: z.string().min(1, 'Title is required'),
        content: z.string().min(1, 'Content is required'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, title, content } = input;

      if (id) {
        // Update existing post
        const post = await ctx.db.post.findUnique({
          where: { id },
          select: { authorId: true },
        });

        if (!post) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Post not found',
          });
        }

        if (post.authorId !== ctx.session.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Not authorized to edit this post',
          });
        }

        const updatedPost = await ctx.db.post.update({
          where: { id },
          data: {
            title,
            content,
            published: true,
          },
        });

        return {
          status: 200,
          message: 'Post published successfully',
          data: updatedPost,
        };
      } else {
        // Create new published post
        const baseSlug = slugify(title, { lower: true, strict: true });
        let slug = baseSlug;
        let counter = 1;

        while (await ctx.db.post.findUnique({ where: { slug } })) {
          slug = `${baseSlug}-${counter}`;
          counter++;
        }

        const post = await ctx.db.post.create({
          data: {
            title,
            content,
            slug,
            published: true,
            authorId: ctx.session.user.id,
          },
        });

        return {
          status: 201,
          message: 'Post published successfully',
          data: post,
        };
      }
    }),

  getPostById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.db.post.findUnique({
        where: { id: input.id },
        include: {
          author: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      });

      if (!post) {
        throw new Error('Post not found');
      }

      return post;
    }),

  getDrafts: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).optional().default(10),
        cursor: z.string().optional(),
        orderBy: z
          .enum(['createdAt', 'updatedAt', 'title'])
          .optional()
          .default('updatedAt'),
        orderDir: z.enum(['asc', 'desc']).optional().default('desc'),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, orderBy, orderDir } = input;

      const drafts = await ctx.db.post.findMany({
        where: {
          authorId: ctx.session.user.id,
          published: false,
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { [orderBy]: orderDir },
        include: {
          author: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (drafts.length > limit) {
        const nextItem = drafts.pop();
        nextCursor = nextItem!.id;
      }

      return {
        items: drafts,
        nextCursor,
      };
    }),

  updateDraft: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1, 'Title is required'),
        content: z.string().min(1, 'Content is required'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, title, content } = input;

      const post = await ctx.db.post.findUnique({
        where: { id },
        select: { authorId: true, published: true },
      });

      if (!post) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Draft not found',
        });
      }

      if (post.authorId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to edit this draft',
        });
      }

      if (post.published) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot update a published post as draft',
        });
      }

      const updatedDraft = await ctx.db.post.update({
        where: { id },
        data: {
          title,
          content,
          updatedAt: new Date(),
        },
      });

      return {
        status: 200,
        message: 'Draft updated successfully',
        data: updatedDraft,
      };
    }),

  deleteDraft: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.post.findUnique({
        where: { id: input.id },
        select: { authorId: true, published: true },
      });

      if (!post) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Draft not found',
        });
      }

      if (post.authorId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to delete this draft',
        });
      }

      if (post.published) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot delete a published post as draft',
        });
      }

      await ctx.db.post.delete({
        where: { id: input.id },
      });

      return {
        status: 200,
        message: 'Draft deleted successfully',
      };
    }),

  getPublishedPosts: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).optional().default(10),
        cursor: z.string().optional(),
        orderBy: z
          .enum(['createdAt', 'updatedAt', 'title'])
          .optional()
          .default('createdAt'),
        orderDir: z.enum(['asc', 'desc']).optional().default('desc'),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, orderBy, orderDir } = input;

      const posts = await ctx.db.post.findMany({
        where: {
          published: true,
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { [orderBy]: orderDir },
        include: {
          author: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (posts.length > limit) {
        const nextItem = posts.pop();
        nextCursor = nextItem!.id;
      }

      return {
        items: posts,
        nextCursor,
      };
    }),
});
