import { auth } from "@clerk/nextjs";
import type { SignedInAuthObject, SignedOutAuthObject } from "@clerk/nextjs/api";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { prisma } from "@startracker/db";

interface CreateContextOptions {
  auth: SignedInAuthObject | SignedOutAuthObject;
  ip: string;
}

const createInnerTRPCContext = ({ auth, ip }: CreateContextOptions) => {
  return {
    auth,
    prisma,
    ip,
  };
};

export const createTRPCContext = (ip: string) => {
  return createInnerTRPCContext({
    auth: auth(),
    ip,
  });
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;

export const publicProcedure = t.procedure;

const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.auth?.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      auth: ctx.auth,
      userId: ctx.auth.userId,
    },
  });
});

const enforceUserIsAdmin = t.middleware(async ({ ctx, next }) => {
  if (!ctx.auth?.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const user = await prisma.user.findUnique({
    where: {
      clerkId: ctx.auth.userId,
    },
  });

  if (user?.privilegeLevel !== "ADMIN") {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      auth: ctx.auth,
      userId: ctx.auth.userId,
    },
  });
});

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);

export const adminProcedure = t.procedure.use(enforceUserIsAdmin);
