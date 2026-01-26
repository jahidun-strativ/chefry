import { Expo } from "expo-server-sdk";
import { z } from "zod";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const schema = z.object({
    expoAccessToken: z.string(),
    to: z.string(),
    body: z.string().nullish(),
    title: z.string().nullish(),
    badge: z.number().nullish(),
    data: z.record(z.any()).nullish(),
  });

  try {
    const { to, expoAccessToken, badge, body, data, title } = await schema.parseAsync(await request.json());

    if (expoAccessToken !== process.env.EXPO_TOKEN) {
      return new Response("Invalid token", { status: 403 });
    }

    const expo = new Expo({ accessToken: process.env.EXPO_TOKEN });

    if (to && Expo.isExpoPushToken(to)) {
      await expo.sendPushNotificationsAsync([
        {
          to,
          sound: "default",
          title: title || "Star Tracker",
          body: body || undefined,
          badge: badge != null ? badge : 1,
          data: data as object,
        },
      ]);
    }

    return new Response("OK", { status: 200 });
  } catch (e) {
    console.log("Invalid request body", e);
    return new Response("Invalid request body", { status: 400 });
  }
}
