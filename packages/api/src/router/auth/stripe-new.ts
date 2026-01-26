import { TRPCError } from "@trpc/server";
import type { Stripe } from "stripe";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { stripe } from "../../utils/stripe";

export const stripeRouter = createTRPCRouter({
  connectedAccount: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: {
        clerkId: ctx.auth.userId,
      },
    });

    if (!user?.stripeConnectedAccountId) {
      return null;
    }

    return stripe.accounts.retrieve(user.stripeConnectedAccountId);
  }),
  updateConnectedAccount: protectedProcedure.mutation(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.findUnique({
      where: {
        clerkId: ctx.auth.userId,
      },
    });

    if (!user?.stripeConnectedAccountId) {
      throw new TRPCError({ code: "NOT_FOUND", message: "No connected account found" });
    }

    // const account = await stripe.accounts.createLoginLink(user.stripeConnectedAccountId);
    // const accountLink = await stripe.accountLinks.create({
    //   account: user?.stripeConnectedAccountId,
    //   refresh_url: `http://localhost:3000/settings/payment`,
    //   return_url: `http://localhost:3000/settings/payment`,
    //   type: "account_update",
    // });

    // return accountLink;
    const loginLink = await stripe.accounts.createLoginLink(user.stripeConnectedAccountId);
    return loginLink;
  }),
  cancelSubscriptionById: protectedProcedure
    .input(z.object({ subscriptionId: z.string(), deleteSubscription: z.boolean().nullish() }))
    .mutation(async ({ ctx, input: { subscriptionId, deleteSubscription } }) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          clerkId: ctx.auth.userId,
        },
      });

      if (!user?.stripeCustomerId) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      if (!subscription) throw new TRPCError({ code: "NOT_FOUND", message: "Subscription not found" });
      if (subscription.customer !== user.stripeCustomerId) throw new TRPCError({ code: "NOT_FOUND", message: "Subscription not found" });

      if (deleteSubscription) {
        await stripe.subscriptions.cancel(subscriptionId);
      } else {
        await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true });
      }

      return true;
    }),
  createConnectedAccount: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: {
        clerkId: ctx.auth.userId,
      },
    });

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }

    let account: Stripe.Account | null = null;
    let product: Stripe.Product | null = null;

    if (user.stripeConnectedAccountId) {
      account = await stripe.accounts.retrieve(user.stripeConnectedAccountId);
    }

    if (!account) {
      account = await stripe.accounts.create({
        type: "express",
        business_type: "individual",
        individual: {
          email: user?.email || undefined,
        },
        settings: {
          payouts: {
            schedule: {
              // delay_days: 7,
              interval: "monthly",
              monthly_anchor: 1,
            },
          },
        },
        business_profile: {
          // url: "https://startracker.app/user/" + user?.id,
          mcc: "5968",
          product_description: "A subscription for images and videos in the Star Tracker app",
        },
        email: user?.email || undefined,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: {
          userId: user.id,
        },
      });
    }

    if (user.stripeProductId) {
      product = await stripe.products.retrieve(user.stripeProductId);
    }

    if (!product) {
      product = await stripe.products.create({
        name: "Star Tracker subscription for " + user.username,
        active: true,
        type: "service",
        metadata: {
          userId: user.id,
        },
      });
    }

    await ctx.prisma.user.update({
      where: {
        clerkId: ctx.auth.userId,
      },
      data: {
        stripeConnectedAccountId: account.id,
        stripeProductId: product.id,
      },
    });

    return stripe.accountLinks.create({
      account: account.id,
      return_url: process.env.WEB_URL + "/checkout/account-setup-complete",
      refresh_url: process.env.WEB_URL + "/checkout/error",
      type: "account_onboarding",
    });
  }),
  createCustomer: protectedProcedure.mutation(async ({ ctx, input }) => {
    let user = await ctx.prisma.user.findUnique({
      where: {
        clerkId: ctx.auth.userId,
      },
    });

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }

    if (user?.stripeCustomerId) {
      const session = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
      });

      return session;
    }

    const customer = await stripe.customers.create({
      email: user.email || undefined,
      // name: user.username,
      metadata: {
        userId: user.id,
      },
      tax: {},
      expand: ["tax"],
    });

    user = await ctx.prisma.user.update({
      data: {
        stripeCustomerId: customer.id,
      },
      where: {
        id: user.id,
      },
    });

    if (!user?.stripeCustomerId) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User does not have a customer account" });
    }

    const portalConfiguration = await stripe.billingPortal.configurations.create({
      features: {
        payment_method_update: {
          enabled: true,
        },
      },
      business_profile: {
        privacy_policy_url: "https://startracker.app/terms",
        terms_of_service_url: "https://startracker.app/terms",
      },
    });

    return stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      configuration: portalConfiguration.id,
    });
  }),
  updateCustomer: protectedProcedure.input(z.object({ onlyPaymentMethod: z.boolean() }).nullish()).mutation(async ({ ctx, input }) => {
    let user = await ctx.prisma.user.findUnique({
      where: {
        clerkId: ctx.auth.userId,
      },
    });

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }

    if (!user?.stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        // name: user.username,
        metadata: {
          userId: user.id,
        },
      });

      user = await ctx.prisma.user.update({
        data: {
          stripeCustomerId: customer.id,
        },
        where: {
          id: user.id,
        },
      });
    }

    if (!user?.stripeCustomerId) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User does not have a customer account" });
    }

    if (input?.onlyPaymentMethod) {
      const portalConfiguration = await stripe.billingPortal.configurations.create({
        features: {
          payment_method_update: {
            enabled: true,
          },
        },
        business_profile: {
          privacy_policy_url: process.env.WEB_URL + "/terms",
          terms_of_service_url: process.env.WEB_URL + "/terms",
        },
      });

      return stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        configuration: portalConfiguration.id,
      });
    } else {
      return stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
      });
    }
  }),
  getCustomer: protectedProcedure.query(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.findUnique({
      where: {
        clerkId: ctx.auth.userId,
      },
    });

    if (!user?.stripeCustomerId) {
      return null;
    }

    const customer = await stripe.customers.retrieve(user.stripeCustomerId);

    if (customer.deleted) {
      return null;
    }

    return customer;
  }),

  setSubscriptionPrice: protectedProcedure
    .input(z.object({ monthlyPrice: z.number() }))
    .mutation(async ({ ctx, input: { monthlyPrice } }) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          clerkId: ctx.auth.userId,
        },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      if (!user.stripeConnectedAccountId || !user.stripeProductId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "User does not have a connected account" });
      }

      const account = await stripe.accounts.retrieve(user.stripeConnectedAccountId);
      const product = await stripe.products.retrieve(user.stripeProductId);

      if (!account || !product) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Account or product not found" });
      }

      const price = await stripe.prices.create({
        currency: "eur",
        active: true,
        unit_amount: monthlyPrice * 100,
        product: product.id,
        tax_behavior: "exclusive",
        recurring: {
          interval: "month",
        },
        metadata: {
          userId: user.id,
        },
      });

      await ctx.prisma.user.update({
        where: {
          clerkId: ctx.auth.userId,
        },
        data: {
          stripePriceId: price.id,
        },
      });

      return price;
    }),
  mySubscriptionPrice: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: {
        clerkId: ctx.auth.userId,
      },
    });

    if (!user?.stripePriceId) {
      return null;
    }

    const price = await stripe.prices.retrieve(user.stripePriceId);

    return price;
  }),
  subscriptionPrice: protectedProcedure.input(z.object({ username: z.string() })).query(async ({ ctx, input: { username } }) => {
    const user = await ctx.prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (!user?.stripePriceId) {
      return null;
    }

    const price = await stripe.prices.retrieve(user.stripePriceId);

    if (!price || !price.unit_amount) {
      return null;
    }

    return price.unit_amount / 100;
  }),
  setupDefaultPaymentMethod: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: {
        clerkId: ctx.auth.userId,
      },
    });

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }

    if (!user.stripeCustomerId) {
      throw new TRPCError({ code: "FORBIDDEN", message: "You do not have a customer account" });
    }

    const customer = await stripe.customers.retrieve(user.stripeCustomerId);

    if (!customer) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Account or price not found" });
    }

    const ephemeralKey = await stripe.ephemeralKeys.create({ customer: customer.id }, { apiVersion: "2023-08-16" });

    const setupIntent = await stripe.setupIntents.create({
      customer: customer.id,
      automatic_payment_methods: {
        enabled: true,
      },
      // automatic_payment_methods: {
      //   enabled: true,
      // },
    });

    return {
      setupPaymentMethod: true,
      setupIntent: setupIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customerId: customer.id,
    };
  }),
  createSubscriptionPaymentIntent: protectedProcedure
    .input(z.object({ username: z.string() }))
    .mutation(async ({ ctx, input: { username } }) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          clerkId: ctx.auth.userId,
        },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      if (!user.stripeCustomerId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You do not have a customer account" });
      }

      const subscriptionUser = await ctx.prisma.user.findUnique({
        where: {
          username,
        },
      });

      if (!subscriptionUser?.stripePriceId || !subscriptionUser?.stripeConnectedAccountId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Subscription user not found" });
      }

      await stripe.customers.update(user.stripeCustomerId, {
        // address: {
        //   postal_code: "",
        //   country: "",
        // },
        tax: {
          ip_address: ctx.ip !== "unknown" ? ctx.ip : undefined,
        },
        expand: ["tax"],
      });

      const account = await stripe.accounts.retrieve(subscriptionUser.stripeConnectedAccountId);
      const price = await stripe.prices.retrieve(subscriptionUser.stripePriceId);
      const customer = await stripe.customers.retrieve(user.stripeCustomerId);

      if (!account || !price || !customer) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Account or price not found" });
      }

      const subscription = await stripe.subscriptions.create({
        customer: user.stripeCustomerId,
        items: [
          {
            price: price.id,
            quantity: 1,
          },
        ],
        metadata: {
          subscriberUserId: user.id,
          userId: subscriptionUser.id,
        },
        automatic_tax: {
          enabled: true,
        },
        // application_fee_percent: 30,
        transfer_data: {
          destination: subscriptionUser.stripeConnectedAccountId,
          amount_percent: 0.8 * 70,
        },
        payment_behavior: "default_incomplete",
        expand: ["latest_invoice.payment_intent"],
      });

      const latestInvoice = subscription.latest_invoice;
      if (typeof latestInvoice === "string") {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
      }

      const paymentIntent = latestInvoice?.payment_intent;
      if (typeof paymentIntent === "string" || !paymentIntent?.client_secret) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Payment intent not found" });
      }

      return {
        setupPaymentMethod: false,
        customerId: user.stripeCustomerId,
        clientSecret: paymentIntent.client_secret,
      };
    }),
  startSubscription: protectedProcedure.input(z.object({ username: z.string() })).mutation(async ({ ctx, input: { username } }) => {
    const user = await ctx.prisma.user.findUnique({
      where: {
        clerkId: ctx.auth.userId,
      },
    });

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }

    if (!user.stripeCustomerId) {
      throw new TRPCError({ code: "FORBIDDEN", message: "You do not have a customer account" });
    }

    const subscriptionUser = await ctx.prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (!subscriptionUser?.stripePriceId || !subscriptionUser?.stripeConnectedAccountId) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Subscription user not found" });
    }

    await stripe.customers.update(user.stripeCustomerId, {
      tax: {
        ip_address: ctx.ip !== "unknown" ? ctx.ip : undefined,
      },
      expand: ["tax"],
    });

    const account = await stripe.accounts.retrieve(subscriptionUser.stripeConnectedAccountId);
    const price = await stripe.prices.retrieve(subscriptionUser.stripePriceId);
    const customer = await stripe.customers.retrieve(user.stripeCustomerId, { expand: ["tax_ids"] });

    // Get the customers VAT percentage
    console.log(customer);

    if (!account || !price || !customer) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Account or price not found" });
    }

    return stripe.checkout.sessions.create({
      mode: "subscription",
      customer: user.stripeCustomerId,
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      // destination: subscriptionUser.stripeConnectedAccountId,
      metadata: {
        type: "subscription",
        subscriberUserId: user.id,
        userId: subscriptionUser.id,
      },
      automatic_tax: {
        enabled: true,
      },
      customer_update: {
        address: "auto",
      },
      subscription_data: {
        // transfer_data: {
        //   destination: subscriptionUser.stripeConnectedAccountId,
        //   // If the subscription cost is 10 EUR 7 EUR will go to the Star account (subscriptionUser.stripeConnectedAccountId).
        //   // But if 25% VAT is added to the total amount will be 12.5 and 8.75 EUR will go to the Star account - this is incorrect.
        //   // So to avoid this I multiply buy 0.8 to get the correct amount.
        //   amount_percent: 0.8 * 70,
        // },
        metadata: {
          subscriberUserId: user.id,
          userId: subscriptionUser.id,
        },
      },
      success_url: process.env.WEB_URL + `/checkout/subscription-created?userId=${subscriptionUser.id}`,
      cancel_url: process.env.WEB_URL + "/checkout/error",
    });
  }),
  cancelSubscription: protectedProcedure.input(z.object({ username: z.string() })).mutation(async ({ ctx, input: { username } }) => {
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

    if (!userFollow?.subscriptionId) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Subscription not found" });
    }

    const subscription = await stripe.subscriptions.retrieve(userFollow.subscriptionId);

    if (!subscription) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Subscription not found" });
    }

    return stripe.subscriptions.update(userFollow.subscriptionId, { cancel_at_period_end: true }); //.(userFollow.subscriptionId);
  }),
  deleteSubscription: protectedProcedure
    .input(z.object({ username: z.string(), deleteFollow: z.boolean() }))
    .mutation(async ({ ctx, input: { username, deleteFollow } }) => {
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

      if (!userFollow?.subscriptionId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Subscription not found" });
      }

      const subscription = await stripe.subscriptions.retrieve(userFollow.subscriptionId);

      if (!subscription) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Subscription not found" });
      }

      if (deleteFollow) {
        await ctx.prisma.userFollow.delete({
          where: {
            id: userFollow.id,
          },
        });
      }

      return stripe.subscriptions.cancel(userFollow.subscriptionId); //.(userFollow.subscriptionId);
    }),
  resumeSubscription: protectedProcedure.input(z.object({ username: z.string() })).mutation(async ({ ctx, input: { username } }) => {
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

    if (!userFollow?.subscriptionId) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Subscription not found" });
    }

    const subscription = await stripe.subscriptions.retrieve(userFollow.subscriptionId);

    if (!subscription) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Subscription not found" });
    }

    return stripe.subscriptions.update(userFollow.subscriptionId, { cancel_at_period_end: false, automatic_tax: { enabled: true } }); //.(userFollow.subscriptionId);
  }),
  subscription: protectedProcedure.input(z.object({ username: z.string() })).query(async ({ input: { username }, ctx }) => {
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

    if (!userFollow?.subscriptionId) {
      return null;
    }

    return stripe.subscriptions.retrieve(userFollow.subscriptionId);
  }),
  canSubscribe: protectedProcedure.input(z.object({ username: z.string() })).query(async ({ ctx, input: { username } }) => {
    const user = await ctx.prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (!user || user.clerkId === ctx.auth.userId) {
      return false;
    }

    if (!user.stripePriceId || !user.stripeConnectedAccountId) {
      return false;
    }

    const [price, account] = await Promise.all([
      stripe.prices.retrieve(user.stripePriceId),
      stripe.accounts.retrieve(user.stripeConnectedAccountId),
    ]);

    if (!price || !account) {
      return false;
    }

    return true;
  }),
  setupCustomer: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: {
        clerkId: ctx.auth.userId,
      },
    });

    if (!user?.stripeCustomerId) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }

    const customer = await stripe.customers.retrieve(user.stripeCustomerId);

    if (!customer) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Customer not found" });
    }

    return stripe.checkout.sessions.create({
      mode: "setup",
      customer: user.stripeCustomerId,
      payment_method_types: ["card", "paypal"],
      success_url: process.env.WEB_URL + "/setup-success",
      cancel_url: process.env.WEB_URL + "/error",
    });
  }),
});
