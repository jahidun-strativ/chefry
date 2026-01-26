import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { stripe } from "../../utils/stripe";

export const userFollowRouter = createTRPCRouter({
  get: protectedProcedure.input(z.object({ username: z.string() })).query(async ({ ctx, input: { username } }) => {
    const user = await ctx.prisma.user.findUnique({ where: { username } });

    if (!user) {
      throw new TRPCError({ message: "User not found", code: "NOT_FOUND" });
    }

    if (user?.clerkId === ctx.auth.userId) {
      return null;
    }

    return ctx.prisma.userFollow.findFirst({
      where: {
        followingUser: {
          clerkId: ctx.auth.userId,
        },
        followedUser: {
          clerkId: user.clerkId,
        },
      },
    });
  }),

  list: protectedProcedure
    .input(
      z.object({
        myFollowers: z.boolean().nullish(),
        type: z.enum(["DEFAULT", "STAR_TRACKER"]).nullish(),
        limit: z.number().min(1).max(100).nullish().default(10),
        cursor: z.string().nullish(),
      }),
    )
    .query(async ({ ctx, input: { limit: limit_, cursor, myFollowers, type } }) => {
      const limit = limit_ ?? 10;
      const user = await ctx.prisma.user.findUnique({
        where: {
          clerkId: ctx.auth.userId,
        },
      });

      if (!myFollowers && user?.privilegeLevel !== "ADMIN") {
        throw new Error("You do not have permission to view this user's followers");
      }

      const items = await ctx.prisma.userFollow.findMany({
        where: {
          followedUser: {
            clerkId: ctx.auth.userId,
          },
          type: type ?? undefined,
        },
        include: {
          followingUser: {
            include: {
              image: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem!.id;
      }

      return { items, nextCursor };
    }),

  toggleFollow: protectedProcedure.input(z.object({ username: z.string() })).mutation(async ({ ctx, input: { username } }) => {
    const me = await ctx.prisma.user.findUnique({ where: { clerkId: ctx.userId } });

    if (!me) {
      throw new TRPCError({ message: "User not found", code: "NOT_FOUND" });
    }

    if (me.username === username) {
      throw new TRPCError({ message: "You cannot follow yourself", code: "CONFLICT" });
    }

    const user = await ctx.prisma.user.findUnique({ where: { username } });

    if (!user) {
      throw new TRPCError({ message: "User not found", code: "NOT_FOUND" });
    }

    const existingFollow = await ctx.prisma.userFollow.findFirst({
      where: {
        followedUser: {
          username,
        },
        followingUser: {
          clerkId: ctx.userId,
        },
      },
    });

    if (!existingFollow) {
      return ctx.prisma.userFollow.create({
        data: {
          followedUser: {
            connect: {
              username,
            },
          },
          type: "DEFAULT",
          followingUser: {
            connect: {
              clerkId: ctx.userId,
            },
          },
        },
      });
    } else {
      if (existingFollow.type === "DEFAULT") {
        return ctx.prisma.userFollow.delete({
          where: {
            id: existingFollow.id,
          },
        });
      }
    }

    return null;
    // if (existingFollows.length !== 0) {
    //   const deletions = await ctx.prisma.userFollow.deleteMany({
    //     where: {
    //       followedUser: {
    //         username,
    //       },
    //       followingUser: {
    //         clerkId: ctx.userId,
    //       },
    //     },
    //   });

    //   if (existingFollows?.[0]?.type === "DEFAULT" && starttracker) {
    //     return ctx.prisma.userFollow.create({
    //       data: {
    //         followedUser: {
    //           connect: {
    //             username,
    //           },
    //         },
    //         type: starttracker ? "STAR_TRACKER" : "DEFAULT",
    //         followingUser: {
    //           connect: {
    //             clerkId: ctx.userId,
    //           },
    //         },
    //       },
    //     });
    //   } else {
    //     if (starttracker) {
    //       return ctx.prisma.userFollow.create({
    //         data: {
    //           followedUser: {
    //             connect: {
    //               username,
    //             },
    //           },
    //           type: "DEFAULT",
    //           followingUser: {
    //             connect: {
    //               clerkId: ctx.userId,
    //             },
    //           },
    //         },
    //       });
    //     } else {
    //       return deletions;
    //     }
    //   }
    // } else {
    //   return ctx.prisma.userFollow.create({
    //     data: {
    //       followedUser: {
    //         connect: {
    //           username,
    //         },
    //       },
    //       type: starttracker ? "STAR_TRACKER" : "DEFAULT",
    //       followingUser: {
    //         connect: {
    //           clerkId: ctx.userId,
    //         },
    //       },
    //     },
    //   });
    // }
  }),
  removeFollower: protectedProcedure.input(z.object({ username: z.string() })).mutation(async ({ ctx, input: { username } }) => {
    const existingFollow = await ctx.prisma.userFollow.findFirst({
      where: {
        followedUser: {
          clerkId: ctx.userId,
        },
        followingUser: {
          username,
        },
      },
    });

    if (!existingFollow) {
      throw new TRPCError({ message: "You are not following this user", code: "NOT_FOUND" });
    }

    if (existingFollow.subscriptionId) {
      await stripe.subscriptions.update(existingFollow.subscriptionId, { cancel_at_period_end: true }); //.(userFollow.subscriptionId);
    }

    return ctx.prisma.userFollow.delete({
      where: {
        id: existingFollow.id,
      },
    });
  }),
});
