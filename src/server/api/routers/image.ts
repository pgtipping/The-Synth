import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { ImageService } from '@/server/services/imageService';
import { TRPCError } from '@trpc/server';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const imageRouter = createTRPCRouter({
  upload: protectedProcedure
    .input(
      z.object({
        file: z.object({
          name: z.string(),
          type: z.string(),
          size: z.number().max(MAX_FILE_SIZE),
          base64: z.string(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Validate mime type
        if (!input.file.type.startsWith('image/')) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid file type. Only images are allowed.',
          });
        }

        // Convert base64 to buffer
        const buffer = Buffer.from(
          input.file.base64.split('base64,')[1],
          'base64'
        );

        // Process and upload image
        const imageService = new ImageService();
        const result = await imageService.processAndUploadImage(
          buffer,
          input.file.name
        );

        return result;
      } catch (error) {
        console.error('Error processing image:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to process image',
        });
      }
    }),
});
