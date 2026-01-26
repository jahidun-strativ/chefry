import { createTRPCRouter } from "../../trpc";
import { contentFlagRouter } from "./content-flag";
import { userRouter } from "./user";

export const adminRouter = createTRPCRouter({
  user: userRouter,
  contentFlag: contentFlagRouter,
});
