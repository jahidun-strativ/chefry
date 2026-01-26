import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { stripe } from "../../utils/stripe";

export const eventPackageRouter = createTRPCRouter({
  get: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input: { id } }) => {
    return ctx.prisma.eventPackage.findFirst({
      where: {
        id,
      },
      include: {
        _count: { select: { posts: true } },
        boughtBy: { where: { clerkId: ctx.auth.userId } },
      },
    });
  }),
  getWithPosts: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input: { id } }) => {
    return ctx.prisma.eventPackage.findFirst({
      where: {
        id,
        OR: [{ createdBy: { clerkId: ctx.auth.userId } }, { boughtBy: { some: { clerkId: ctx.auth.userId } } }],
      },
      include: {
        _count: { select: { posts: true } },
        posts: {
          orderBy: { createdAt: "desc" },
          include: { createdBy: { include: { image: true } }, media: { include: { thumbnail: true } } },
        },
      },
    });
  }),
  list: protectedProcedure.input(z.object({ username: z.string() })).query(async ({ ctx, input: { username } }) => {
    return ctx.prisma.eventPackage.findMany({
      where: { createdBy: { username }, OR: [{ boughtBy: { some: { clerkId: ctx.auth.userId } } }, { archived: false }] },
      orderBy: { createdAt: "desc" },
      include: {
        posts: {
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            caption: true,
            media: {
              include: {
                thumbnail: true,
              },
            },
          },
        },
        boughtBy: { where: { clerkId: ctx.auth.userId } },
        _count: { select: { posts: true } },
      },
    });
  }),
  myPackages: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.eventPackage.findMany({
      where: { boughtBy: { some: { clerkId: ctx.auth.userId } }, archived: false },
      include: {
        createdBy: true,
        posts: { take: 1, orderBy: { createdAt: "desc" }, include: { media: { include: { thumbnail: true } } } },
        _count: { select: { posts: true } },
      },
    });
  }),

  buy: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input: { id } }) => {
    const eventPackage = await ctx.prisma.eventPackage.findFirst({ where: { id }, include: { createdBy: true } });

    if (!eventPackage) {
      throw new Error("Event package not found");
    }

    const myUser = await ctx.prisma.user.findUnique({ where: { clerkId: ctx.auth.userId } });

    if (!myUser?.stripeCustomerId) {
      throw new Error("User not found");
    }

    const alreadyBought = await ctx.prisma.eventPackage.findFirst({
      where: { id, boughtBy: { some: { clerkId: ctx.auth.userId } } },
    });

    if (alreadyBought) {
      throw new Error("You already bought this package");
    }

    await stripe.customers.update(myUser.stripeCustomerId, {
      tax: {
        ip_address: ctx.ip !== "unknown" ? ctx.ip : undefined,
      },
      expand: ["tax"],
    });

    const userToBuyFrom = await ctx.prisma.user.findUnique({ where: { id: eventPackage.createdBy.id } });
    if (!userToBuyFrom?.stripeConnectedAccountId) {
      throw new Error("User does not have a stripe account");
    }

    const connectedAccount = await stripe.accounts.retrieve(userToBuyFrom.stripeConnectedAccountId);

    if (!connectedAccount) {
      throw new Error("Stripe account not found");
    }

    const price = await stripe.prices.retrieve(eventPackage.stripePriceId);

    if (!price || price.unit_amount == null) {
      throw new Error("Price not found");
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      customer: myUser.stripeCustomerId,
      automatic_tax: {
        enabled: true,
      },
      customer_update: {
        address: "auto",
      },
      payment_method_types: ["card"],
      success_url: process.env.WEB_URL + `/checkout/event-package-payment-complete?eventPackageId=${eventPackage.id}`,
      cancel_url: process.env.WEB_URL + "/checkout/error",
      metadata: {
        type: "eventPackage",
        eventPackageId: eventPackage.id,
        userId: myUser.id,
      },
      payment_intent_data: {
        transfer_data: {
          destination: userToBuyFrom.stripeConnectedAccountId,
          amount: price.unit_amount * 0.7,
        },
      },
    });

    return session;
  }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        price: z.number(),
        posts: z.array(
          z.object({
            mediaId: z.string(),
            caption: z.string(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input: { name, description, price, posts } }) => {
      const user = await ctx.prisma.user.findUnique({ where: { clerkId: ctx.auth.userId } });

      if (!user) {
        throw new Error("User not found");
      }

      if (!user?.stripeConnectedAccountId) {
        throw new Error("User does not have a stripe account");
      }

      const connectedAccount = await stripe.accounts.retrieve(user.stripeConnectedAccountId);

      if (!connectedAccount) {
        throw new Error("Stripe account not found");
      }

      const product = await stripe.products.create({
        name: `Star Tracker package of user ${user.username} - ${name}`,
        active: true,
        default_price_data: {
          currency: "eur",
          unit_amount: price * 100,
          tax_behavior: "exclusive",
        },
        metadata: {
          userId: user.id,
        },
      });

      let priceId: string | null = null;
      if (typeof product.default_price == "object" && product.default_price !== null) {
        priceId = product.default_price.id;
      } else if (typeof product.default_price == "string") {
        priceId = product.default_price;
      }

      if (!priceId) {
        throw new Error("Price not found");
      }

      return ctx.prisma.eventPackage.create({
        data: {
          name,
          description,
          createdBy: { connect: { clerkId: ctx.auth.userId } },
          price: price * 100,
          stripeProductId: product.id,
          stripePriceId: priceId,
          posts: {
            create: posts.map((p) => ({
              caption: p.caption,
              media: { connect: { id: p.mediaId } },
              createdBy: { connect: { id: user.id } },
            })),
          },
        },
      });
    }),

  update: protectedProcedure
    .input(z.object({ id: z.string(), name: z.string().nullish(), description: z.string().nullish(), price: z.number().nullish() }))
    .mutation(async ({ ctx, input: { id, name, description, price } }) => {
      const eventPackage = await ctx.prisma.eventPackage.findFirst({
        include: { createdBy: true },
        where: { id, createdBy: { clerkId: ctx.auth.userId } },
      });

      if (!eventPackage) {
        throw new Error("Event package not found");
      }

      if (price != null && price * 100 !== eventPackage.price) {
        const stripePrice = await stripe.prices.create({
          unit_amount: price * 100,
          currency: "eur",
          active: true,
          product: eventPackage.stripeProductId,
          tax_behavior: "exclusive",
        });

        if (!stripePrice) {
          throw new Error("New price could not be created");
        }

        await stripe.products.update(eventPackage.stripeProductId, {
          default_price: stripePrice.id,
        });

        await ctx.prisma.eventPackage.update({
          where: { id },
          data: {
            price: price * 100,
            stripePriceId: stripePrice.id,
          },
        });
      }

      return ctx.prisma.eventPackage.update({
        where: { id },
        data: {
          name: name != null ? name : eventPackage.name,
          description: description != null ? description : eventPackage.description,
        },
      });
    }),
  delete: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input: { id } }) => {
    const eventPackage = await ctx.prisma.eventPackage.findFirst({
      include: { createdBy: true, boughtBy: true },
      where: { id, createdBy: { clerkId: ctx.auth.userId } },
    });

    if (!eventPackage) {
      throw new Error("Event package not found");
    }

    await stripe.products.update(eventPackage.stripeProductId, { active: false });

    if (eventPackage.boughtBy.length === 0) {
      return ctx.prisma.eventPackage.delete({ where: { id } });
    } else {
      return ctx.prisma.eventPackage.update({
        where: { id },
        data: {
          archived: true,
        },
      });
    }
  }),
});
