import { Storage } from "@google-cloud/storage";
import { Stripe } from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2023-08-16" });

// const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 8);

async function generateSignedUrl() {
  const storage = new Storage({
    credentials: {
      type: "service_account",
      project_id: "startracker-fb6ce",
      private_key_id: "8d0a4e47ed339cb10baf3e41d2535e63c1a821a6",
      private_key:
        "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCaIAdFMNDmRTk/\nXtwueiKJQgkVVovngztvi0+HchAxkJaJojPF4wI+Buizrv0qBNEl42m0zx1JMKcu\nIbm15N8pjUtGChO/IRKaQJRiLeIsvkZM4rt97t/fHrHDPYILdeM+OzOPJEETA6LZ\n+qeUrrzzVXxpUkTzDu8ugxAT69u6aWXnlmVbr1algm2az2+hA3GYqiZBd9iL2uBn\ns22Uxg8ysI5wZZwhq9Uu7WvIurUiAMcETCgQ/UULZrcLJEdDpEC6rLiWQCeVHv9B\nMeUriKMzD8/fItSGQzYWWJG2E6eXXFs30zCXvLq8tB3T/mmdnJTYpk9L6AgOcfyi\nBJ6yUM9bAgMBAAECggEAENTQlnDHT25d2xrL5tN1tBGfFlJ2QtklA4BuNfdx50fH\n+M3a45Bv7UAp532DrjQKdx3HrHQ12YlTqIkMU93jtRD2GHb/Qw8kje3hhntGSOaa\nnMjh+tW8YwxiE1VDP2cnYuNqNQabiK0L+swRwv32Koi6ZnISj4yg+C5d8h7+xvOS\nL+ifpNSZXqQac2VKgUww3d+1ei0Ip/NL+1k9JmK6P0QaO5HUecqymyr6wTzeR+oV\nEWQGDMEbsTuEc33wjbRxZ/JFO3JmTBCWahGc2Q5BDKPYdz5LsgNCXFGEJR10BKnZ\nQZwzNC2yuHv/dFE7Qbdc36pEaLWdBZDBHhNIcIr8UQKBgQDUHjLZDHuKt5Tc2Y6y\nh4Yz3FTOobG6XKhHGX5ul4JtvtojsqB0k5OJm51p0CNsnV3NWs26WLuHag7R0srR\npDQ/TrYBq6zHmRELHN6WyLtnOokstNX8PzvPJ1qpqZinWVTKQTEV3LjUhyOkHLV6\n6TezLX0fcUHC5UEuPTGyYmH0wwKBgQC6AoTdfTqDmHVgsvRW2abxL/RcByDn9XfH\nY42mZwm7x2HBfkcRCLSXoCH5vIMgbbs6NWJDMrmNL8TJv8HwidVDndZol4hnKFdD\nay7lak9AX8uYt6sic6J736a4atqbcMpwikWl0sT8IRQk3DW9WFZ7MFw6Fb1Hg+jH\nSCiSZQ6xiQKBgGK8c9rIjrExZx+uPVgo8XUueGN+rKYc/0+pNEryR4oiLpQzT7E0\nCJcjUpCwi+zBC6rNO7okF5ae7asJvdL75j4Zu2rnqJN4UpCjrZDuex1ACB5BRuIV\n5Rc2MGONSDuNv4Qt+FU+2uJCzXpUyr0d1gmXgQijxYKdCEwnu/xXA1XVAoGAQu5x\nHLnY+k07v0XlgfLjjVnyFcNC5fR/2zFJYR0mdXkzBcsIi2qUgRLP5uscS+jwO+vF\npeR0vAb6SpZDlOgj4ybCZfRQ0r3DWLESuN5eEg3mVteQLt9pEiXR+f4JF3GohoJa\nuWZ0Fz1X4EOU2sMUq1MlfIkiCL/AXSTr5HGUrfECgYBZCzffToGm8UsWpRZSq5Vg\n5lvhZ3CU51fVmlpQP8pExmtw0gDQnGxWjh+Tw4XAUVzaUfjdE1JuNbFrwRRxgRww\nshlA5PqPa2kYoz0PL6cmfKZKrZRQVU0luNWhnjwrAHhRTnLpzOZIDlGZ+ucjv61u\nALScrnjqqnvRGBPKxXq/gQ==\n-----END PRIVATE KEY-----\n",
      client_email: "startracker-service-account@startracker-fb6ce.iam.gserviceaccount.com",
      client_id: "107704056856680441843",
      universe_domain: "googleapis.com",
    },
  });

  try {
    const [url] = await storage
      .bucket("startracker-fb6ce.appspot.com")
      .file("test/video.mp4")
      .getSignedUrl({
        version: "v4",
        action: "write",
        expires: Date.now() + 15 * 60 * 1000, // 15 minutes
        contentType: "application/octet-stream",
      });

    console.log(url);
  } catch (error) {
    console.error("Error generating signed URL", error);
  }
}

export function GET() {
  return new Response(JSON.stringify({ success: true }));
}
