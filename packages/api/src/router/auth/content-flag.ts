import { customAlphabet } from "nanoid";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../../trpc";

const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 8);

export const contentFlagRouter = createTRPCRouter({
  flag: protectedProcedure
    .input(
      z.object({
        storyId: z.string().nullish(),
        postId: z.string().nullish(),
        type: z.enum(["SPAM", "NUDE_CONTENT", "HATE_SPEECH", "DISINFORMATION", "VIOLENCE"]),
      }),
    )
    .mutation(async ({ ctx, input: { storyId, postId, type } }) => {
      if (!storyId && !postId) {
        throw new Error("Either storyId or postId must be provided");
      }

      return ctx.prisma.contentFlag.create({
        data: {
          type,
          caseId: nanoid(),
          createdBy: {
            connect: {
              clerkId: ctx.auth.userId,
            },
          },
          post: postId
            ? {
                connect: {
                  id: postId,
                },
              }
            : undefined,
          story: storyId
            ? {
                connect: {
                  id: storyId,
                },
              }
            : undefined,
        },
      });
    }),
});
