/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { clerkClient } from "@clerk/nextjs";
import { TRPCError } from "@trpc/server";
import fetch from "node-fetch";
import { z } from "zod";

import type { Prisma } from "@startracker/db";

import { adminProcedure, createTRPCRouter } from "../../trpc";
import { stripe } from "../../utils/stripe";

export const userRouter = createTRPCRouter({
  list: adminProcedure
    .input(
      z.object({
        pageSize: z.number().min(1).max(100),
        page: z.number().min(0),
        userType: z.enum(["VERIFIED", "NON_VERIFIED"]).nullish(),
        searchText: z.string().nullish(),
      }),
    )
    .query(async ({ ctx, input: { pageSize, page, userType, searchText } }) => {
      const where: Prisma.UserWhereInput = {
        verified: userType === "VERIFIED" ? true : userType === "NON_VERIFIED" ? false : undefined,
        OR: searchText
          ? [
              {
                username: {
                  contains: searchText,
                  mode: "insensitive",
                },
              },
              {
                email: {
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
              {
                id: {
                  contains: searchText,
                  mode: "insensitive",
                },
              },
              {
                verificationReferenceNumber: {
                  contains: searchText,
                  mode: "insensitive",
                },
              },
            ]
          : undefined,
      };

      const users = await ctx.prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        include: { image: true },
        skip: page * pageSize,
        take: pageSize,
        where,
      });

      const count = await ctx.prisma.user.count({ where });

      return {
        users,
        count,
      };
    }),
  get: adminProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input: { id } }) => {
    return ctx.prisma.user.findUnique({ where: { id } });
  }),

  toggleVerify: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input: { id } }) => {
    const user = await ctx.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.verified && user.email) {
      // Send mail
      try {
        await fetch("https://api.postmarkapp.com/email/withTemplate", {
          method: "POST",
          headers: new Headers({
            Accept: "application/json",
            "Content-Type": "application/json",
            "X-Postmark-Server-Token": process.env.POSTMARK_API_KEY || "",
          }) as any,
          body: JSON.stringify({
            From: "info@startracker.one",
            To: user.email,
            TemplateAlias: "welcome",
            TemplateModel: {
              product_url: "https://startracker.one",
              product_name: "Star Tracker",
              company_name: "Star Tracker Int AB",
              company_address: "Nybrogatan 56, 114 40 Stockhom",
              name: "Star Tracker",
            },
          }),
        });
      } catch (e) {
        console.error(e);
      }
    }

    const updatedUser = await ctx.prisma.user.update({
      where: { id },
      data: {
        verified: !user.verified,
      },
    });

    return updatedUser;
  }),
  setPrivilegeLevel: adminProcedure
    .input(z.object({ id: z.string(), privilegeLevel: z.enum(["ADMIN", "USER"]) }))
    .mutation(async ({ ctx, input: { id, privilegeLevel } }) => {
      return ctx.prisma.user.update({
        where: { id },
        data: {
          privilegeLevel,
        },
      });
    }),

  delete: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input: { id } }) => {
    const user = await ctx.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new TRPCError({ message: "User not found", code: "NOT_FOUND" });
    }

    const userFollows = await ctx.prisma.userFollow.findMany({
      where: {
        OR: [{ followedUser: { id } }, { followingUser: { id } }],
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
        OR: [{ followedUser: { id } }, { followingUser: { id } }],
      },
    });

    await ctx.prisma.post.deleteMany({
      where: {
        createdBy: { id },
      },
    });

    await ctx.prisma.story.deleteMany({
      where: {
        createdBy: { id },
      },
    });

    await ctx.prisma.media.deleteMany({
      where: {
        owner: { id },
      },
    });

    await ctx.prisma.user.delete({ where: { id } });

    try {
      await clerkClient.users.deleteUser(user.clerkId);
    } catch (e) {
      console.error(e);
    }

    return true;
  }),
});
