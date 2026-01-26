import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { Prisma } from "@startracker/db";

import { createTRPCRouter, protectedProcedure } from "../../trpc";

const userWithImageInclude = Prisma.validator<Prisma.UserInclude>()({
  image: true,
});

type UserWithImage = Prisma.UserGetPayload<{
  include: typeof userWithImageInclude;
}>;

const storyInclude = Prisma.validator<Prisma.StoryInclude>()({
  media: true,
});

type Story = Prisma.StoryGetPayload<{
  include: typeof storyInclude;
}>;

export const storyRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        username: z.string().nullish(),
      }),
    )
    .query(async ({ ctx, input: { username } }) => {
      const stories = await ctx.prisma.story.findMany({
        where: {
          removed: false,
          createdBy: username
            ? {
                username,
                blockedByUsers: {
                  none: {
                    clerkId: ctx.auth.userId,
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
                blockedByUsers: {
                  none: {
                    clerkId: ctx.auth.userId,
                  },
                },
              },
          OR: [
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
          hiddenBy: {
            none: {
              clerkId: ctx.auth.userId,
            },
          },
        },
        orderBy: { createdAt: "asc" },

        include: {
          media: true,
          createdBy: {
            include: {
              image: true,
            },
          },
          views: {
            where: {
              viewedBy: {
                clerkId: ctx.auth.userId,
              },
            },
          },
        },
      });

      const storyUsers: {
        id: string;
        user: UserWithImage;
        isViewed: boolean;
        isStartracker: boolean;
        latestStory: Date;
        stories: (Story & { isViewed: boolean })[];
      }[] = [];

      const myStarFollows = await ctx.prisma.userFollow.findMany({
        where: {
          followingUser: {
            clerkId: ctx.auth.userId,
          },
          type: "STAR_TRACKER",
        },
        include: {
          followedUser: true,
        },
      });

      for (const story of stories) {
        if (!storyUsers.find((storyUser) => storyUser.user.id === story.createdBy.id)) {
          storyUsers.push({
            id: story.createdBy.id,
            user: story.createdBy,
            latestStory: story.createdAt,
            isStartracker:
              story.createdBy.clerkId === ctx.auth.userId ||
              !!myStarFollows.find((follow) => follow.followedUser.id === story.createdBy.id),
            isViewed: false,
            stories: [{ ...story, isViewed: story.views.length > 0 }],
          });
        } else {
          const userIndex = storyUsers.findIndex((storyUser) => storyUser.user.id === story.createdBy.id);
          if (userIndex === -1) throw new Error("User not found");

          if (storyUsers[userIndex]!.latestStory < story.createdAt) {
            storyUsers[userIndex]!.latestStory = story.createdAt;
          }
          storyUsers[userIndex]!.stories.push({ ...story, isViewed: story.views.length > 0 });
        }
      }

      return storyUsers
        .sort((a, b) => b.latestStory.getTime() - a.latestStory.getTime())
        .map((storyUser) => ({
          ...storyUser,
          isViewed: storyUser.stories.every((story) => story.isViewed),
        }))
        .sort((a, b) => (a.isViewed === b.isViewed ? 0 : a.isViewed ? 1 : -1));
    }),
  get: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input: { id } }) => {
    return ctx.prisma.story.findFirst({
      where: {
        id,
        removed: false,
      },
      include: {
        media: true,
        createdBy: {
          include: {
            image: true,
          },
        },
        views: {
          where: {
            viewedBy: {
              clerkId: ctx.auth.userId,
            },
          },
        },
      },
    });
  }),

  create: protectedProcedure
    .input(
      z.object({
        mediaId: z.string(),
        caption: z.string().nullish(),
        starPost: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input: { mediaId, starPost, caption } }) => {
      return ctx.prisma.story.create({
        data: {
          starPost,
          caption,
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
    }),
  delete: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input: { id } }) => {
    const story = await ctx.prisma.story.findFirst({
      where: {
        id,
        createdBy: {
          clerkId: ctx.auth.userId,
        },
      },
    });

    if (!story) {
      return new TRPCError({ code: "FORBIDDEN", message: "You're not the owner of this story" });
    }

    return ctx.prisma.story.delete({
      where: {
        id,
      },
    });
  }),
  registerView: protectedProcedure
    .input(
      z.object({
        storyId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input: { storyId } }) => {
      const isViewed = await ctx.prisma.storyView.findFirst({
        where: {
          storyId,
          viewedBy: {
            clerkId: ctx.auth.userId,
          },
        },
      });

      if (isViewed) {
        return null;
      }

      return ctx.prisma.storyView.create({
        data: {
          story: {
            connect: {
              id: storyId,
            },
          },
          viewedBy: {
            connect: {
              clerkId: ctx.auth.userId,
            },
          },
        },
      });
    }),
  update: protectedProcedure
    .input(z.object({ id: z.string(), caption: z.string().nullish(), isStarPost: z.boolean().nullish() }))
    .mutation(async ({ ctx, input: { id, caption, isStarPost } }) => {
      const story = await ctx.prisma.story.findFirst({
        where: {
          id,
          createdBy: {
            clerkId: ctx.auth.userId,
          },
        },
      });

      if (!story) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You're not the owner of this story" });
      }

      return ctx.prisma.story.update({
        where: {
          id,
        },
        data: {
          caption: caption != null ? caption : undefined,
          starPost: isStarPost != null ? isStarPost : undefined,
        },
      });
    }),
  hide: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input: { id } }) => {
    return ctx.prisma.story.update({
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
