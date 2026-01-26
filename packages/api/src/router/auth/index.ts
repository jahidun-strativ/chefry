import { createTRPCRouter } from "../../trpc";
import { contentFlagRouter } from "./content-flag";
import { eventPackageRouter } from "./event-package";
import { mediaRouter } from "./media";
import { postRouter } from "./post";
import { storyRouter } from "./story";
import { stripeRouter } from "./stripe";
import { userRouter } from "./user";
import { userFollowRouter } from "./user-follow";

export const authRouter = createTRPCRouter({
  contentFlag: contentFlagRouter,
  eventPackage: eventPackageRouter,
  media: mediaRouter,
  user: userRouter,
  post: postRouter,
  story: storyRouter,
  stripe: stripeRouter,
  userFollow: userFollowRouter,
});
