import ImageKit from "imagekit-javascript";
import type { Transformation } from "imagekit-javascript/dist/src/interfaces/Transformation";

import type { RouterOutputs } from "./api";

const getBaseUrl = () => {
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }

  return process.env.WEB_URL || "https://startracker.vercel.app";
};

export const mediaBaseUrl = "https://ik.imagekit.io/shader/";

const imagekit = new ImageKit({
  urlEndpoint: mediaBaseUrl,
  publicKey: "public_PLXcEoODbQKWcZCa+vgnk+5qiO8=",
  authenticationEndpoint: getBaseUrl() + "/api/imagekit-auth",
});

export const getImageUrl = (imagePath: string, transformation?: Transformation[]) => {
  return imagekit.url({
    src: mediaBaseUrl + imagePath,
    transformation,
  });
};

export const constructMediaUrl = (media: Omit<RouterOutputs["auth"]["media"]["get"], "thumbnail">) => {
  let mediaUrl = mediaBaseUrl + media.url;

  if (media.cropHeight != null && media.cropWidth != null && media.cropX != null && media.cropY != null) {
    const cropCenterX = media.cropX + media.cropWidth / 2;
    const cropCenterY = media.cropY + media.cropHeight / 2;

    mediaUrl =
      mediaBaseUrl + `tr:w-${media.cropWidth},h-${media.cropHeight},cm-extract,xc-${cropCenterX},yc-${cropCenterY}:w-512/` + media.url;
  }

  return mediaUrl;
};
