import { z } from "zod";
import { hash } from "bcryptjs";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const authRouter = createTRPCRouter({
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ ctx, input }) => {
      const { email, password, name } = input;

      const exists = await ctx.db.user.findFirst({
        where: { email },
      });

      if (exists) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User already exists.",
        });
      }

      const hashedPassword = await hash(password, 12);

      const user = await ctx.db.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: "USER",
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

      return {
        status: 201,
        message: "Account created successfully",
        data: user,
      };
    }),
}); 