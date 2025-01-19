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
  content: z
    .string()
    .min(1, 'Content is required')
    .max(5000000, 'Content is too large'),
  categoryIds: z.array(z.string()).optional(),
  tagIds: z.array(z.string()).optional(),
});

export const postsRouter = createTRPCRouter({
  createDraft: protectedProcedure
    .input(postInput)
    .mutation(async ({ ctx, input }) => {
      const { title, content, categoryIds = [], tagIds = [] } = input;

      // Generate a unique slug from the title
      const baseSlug = slugify(title, { lower: true, strict: true });
      let slug = baseSlug;
      let counter = 1;

      // Keep checking until we find a unique slug
      while (await ctx.db.post.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      // First verify user exists
      console.log('Attempting to find user with ID:', ctx.session.user.id);
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { id: true, email: true },
      });

      console.log('User lookup result:', user);

      if (!user) {
        // Try to create user if doesn't exist
        try {
          const newUser = await ctx.db.user.create({
            data: {
              id: ctx.session.user.id,
              email: ctx.session.user.email,
            },
          });
          console.log('Created new user:', newUser);
        } catch (error) {
          console.error('Error creating user:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message:
              'Failed to create user account. Please try logging out and in again.',
            cause: error,
          });
        }
      }

      const post = await ctx.db.post.create({
        data: {
          title,
          content,
          slug,
          published: false,
          authorId: ctx.session.user.id,
          categories: {
            connect: categoryIds.map((id) => ({ id })),
          },
          tags: {
            connect: tagIds.map((id) => ({ id })),
          },
        },
        include: {
          categories: true,
          tags: true,
        },
      });

      return {
        status: 201,
        message: 'Draft saved successfully',
        data: post,
      };
    }),

  updateDraft: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        ...postInput.shape,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, title, content, categoryIds = [], tagIds = [] } = input;

      const post = await ctx.db.post.findUnique({
        where: { id },
        include: {
          categories: true,
          tags: true,
        },
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
          message: 'You can only edit your own posts',
        });
      }

      // Generate new slug if title is changed
      let slug = post.slug;
      if (title !== post.title) {
        const baseSlug = slugify(title, { lower: true, strict: true });
        slug = baseSlug;
        let counter = 1;

        while (
          await ctx.db.post.findFirst({
            where: { slug, id: { not: id } },
          })
        ) {
          slug = `${baseSlug}-${counter}`;
          counter++;
        }
      }

      const updatedPost = await ctx.db.post.update({
        where: { id },
        data: {
          title,
          content,
          slug,
          categories: {
            set: categoryIds.map((id) => ({ id })),
          },
          tags: {
            set: tagIds.map((id) => ({ id })),
          },
        },
        include: {
          categories: true,
          tags: true,
        },
      });

      return {
        status: 200,
        message: 'Post updated successfully',
        data: updatedPost,
      };
    }),

  publishPost: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        ...postInput.shape,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, title, content, categoryIds = [], tagIds = [] } = input;

      const post = await ctx.db.post.findUnique({
        where: { id },
        include: {
          categories: true,
          tags: true,
        },
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
          message: 'You can only publish your own posts',
        });
      }

      // Generate new slug if title is changed
      let slug = post.slug;
      if (title !== post.title) {
        const baseSlug = slugify(title, { lower: true, strict: true });
        slug = baseSlug;
        let counter = 1;

        while (
          await ctx.db.post.findFirst({
            where: { slug, id: { not: id } },
          })
        ) {
          slug = `${baseSlug}-${counter}`;
          counter++;
        }
      }

      const publishedPost = await ctx.db.post.update({
        where: { id },
        data: {
          title,
          content,
          slug,
          published: true,
          categories: {
            set: categoryIds.map((id) => ({ id })),
          },
          tags: {
            set: tagIds.map((id) => ({ id })),
          },
        },
        include: {
          categories: true,
          tags: true,
        },
      });

      return {
        status: 200,
        message: 'Post published successfully',
        data: publishedPost,
      };
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
          categories: true,
          tags: true,
        },
      });

      if (!post) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Post not found',
        });
      }

      return post;
    }),

  getDrafts: protectedProcedure
    .input(z.object({}).optional())
    .query(async ({ ctx }) => {
      const drafts = await ctx.db.post.findMany({
        where: {
          authorId: ctx.session.user.id,
          published: false,
        },
        orderBy: {
          updatedAt: 'desc',
        },
        include: {
          categories: true,
          tags: true,
        },
      });

      return {
        items: drafts,
      };
    }),

  togglePublish: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        published: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.post.findUnique({
        where: { id: input.id },
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
          message: 'You can only modify your own posts',
        });
      }

      const updatedPost = await ctx.db.post.update({
        where: { id: input.id },
        data: {
          published: input.published,
          updatedAt: new Date(),
        },
        include: {
          categories: true,
          tags: true,
        },
      });

      return {
        status: 200,
        message: input.published
          ? 'Post published successfully'
          : 'Post unpublished successfully',
        data: updatedPost,
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
          message: 'You can only delete your own drafts',
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
});
