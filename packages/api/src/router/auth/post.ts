import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { INTERESTS } from "../../utils/enums";
import { sendNotification } from "../../utils/send-notification";

export const postRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        username: z.string().nullish(),
        limit: z.number().min(1).max(100).nullish().default(10),
        cursor: z.string().nullish(),
        isDiscoverFeed: z.boolean().nullish(),
        tags: z.array(z.enum(INTERESTS)).nullish(),
      }),
    )
    .query(async ({ ctx, input: { username, isDiscoverFeed, limit: limit_, cursor, tags } }) => {
      const limit = limit_ ?? 10;

      const items = await ctx.prisma.post.findMany({
        where: {
          removed: false,
          eventPackage: null,
          // starPost: username ? undefined : false,

          createdBy: {
            NOT: !username
              ? {
                  clerkId: ctx.auth.userId,
                }
              : undefined,
            blockedByUsers: {
              none: {
                clerkId: ctx.auth.userId,
              },
            },
          },
          OR: username
            ? [{ starPost: true }, { starPost: false }]
            : [
                {
                  starPost: false,
                },
                {
                  starPost: true,
                  createdBy: {
                    followers: {
                      some: {
                        followingUser: {
                          clerkId: ctx.auth.userId,
                        },
                        type: "STAR_TRACKER",
                      },
                    },
                  },
                },
              ],
          AND: [
            {
              createdBy: username
                ? { username }
                : isDiscoverFeed
                  ? {
                      followers: {
                        none: {
                          followingUser: {
                            clerkId: ctx.auth.userId,
                          },
                        },
                      },
                      verified: true,
                    }
                  : {
                      followers: {
                        some: {
                          followingUser: {
                            clerkId: ctx.auth.userId,
                          },
                        },
                      },
                    },
            },
            {
              createdBy: tags && tags.length !== 0 ? { tags: { hasSome: tags } } : undefined,
            },
          ],
          hiddenBy: {
            none: {
              clerkId: ctx.auth.userId,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        select: {
          id: true,
          createdAt: true,
          caption: true,
          starPost: true,
          createdBy: {
            select: {
              id: true,
              username: true,
              image: true,
              verified: true,
            },
          },
          media: {
            select: {
              id: true,
              url: true,
              thumbhash: true,
              type: true,
              width: true,
              height: true,
              cropX: true,
              cropY: true,
              cropWidth: true,
              cropHeight: true,
              thumbnail: {
                select: {
                  id: true,
                  url: true,
                },
              },
            },
          },
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem!.id;
      }

      return { items, nextCursor };
    }),
  count: protectedProcedure
    .input(z.object({ username: z.string().nullish(), isDiscoverFeed: z.boolean().nullish() }))
    .query(async ({ ctx, input: { username, isDiscoverFeed } }) => {
      return ctx.prisma.post.count({
        where: {
          eventPackage: null,
          createdBy: username
            ? { username }
            : isDiscoverFeed
              ? {
                  followers: {
                    none: {
                      followingUser: {
                        clerkId: ctx.auth.userId,
                      },
                    },
                  },
                }
              : {
                  followers: {
                    some: {
                      followingUser: {
                        clerkId: ctx.auth.userId,
                      },
                    },
                  },
                },
        },
      });
    }),
  get: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input: { id } }) => {
    return ctx.prisma.post.findFirst({
      where: {
        id,
        removed: false,
      },
      select: {
        id: true,
        createdAt: true,
        caption: true,
        starPost: true,
        createdBy: {
          select: {
            id: true,
            username: true,
            image: true,
            verified: true,
          },
        },
        media: {
          select: {
            id: true,
            url: true,
            thumbhash: true,
            type: true,
            width: true,
            height: true,
            cropX: true,
            cropY: true,
            cropWidth: true,
            cropHeight: true,
            thumbnail: {
              select: {
                id: true,
                url: true,
              },
            },
          },
        },
      },
    });
  }),

  postReactions: protectedProcedure.input(z.object({ postId: z.string() })).query(async ({ ctx, input: { postId } }) => {
    const [myReaction, heartReactionCount, smileReactionCount, starReactionCount] = await Promise.all([
      ctx.prisma.postReaction.findFirst({
        where: {
          postId,
          user: {
            clerkId: ctx.auth.userId,
          },
        },
      }),

      ctx.prisma.postReaction.count({
        where: {
          postId,
          type: "HEART",
        },
      }),

      ctx.prisma.postReaction.count({
        where: {
          postId,
          type: "SMILE",
        },
      }),

      ctx.prisma.postReaction.count({
        where: {
          postId,
          type: "STAR",
        },
      }),
    ]);

    return {
      myReaction: myReaction?.type ?? null,
      heartReactionCount,
      smileReactionCount,
      starReactionCount,
    };
  }),

  create: protectedProcedure
    .input(
      z.object({
        mediaId: z.string(),
        caption: z.string().nullish(),
        starPost: z.boolean(),
        eventPackageId: z.string().nullish(),
      }),
    )
    .mutation(async ({ ctx, input: { mediaId, caption, eventPackageId, starPost } }) => {
      if (eventPackageId) {
        const eventPackage = await ctx.prisma.eventPackage.findFirst({
          where: {
            id: eventPackageId,
            createdBy: {
              clerkId: ctx.auth.userId,
            },
          },
        });

        if (!eventPackage) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Event package not found" });
        }
      }

      const post = await ctx.prisma.post.create({
        data: {
          caption,
          starPost,
          eventPackage: eventPackageId ? { connect: { id: eventPackageId } } : undefined,
          createdBy: {
            connect: {
              clerkId: ctx.auth.userId,
            },
          },
          media: {
            connect: {
              id: mediaId,
            },
          },
        },
      });

      if (!eventPackageId) {
        try {
          const followers = await ctx.prisma.userFollow.findMany({
            where: {
              followedUser: {
                clerkId: ctx.auth.userId,
              },
            },
            include: {
              followingUser: {
                select: {
                  expoPushToken: true,
                },
              },
            },
          });

          const me = await ctx.prisma.user.findUnique({
            where: {
              clerkId: ctx.auth.userId,
            },
            select: {
              username: true,
            },
          });

          const followersWithPushToken = followers.filter((f) => f.followingUser.expoPushToken != null);

          await Promise.all(
            followersWithPushToken.map((f) =>
              sendNotification({
                expoPushToken: f.followingUser.expoPushToken!,
                title: "New post",
                body: "New post from " + me?.username,
                data: { postId: post.id },
              }),
            ),
          );
        } catch (e) {
          console.error("notification send error", e);
        }
      } else {
        try {
          const users = await ctx.prisma.user.findMany({
            where: {
              boughtEventPackages: {
                some: {
                  id: eventPackageId,
                },
              },
            },
          });

          const eventPackage = await ctx.prisma.eventPackage.findUnique({
            where: {
              id: eventPackageId,
            },
          });

          const me = await ctx.prisma.user.findUnique({
            where: {
              clerkId: ctx.auth.userId,
            },
            select: {
              username: true,
            },
          });

          const usersWithPushToken = users.filter((f) => f.expoPushToken != null);

          await Promise.all(
            usersWithPushToken.map((f) =>
              sendNotification({
                expoPushToken: f.expoPushToken!,
                title: "New post on package " + eventPackage?.name,
                body: "New post from " + me?.username,
                data: { postId: post.id },
              }),
            ),
          );
        } catch (e) {
          console.error(e);
        }
      }

      return post;
    }),
  delete: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input: { id } }) => {
    const post = await ctx.prisma.post.findUnique({
      where: {
        id: id,
      },
      select: {
        createdBy: {
          select: {
            clerkId: true,
          },
        },
      },
    });

    if (!post) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
    }

    if (post.createdBy.clerkId !== ctx.auth.userId) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to delete this post" });
    }

    return ctx.prisma.post.delete({
      where: {
        id,
      },
    });
  }),
  react: protectedProcedure
    .input(z.object({ postId: z.string(), reactionType: z.enum(["HEART", "SMILE", "STAR"]) }))
    .mutation(async ({ ctx, input: { postId, reactionType } }) => {
      const post = await ctx.prisma.post.findUnique({
        where: {
          id: postId,
        },
      });

      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }

      const existingReaction = await ctx.prisma.postReaction.findFirst({
        where: {
          postId,
          user: {
            clerkId: ctx.auth.userId,
          },
        },
      });

      if (existingReaction) {
        const deletion = await ctx.prisma.postReaction.delete({
          where: {
            id: existingReaction.id,
          },
        });

        if (existingReaction.type === reactionType) {
          return deletion;
        }
      }

      return ctx.prisma.postReaction.create({
        data: {
          post: {
            connect: {
              id: postId,
            },
          },
          user: {
            connect: {
              clerkId: ctx.auth.userId,
            },
          },
          type: reactionType,
        },
      });
    }),
  update: protectedProcedure
    .input(z.object({ id: z.string(), caption: z.string().nullish(), isStarPost: z.boolean().nullish() }))
    .mutation(async ({ ctx, input: { id, caption, isStarPost } }) => {
      const post = await ctx.prisma.post.findFirst({
        where: {
          id,
          createdBy: {
            clerkId: ctx.auth.userId,
          },
        },
      });

      if (!post) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You're not the owner of this story" });
      }

      return ctx.prisma.post.update({
        where: {
          id,
        },
        data: {
          starPost: isStarPost != null ? isStarPost : undefined,
          caption: caption != null ? caption : undefined,
        },
      });
    }),
  hide: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input: { id } }) => {
    return ctx.prisma.post.update({
      where: {
        id,
      },
      data: {
        hiddenBy: {
          connect: {
            clerkId: ctx.auth.userId,
          },
        },
      },
    });
  }),
});
