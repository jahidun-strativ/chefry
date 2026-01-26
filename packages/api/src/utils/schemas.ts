import { z } from "zod";

export const createMediaSchema = z.object({
  fileType: z.enum(["image", "video"]),
  duration: z.number().nullish(),
  size: z.number(),
  width: z.number().nullish(),
  height: z.number().nullish(),
  url: z.string(),
});
