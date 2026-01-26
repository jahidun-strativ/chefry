import { adminRouter } from "./router/admin";
import { authRouter } from "./router/auth";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  admin: adminRouter,
  // user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
