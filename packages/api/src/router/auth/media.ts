import { Storage } from "@google-cloud/storage";
import { TRPCError } from "@trpc/server";
import mimetypes from "mime-types";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../../trpc";
import generateImageThumbhash from "../../utils/generate-image-thumbhash";
import { createMediaSchema } from "../../utils/schemas";

export const mediaRouter = createTRPCRouter({
  createSignedUploadUrl: protectedProcedure
    .input(
      z.object({
        uri: z.string(),
      }),
    )
    .mutation(async ({ input: { uri } }) => {
      const filename = String(Date.now()) + "_" + uri.replace(/^.*[\\\/]/, "");
      const contentType = mimetypes.lookup(filename) || "application/octet-stream";
      const storage = new Storage({
        projectId: "startracker-fb6ce",
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

      const [url] = await storage
        .bucket("startracker-fb6ce.appspot.com")
        .file(`media/${filename}`)
        .getSignedUrl({
          version: "v4",
          action: "write",
          expires: Date.now() + 15 * 60 * 1000, // 15 minutes
          contentType,
        });

      return { signedUploadUrl: url, filename, contentType };
    }),
  get: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input: { id } }) => {
    const media = await ctx.prisma.media.findFirst({ where: { id, owner: { clerkId: ctx.auth.userId } }, include: { thumbnail: true } });

    if (!media) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Media not found" });
    }

    return media;
  }),

  create: protectedProcedure
    .input(
      z.object({
        media: createMediaSchema,
        thumbnail: createMediaSchema.nullish(),
      }),
    )
    .mutation(async ({ ctx, input: { media, thumbnail } }) => {
      const urlEndpoint = "https://ik.imagekit.io/shader/";

      let thumbhash: string | null = null;

      if (media.fileType === "image") {
        thumbhash = await generateImageThumbhash(urlEndpoint + media.url);
      } else if (thumbnail?.url) {
        console.log("thumbnail", urlEndpoint + thumbnail.url);
        thumbhash = await generateImageThumbhash(urlEndpoint + thumbnail.url);
      }

      return ctx.prisma.media.create({
        include: {
          thumbnail: true,
        },
        data: {
          height: media.height,
          width: media.width,
          name: media.url,
          duration: media.duration,
          size: media.size,
          type: media.fileType === "image" ? "IMAGE" : "VIDEO",
          url: media.url,
          thumbhash,
          thumbnail: thumbnail
            ? {
                create: {
                  height: thumbnail.height,
                  width: thumbnail.width,
                  name: thumbnail.url,
                  size: thumbnail.size,
                  type: "IMAGE",
                  url: thumbnail.url,
                  thumbhash: thumbhash,
                },
              }
            : undefined,
          owner: {
            connect: {
              clerkId: ctx.auth.userId,
            },
          },
        },
      });
    }),
  update: protectedProcedure
    .input(z.object({ id: z.string(), crop: z.object({ x: z.number(), y: z.number(), width: z.number(), height: z.number() }) }))
    .mutation(async ({ ctx, input: { id, crop } }) => {
      const media = await ctx.prisma.media.findFirst({ where: { id, owner: { clerkId: ctx.auth.userId } } });

      if (!media) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Media not found" });
      }

      return ctx.prisma.media.update({
        where: { id },
        data: {
          cropX: crop.x,
          cropY: crop.y,
          cropWidth: crop.width,
          cropHeight: crop.height,
        },
      });
    }),
});
