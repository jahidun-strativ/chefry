import { z } from "zod";

import { adminProcedure, createTRPCRouter } from "../../trpc";

export const contentFlagRouter = createTRPCRouter({
  get: adminProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input: { id } }) => {
    return ctx.prisma.contentFlag.findUnique({
      where: { id },
      include: {
        post: { include: { createdBy: true, media: true } },
        story: { include: { createdBy: true, media: true } },
        createdBy: true,
      },
    });
  }),
  list: adminProcedure
    .input(
      z.object({
        pageSize: z.number().min(1).max(100),
        page: z.number().min(0),
        // userType: z.enum(["STAR", "STAR_TRACKER"]).nullish(),
        // searchText: z.string().nullish(),
      }),
    )
    .query(async ({ ctx, input: { pageSize, page } }) => {
      // const where: Prisma.UserWhereInput = {
      //   type: userType ? userType : undefined,
      //   OR: searchText
      //     ? [
      //         {
      //           username: {
      //             contains: searchText,
      //             mode: "insensitive",
      //           },
      //         },
      //         {
      //           email: {
      //             contains: searchText,
      //             mode: "insensitive",
      //           },
      //         },
      //         {
      //           bio: {
      //             contains: searchText,
      //             mode: "insensitive",
      //           },
      //         },
      //         {
      //           id: {
      //             contains: searchText,
      //             mode: "insensitive",
      //           },
      //         },
      //         {
      //           verificationReferenceNumber: {
      //             contains: searchText,
      //             mode: "insensitive",
      //           },
      //         },
      //       ]
      //     : undefined,
      // };

      const contentFlags = await ctx.prisma.contentFlag.findMany({
        orderBy: { createdAt: "desc" },
        include: { post: { include: { createdBy: true } }, story: { include: { createdBy: true } }, createdBy: true },
        skip: page * pageSize,
        take: pageSize,
      });

      const count = await ctx.prisma.contentFlag.count({});

      return {
        contentFlags,
        count,
      };
    }),

  toggleRemove: adminProcedure.input(z.object({ contentFlagId: z.string() })).mutation(async ({ ctx, input: { contentFlagId } }) => {
    const contentFlag = await ctx.prisma.contentFlag.findUnique({ where: { id: contentFlagId }, include: { post: true, story: true } });

    const post = contentFlag?.post;
    const story = contentFlag?.story;

    if (!contentFlag) {
      throw new Error("User not found");
    }

    if (post) {
      await ctx.prisma.post.update({ where: { id: post.id }, data: { removed: !post.removed } });
    } else if (story) {
      await ctx.prisma.story.update({ where: { id: story.id }, data: { removed: !story.removed } });
    } else {
      throw new Error("Something went wrong");
    }
  }),
});
