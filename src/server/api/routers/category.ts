import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '@/server/api/trpc';
import slugify from 'slugify';

const categoryInput = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

const categoryIdSchema = z.object({
  id: z.string(),
});

export const categoryRouter = createTRPCRouter({
  // Create a new category
  create: protectedProcedure
    .input(categoryInput)
    .mutation(async ({ ctx, input }) => {
      const { name, description } = input;

      // Generate a unique slug from the name
      const baseSlug = slugify(name, { lower: true, strict: true });
      let slug = baseSlug;
      let counter = 1;

      // Keep checking until we find a unique slug
      while (await ctx.db.category.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      try {
        const category = await ctx.db.category.create({
          data: {
            name,
            slug,
            description,
          },
        });

        return {
          status: 201,
          message: 'Category created successfully',
          data: category,
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
            message: 'A category with this name already exists',
          });
        }
        throw error;
      }
    }),

  // Get all categories
  getAll: publicProcedure.query(async ({ ctx }) => {
    const categories = await ctx.db.category.findMany({
      orderBy: { name: 'asc' },
    });
    return categories;
  }),

  // Get a single category by ID
  getById: publicProcedure
    .input(categoryIdSchema)
    .query(async ({ ctx, input }) => {
      const category = await ctx.db.category.findUnique({
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

      if (!category) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Category not found',
        });
      }

      return category;
    }),

  // Update a category
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        ...categoryInput.shape,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, name, description } = input;

      // Check if category exists
      const existingCategory = await ctx.db.category.findUnique({
        where: { id },
      });

      if (!existingCategory) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Category not found',
        });
      }

      // Generate new slug if name is changed
      let slug = existingCategory.slug;
      if (name !== existingCategory.name) {
        const baseSlug = slugify(name, { lower: true, strict: true });
        slug = baseSlug;
        let counter = 1;

        while (
          await ctx.db.category.findFirst({
            where: { slug, id: { not: id } },
          })
        ) {
          slug = `${baseSlug}-${counter}`;
          counter++;
        }
      }

      try {
        const updatedCategory = await ctx.db.category.update({
          where: { id },
          data: {
            name,
            slug,
            description,
          },
        });

        return {
          status: 200,
          message: 'Category updated successfully',
          data: updatedCategory,
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
            message: 'A category with this name already exists',
          });
        }
        throw error;
      }
    }),

  // Delete a category
  delete: protectedProcedure
    .input(categoryIdSchema)
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      // Check if category exists
      const category = await ctx.db.category.findUnique({
        where: { id },
        include: {
          posts: {
            select: { id: true },
          },
        },
      });

      if (!category) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Category not found',
        });
      }

      // Delete the category
      await ctx.db.category.delete({
        where: { id },
      });

      return {
        status: 200,
        message: 'Category deleted successfully',
      };
    }),
});
