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
});
