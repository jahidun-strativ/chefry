import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import type { Stripe } from "@startracker/api";
import { stripe } from "@startracker/api";
import { prisma } from "@startracker/db";

async function handleEvent(event: Stripe.DiscriminatedEvent) {
  console.log("🆕 Stripe Webhook Received Event Type: ", event.type);
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;

      if (typeof session.subscription === "string") {
        const subscription = await stripe.subscriptions.retrieve(session.subscription);

        const { userId, subscriberUserId } = subscription.metadata;

        if (!userId) throw new Error("Missing user id");
        if (!subscriberUserId) throw new Error("Missing subscriber user id");

        const userFollow = await prisma.userFollow.findFirst({
          where: { followedUser: { id: userId }, followingUser: { id: subscriberUserId } },
        });

        if (!userFollow) {
          await prisma.userFollow.create({
            data: {
              followedUser: { connect: { id: userId } },
              followingUser: { connect: { id: subscriberUserId } },
              type: "STAR_TRACKER",
              subscriptionId: subscription.id,
              paidUntil: new Date(subscription.current_period_end * 1000),
            },
          });
        } else {
          await prisma.userFollow.update({
            where: { id: userFollow.id },
            data: { type: "STAR_TRACKER", subscriptionId: subscription.id, paidUntil: new Date(subscription.current_period_end * 1000) },
          });
        }
      } else if (session?.metadata?.type === "eventPackage") {
        const eventPackage = await prisma.eventPackage.findUnique({ where: { id: session.metadata.eventPackageId } });

        if (!eventPackage) {
          throw new Error("Event package not found");
        }

        await prisma.eventPackage.update({
          where: { id: eventPackage.id },
          data: {
            boughtBy: {
              connect: {
                id: session.metadata.userId,
              },
            },
          },
        });
      }

      break;
    }
    case "invoice.payment_succeeded": {
      const invoice = event.data.object;
      if (typeof invoice.subscription === "string") {
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription);

        console.log(invoice.total_excluding_tax);

        if (!subscription) {
          throw new Error(`Missing subscription ${invoice.subscription}`);
        }

        const { userId, subscriberUserId } = subscription.metadata;

        if (!userId) throw new Error("Missing user id");
        if (!subscriberUserId) throw new Error("Missing subscriber user id");

        const userFollow = await prisma.userFollow.findUnique({ where: { subscriptionId: subscription.id } });

        const subscribedToUser = await prisma.user.findUnique({ where: { id: userId } });

        if (subscribedToUser?.stripeConnectedAccountId) {
          const transfer = await stripe.transfers.create({
            amount: (invoice.total_excluding_tax || 0) * 0.7,
            currency: invoice.currency,
            destination: subscribedToUser.stripeConnectedAccountId,
          });
          console.log(transfer);
        } else {
          await prisma.error.create({
            data: {
              type: "STRIPE_TRANSFER",
              message: `Could not transfer ${invoice.total_excluding_tax} ${invoice.currency} to user ${userId} because they are not connected to stripe. Subscription: ${subscription.id} Invoice: ${invoice.id}`,
              user: { connect: { id: userId } },
            },
          });
        }

        if (userFollow) {
          await prisma.userFollow.update({
            where: { id: userFollow.id },
            data: { type: "STAR_TRACKER", paidUntil: new Date(subscription.current_period_end * 1000) },
          });
        }
      }

      break;
    }
    case "invoice.payment_failed": {
      // TODO: Handle failed payments
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      // const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;

      const userFollow = await prisma.userFollow.findUnique({ where: { subscriptionId: subscription.id } });

      if (!userFollow) {
        throw new Error("Missing user follow");
      }

      await prisma.userFollow.update({
        where: { id: userFollow.id },
        data: { type: "DEFAULT", subscriptionId: null, paidUntil: null },
      });

      break;
    }
    // case "customer.subscription.updated": {
    //   const subscription = event.data.object;
    //   // const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;

    //   // const subscriptionPlan = stripePriceToSubscriptionPlan(subscription.items.data[0]?.price.id);

    //   // await db
    //   //   .updateTable("Customer")
    //   //   .where("stripeId", "=", customerId)
    //   //   .set({
    //   //     plan: subscriptionPlan?.key,
    //   //     paidUntil: new Date(subscription.current_period_end * 1000),
    //   //   })
    //   //   .execute();
    //   break;
    // }
    default: {
      console.log("🆗 Stripe Webhook Unhandled Event Type: ", event.type);
      return;
    }
  }

  console.log("✅ Stripe Webhook Processed");
}

const secret = process.env.STRIPE_WEBHOOK_SIGNING_SECRET;

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const signature = req.headers.get("Stripe-Signature")!;

  try {
    const event = stripe.webhooks.constructEvent(payload, signature, secret || "") as Stripe.DiscriminatedEvent;

    await handleEvent(event);

    console.log("✅ Handled Stripe Event", event.type);
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.log(`❌ Error when handling Stripe Event: ${message}`);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
