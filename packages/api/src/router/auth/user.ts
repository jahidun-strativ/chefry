import { clerkClient } from "@clerk/nextjs";
import { TRPCError } from "@trpc/server";
import { customAlphabet } from "nanoid";
import fetch from "node-fetch";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { INTERESTS } from "../../utils/enums";
import generateImageThumbhash from "../../utils/generate-image-thumbhash";
import { createMediaSchema } from "../../utils/schemas";
import { stripe } from "../../utils/stripe";

const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 8);

export const userRouter = createTRPCRouter({
  byUsernames: protectedProcedure.input(z.array(z.string())).query(async ({ ctx, input }) => {
    return ctx.prisma.user.findMany({
      where: {
        username: {
          in: input,
        },
      },
      include: {
        image: true,
        followers: {
          where: {
            followingUser: {
              clerkId: ctx.auth.userId,
            },
          },
        },
      },
    });
  }),
  me: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findUnique({
      where: { clerkId: ctx.auth.userId },
      include: { image: true },
    });
  }),
  myStarFollows: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.userFollow.findMany({
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
  }),
  byUsername: protectedProcedure.input(z.object({ username: z.string() })).query(async ({ ctx, input: { username } }) => {
    return ctx.prisma.user.findUnique({
      where: { username },
      include: {
        image: true,
      },
    });
  }),
  setPushToken: protectedProcedure.input(z.object({ pushToken: z.string() })).mutation(async ({ ctx, input: { pushToken } }) => {
    const existingUserWithPushToken = await ctx.prisma.user.findUnique({ where: { expoPushToken: pushToken } });

    if (existingUserWithPushToken && existingUserWithPushToken.clerkId !== ctx.auth.userId) {
      await ctx.prisma.user.update({
        where: { id: existingUserWithPushToken.id },
        data: { expoPushToken: null },
      });

      return true;
    } else if (existingUserWithPushToken && existingUserWithPushToken.clerkId === ctx.auth.userId) {
      return true;
    }

    await ctx.prisma.user.update({
      where: { clerkId: ctx.auth.userId },
      data: { expoPushToken: pushToken },
    });

    return true;
  }),
  metaInfo: protectedProcedure.input(z.object({ username: z.string() })).query(async ({ ctx, input: { username } }) => {
    const [followerCount, startrackerCount, starPostsCount, postsCount] = await Promise.all([
      ctx.prisma.userFollow.count({ where: { followedUser: { username }, type: "DEFAULT" } }),
      ctx.prisma.userFollow.count({ where: { followedUser: { username }, type: "STAR_TRACKER" } }),
      ctx.prisma.post.count({ where: { createdBy: { username }, starPost: true } }),
      ctx.prisma.post.count({ where: { createdBy: { username }, starPost: false } }),
    ]);
    return { followerCount, startrackerCount, postsCount, starPostsCount };
  }),
  myInterests: protectedProcedure.query(async ({ ctx }) => {
    const me = await ctx.prisma.user.findUnique({ where: { clerkId: ctx.auth.userId } });
    return me?.interests ?? [];
  }),
  followers: protectedProcedure
    .input(
      z.object({
        type: z.enum(["followers", "subscribers"]),
        limit: z.number().min(1).max(100).nullish().default(10),
        cursor: z.string().nullish(),
      }),
    )
    .query(async ({ ctx, input: { type, limit: limit_, cursor } }) => {
      const limit = limit_ ?? 10;

      const items = await ctx.prisma.user.findMany({
        where: {
          following: {
            some: {
              followedUser: {
                clerkId: ctx.auth.userId,
              },
              type: type === "followers" ? "DEFAULT" : "STAR_TRACKER",
            },
          },
        },
        orderBy: { username: "asc" },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        include: {
          image: true,
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem!.id;
      }

      return { items, nextCursor };
    }),
  search: protectedProcedure
    .input(z.object({ searchText: z.string(), interests: z.array(z.enum(INTERESTS)).nullish() }))
    .query(async ({ ctx, input: { searchText, interests } }) => {
      return ctx.prisma.user.findMany({
        where: {
          interests:
            interests && interests.length !== 0
              ? {
                  hasEvery: interests,
                }
              : undefined,
          OR: [
            {
              username: {
                contains: searchText,
                mode: "insensitive",
              },
            },
            {
              bio: {
                contains: searchText,
                mode: "insensitive",
              },
            },
          ],
          // type: "STAR",
          // verified: true,
          clerkId: {
            not: ctx.auth.userId,
          },
          blockedByUsers: {
            none: {
              clerkId: ctx.auth.userId,
            },
          },
        },
        include: {
          image: true,
          followers: {
            where: {
              followingUser: {
                clerkId: ctx.auth.userId,
              },
            },
          },
        },
        orderBy: { followers: { _count: "desc" } },
        take: 10,
      });
    }),
  suggestions: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findMany({
      where: {
        type: "STAR",
        clerkId: {
          not: ctx.auth.userId,
        },
        blockedByUsers: {
          none: {
            clerkId: ctx.auth.userId,
          },
        },
        followers: {
          none: {
            followingUser: {
              clerkId: ctx.auth.userId,
            },
          },
        },
      },
      orderBy: { followers: { _count: "desc" } },
      include: {
        image: true,
        followers: {
          where: {
            followingUser: {
              clerkId: ctx.auth.userId,
            },
          },
        },
      },
      take: 10,
    });
  }),
  requestVerifiction: protectedProcedure
    .input(z.object({ fullName: z.string(), phone: z.string(), agency: z.string() }))
    .mutation(async ({ ctx, input: { agency, fullName, phone } }) => {
      const user = await ctx.prisma.user.findUnique({ where: { clerkId: ctx.auth.userId } });

      if (!user) {
        throw new TRPCError({ message: "User not found", code: "NOT_FOUND" });
      }

      if (user.requestedVerification) {
        throw new TRPCError({ message: "Verification already requested", code: "BAD_REQUEST" });
      }

      if (user.verified) {
        throw new TRPCError({ message: "User already verified", code: "BAD_REQUEST" });
      }

      await fetch("https://api.postmarkapp.com/email", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Postmark-Server-Token": process.env.POSTMARK_API_KEY || "",
        },
        body: JSON.stringify({
          From: "info@startracker.one",
          To: "info@startracker.one",
          Subject: `${user.verificationReferenceNumber.toUpperCase()}: Star verification request from ${user.username}`,
          TextBody: `
        Username: ${user.username}
        Email: ${user.email}
        Verification reference: ${user.verificationReferenceNumber.toUpperCase()}
        Agency: ${agency}
        Full name: ${fullName}
        Phone: ${phone}
        `,
          MessageStream: "outbound",
        }),
      });

      return ctx.prisma.user.update({
        where: { clerkId: ctx.auth.userId },
        data: { requestedVerification: true },
      });
    }),
  blockList: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findMany({
      where: {
        blockedByUsers: {
          some: {
            clerkId: ctx.auth.userId,
          },
        },
      },
      include: {
        image: true,
      },
    });
  }),

  create: protectedProcedure
    .input(z.object({ username: z.string().nullish() }))
    .mutation(async ({ ctx, input: { username: _username } }) => {
      const clerkId = ctx.auth.userId;

      let username = _username;

      if (!username) {
        const clerkUser = await clerkClient.users.getUser(clerkId);

        if (!clerkUser?.username) {
          throw new Error("User not found");
        }

        username = clerkUser.username;
      }

      username = username.toLowerCase();

      if (!/^[a-z0-9_-]+$/.test(username)) {
        throw new TRPCError({
          message: "Username can only contain lowercase (a-z) letters, numbers, underscores (_) and hyphens (-)",
          code: "BAD_REQUEST",
        });
      }

      const existingUser = await ctx.prisma.user.findFirst({
        where: {
          OR: [{ username: username }, { clerkId }],
        },
      });

      if (existingUser) {
        throw new Error("Username already taken");
      }

      const clerkUser = await clerkClient.users.getUser(clerkId);

      const user = await ctx.prisma.user.create({
        data: {
          username,
          clerkId,
          // type,
          email: clerkUser?.emailAddresses?.[0]?.emailAddress ?? null,
          verificationReferenceNumber: nanoid(),
        },
      });

      const customer = await stripe.customers.create({
        email: user.email || undefined,
        // name: user.username,
        metadata: {
          userId: user.id,
        },
      });

      return ctx.prisma.user.update({
        where: {
          clerkId,
        },
        data: {
          stripeCustomerId: customer.id,
        },
      });
    }),
  update: protectedProcedure
    .input(
      z.object({
        type: z.enum(["STAR", "STAR_TRACKER"]).nullish(),
        wizardCompleted: z.boolean().nullish(),
        interests: z.array(z.enum(INTERESTS)).nullish(),
        interestsSet: z.boolean().nullish(),
        bio: z.string().nullish(),
        username: z.string().nullish(),
        tags: z.enum(INTERESTS).array().nullish(),
      }),
    )
    .mutation(async ({ ctx, input: { type, wizardCompleted, bio, interests, username, interestsSet, tags } }) => {
      const user = await ctx.prisma.user.findUnique({ where: { clerkId: ctx.userId } });

      if (!user) {
        throw new Error("User not found");
      }

      if (username) {
        if (!/^[a-z0-9_-]+$/.test(username)) {
          throw new TRPCError({
            message: "Username can only contain lowercase (a-z) letters, numbers, underscores (_) and hyphens (-)",
            code: "BAD_REQUEST",
          });
        }
        const existingUser = await ctx.prisma.user.findFirst({
          where: {
            username,
          },
        });

        if (existingUser && existingUser.clerkId !== ctx.userId) {
          throw new TRPCError({ message: "Username already exists", code: "CONFLICT" });
        }
      }

      return ctx.prisma.user.update({
        data: {
          type: type ? type : undefined,
          interests: interests ? interests : undefined,
          wizardCompleted: wizardCompleted ?? undefined,
          interestsSet: interestsSet ?? undefined,
          username: username ?? undefined,
          bio: bio ?? undefined,
          verified: type === "STAR" ? true : undefined,
          tags: tags ? { set: tags } : undefined,
        },
        where: {
          clerkId: ctx.userId,
        },
      });
    }),
  updateProfileImage: protectedProcedure
    .input(
      z.object({
        media: createMediaSchema,
      }),
    )
    .mutation(async ({ ctx, input: { media } }) => {
      if (media.fileType !== "image") {
        throw new Error("Invalid file type");
      }

      const urlEndpoint = "https://ik.imagekit.io/shader/";
      const mediaUrl = urlEndpoint + media.url;
      const thumbhash = await generateImageThumbhash(mediaUrl);

      return ctx.prisma.user.update({
        where: {
          clerkId: ctx.userId,
        },
        data: {
          image: {
            create: {
              height: media.height,
              width: media.width,
              name: media.url,
              size: media.size,
              type: "IMAGE",
              url: media.url,
              thumbhash,
            },
          },
        },
      });
    }),
  delete: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({ where: { clerkId: ctx.userId } });

    if (!user) {
      throw new TRPCError({ message: "User not found", code: "NOT_FOUND" });
    }

    const userFollows = await ctx.prisma.userFollow.findMany({
      where: {
        OR: [{ followedUser: { clerkId: ctx.userId } }, { followingUser: { clerkId: ctx.userId } }],
      },
    });

    const activeSubscriptionIds = userFollows
      .filter((userFollow) => userFollow.subscriptionId)
      .map((userFollow) => userFollow.subscriptionId)
      .filter(Boolean) as string[];

    for (const subscriptionId of activeSubscriptionIds) {
      await stripe.subscriptions.cancel(subscriptionId);
    }

    await ctx.prisma.userFollow.deleteMany({
      where: {
        OR: [{ followedUser: { clerkId: ctx.userId } }, { followingUser: { clerkId: ctx.userId } }],
      },
    });

    await ctx.prisma.post.deleteMany({
      where: {
        createdBy: { clerkId: ctx.userId },
      },
    });

    await ctx.prisma.story.deleteMany({
      where: {
        createdBy: { clerkId: ctx.userId },
      },
    });

    await ctx.prisma.media.deleteMany({
      where: {
        owner: { clerkId: ctx.userId },
      },
    });

    await ctx.prisma.user.delete({ where: { clerkId: ctx.userId } });

    await clerkClient.users.deleteUser(ctx.userId);

    return true;
  }),
  block: protectedProcedure.input(z.object({ username: z.string() })).mutation(async ({ ctx, input: { username } }) => {
    const user = await ctx.prisma.user.findUnique({ where: { username } });

    if (!user) {
      throw new TRPCError({ message: "User not found", code: "NOT_FOUND" });
    }

    if (user.clerkId === ctx.userId) {
      throw new TRPCError({ message: "You cannot block yourself", code: "BAD_REQUEST" });
    }

    const alreadyBlocked = await ctx.prisma.user.findFirst({
      where: {
        blockedByUsers: {
          some: {
            clerkId: ctx.userId,
          },
        },
        username,
      },
    });

    if (alreadyBlocked) {
      throw new TRPCError({ message: "User already blocked", code: "BAD_REQUEST" });
    }

    const userFollow = await ctx.prisma.userFollow.findFirst({
      where: {
        followedUser: {
          username,
        },
        followingUser: {
          clerkId: ctx.auth.userId,
        },
      },
    });

    const subscriptionId = userFollow?.subscriptionId;
    if (subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      if (subscription) {
        await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true });
      }
    }

    return ctx.prisma.user.update({
      where: {
        clerkId: ctx.userId,
      },
      data: {
        blockedUsers: {
          connect: {
            username,
          },
        },
      },
    });
  }),
  unblock: protectedProcedure.input(z.object({ username: z.string() })).mutation(async ({ ctx, input: { username } }) => {
    const user = await ctx.prisma.user.findUnique({ where: { username } });

    if (!user) {
      throw new TRPCError({ message: "User not found", code: "NOT_FOUND" });
    }

    if (user.clerkId === ctx.userId) {
      throw new TRPCError({ message: "You cannot unblock yourself", code: "BAD_REQUEST" });
    }

    return ctx.prisma.user.update({
      where: {
        clerkId: ctx.userId,
      },
      data: {
        blockedUsers: {
          disconnect: {
            username,
          },
        },
      },
    });
  }),
  mySubscriptions: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({ where: { clerkId: ctx.auth.userId } });

    if (!user) {
      throw new TRPCError({ message: "User not found", code: "NOT_FOUND" });
    }

    if (!user.stripeCustomerId) {
      return [];
    }

    const subscriptionsRes = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      // status: "active"
    });

    const subscriptions = subscriptionsRes.data.filter((subscription) => subscription.status === "active");

    const userFollows = await ctx.prisma.userFollow.findMany({
      where: {
        subscriptionId: {
          in: subscriptions.map((subscription) => subscription.id),
        },
      },
      include: {
        followedUser: {
          include: {
            image: true,
          },
        },
      },
    });

    return subscriptions
      .map((subscription) => {
        const userFollow = userFollows.find((userFollow) => userFollow.subscriptionId === subscription.id)!;
        return {
          ...subscription,
          userFollow,
        };
      })
      .filter((sub) => Boolean(sub.userFollow));
  }),
});
