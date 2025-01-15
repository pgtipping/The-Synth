import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '@/server/api/trpc';
import slugify from 'slugify';

const tagInput = z.object({
  name: z.string().min(1, 'Name is required'),
});

const tagIdSchema = z.object({
  id: z.string(),
});

export const tagRouter = createTRPCRouter({
  // Create a new tag
  create: protectedProcedure
    .input(tagInput)
    .mutation(async ({ ctx, input }) => {
      const { name } = input;

      // Generate a unique slug from the name
      const baseSlug = slugify(name, { lower: true, strict: true });
      let slug = baseSlug;
      let counter = 1;

      // Keep checking until we find a unique slug
      while (await ctx.db.tag.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      try {
        const tag = await ctx.db.tag.create({
          data: {
            name,
            slug,
          },
        });

        return {
          status: 201,
          message: 'Tag created successfully',
          data: tag,
        };
      } catch (error: unknown) {
        if (
          typeof error === 'object' &&
          error !== null &&
          'code' in error &&
          error.code === 'P2002'
        ) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'A tag with this name already exists',
          });
        }
        throw error;
      }
    }),

  // Get all tags
  getAll: publicProcedure.query(async ({ ctx }) => {
    const tags = await ctx.db.tag.findMany({
      orderBy: { name: 'asc' },
    });
    return tags;
  }),

  // Get a single tag by ID
  getById: publicProcedure.input(tagIdSchema).query(async ({ ctx, input }) => {
    const tag = await ctx.db.tag.findUnique({
      where: { id: input.id },
      include: {
        posts: {
          where: { published: true },
          select: {
            id: true,
            title: true,
            slug: true,
            createdAt: true,
          },
        },
      },
    });

    if (!tag) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Tag not found',
      });
    }

    return tag;
  }),

  // Update a tag
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        ...tagInput.shape,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, name } = input;

      // Check if tag exists
      const existingTag = await ctx.db.tag.findUnique({
        where: { id },
      });

      if (!existingTag) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Tag not found',
        });
      }

      // Generate new slug if name is changed
      let slug = existingTag.slug;
      if (name !== existingTag.name) {
        const baseSlug = slugify(name, { lower: true, strict: true });
        slug = baseSlug;
        let counter = 1;

        while (
          await ctx.db.tag.findFirst({
            where: { slug, id: { not: id } },
          })
        ) {
          slug = `${baseSlug}-${counter}`;
          counter++;
        }
      }

      try {
        const updatedTag = await ctx.db.tag.update({
          where: { id },
          data: {
            name,
            slug,
          },
        });

        return {
          status: 200,
          message: 'Tag updated successfully',
          data: updatedTag,
        };
      } catch (error: unknown) {
        if (
          typeof error === 'object' &&
          error !== null &&
          'code' in error &&
          error.code === 'P2002'
        ) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'A tag with this name already exists',
          });
        }
        throw error;
      }
    }),

  // Delete a tag
  delete: protectedProcedure
    .input(tagIdSchema)
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      // Check if tag exists
      const tag = await ctx.db.tag.findUnique({
        where: { id },
        include: {
          posts: {
            select: { id: true },
          },
        },
      });

      if (!tag) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Tag not found',
        });
      }

      // Delete the tag
      await ctx.db.tag.delete({
        where: { id },
      });

      return {
        status: 200,
        message: 'Tag deleted successfully',
      };
    }),
});
