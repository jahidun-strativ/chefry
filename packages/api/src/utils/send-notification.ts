import fetch from "node-fetch";

export async function sendNotification({
  expoPushToken,
  body,
  title,
  badge,
  data,
}: {
  expoPushToken: string | null;
  title?: string;
  body?: string;
  badge?: number;
  data?: object;
}) {
  await fetch((process.env.WEB_URL ?? "http://localhost:3000") + "/api/send-push-notification", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      expoAccessToken: process.env.EXPO_TOKEN,
      to: expoPushToken,
      sound: "default",
      title: title || "Star Tracker",
      body: body || undefined,
      badge: badge != null ? badge : 1,
      data: data,
    }),
  });
}
