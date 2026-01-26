import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import type * as ImagePicker from "expo-image-picker";
import * as VideoThumbnails from "expo-video-thumbnails";
import ImageKit from "imagekit-javascript";
import type { Transformation } from "imagekit-javascript/dist/src/interfaces/Transformation";

import type { RouterOutputs } from "./api";
import { getBaseUrl } from "./api";

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

interface MediaUpload {
  width: number;
  height: number;
  size: number;
  duration?: number;
  fileType: "image" | "video";
  url: string;
}

const uploadMediaToFirebase = async ({
  uri,
  signedUploadUrl,
  contentType,
  filename,
  width,
  height,
  type,
  onProgressChange,
}: {
  signedUploadUrl: string;
  uri: string;
  contentType: string;
  type: "image" | "video";
  width: number;
  height: number;
  filename: string;
  onProgressChange: (progress: number) => void;
}): Promise<MediaUpload> => {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", {
      uri: uri,
      type: contentType,
      name: filename,
    } as unknown as File);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const file = formData.getParts().find((item) => item.fieldName === "file") as File | undefined;

    const xhr = new XMLHttpRequest();
    xhr.open("PUT", signedUploadUrl, true);

    // Set headers
    xhr.setRequestHeader("Content-Type", contentType);

    xhr.upload.onprogress = function (e) {
      if (e.lengthComputable) {
        const percentComplete = (e.loaded / e.total) * 100;
        onProgressChange?.(Math.round(percentComplete * 10) / 10);
      }
    };

    xhr.onload = function () {
      if (xhr.status == 200) {
        console.log("Upload complete.");
        resolve({ fileType: type, width, height, size: 0, url: filename });
      } else {
        console.log("Error occurred during upload.");
        reject();
      }
    };

    xhr.send(file);
  });
};

export async function uploadMedia(
  media: ImagePicker.ImagePickerAsset,
  createSignedUploadUrl: (input: { uri: string }) => Promise<{ signedUploadUrl: string; contentType: string; filename: string }>,
  onProgressChange: (progress: number) => void,
): Promise<{ mediaUpload: MediaUpload; thumbnailUpload: MediaUpload | null }> {
  if (media.type === "image") {
    const { width, height, uri } = await manipulateAsync(media.uri, [{ resize: { width: Math.min(media.width, 1536) } }], {
      compress: 0.2,
      format: SaveFormat.JPEG,
    });

    const { signedUploadUrl, contentType, filename } = await createSignedUploadUrl({
      uri: media.uri,
    });

    const mediaUpload = await uploadMediaToFirebase({
      signedUploadUrl,
      contentType,
      uri,
      width,
      height,
      filename,
      type: "image",
      onProgressChange,
    });

    console.log(mediaUpload);
    return { mediaUpload, thumbnailUpload: null };
  } else {
    const {
      uri: thumbnailUri,
      width: thumbnailWidth,
      height: thumbnailHeight,
    } = await VideoThumbnails.getThumbnailAsync(media.uri, {
      time: 0,
    });

    const {
      signedUploadUrl: thumbnailSignedUploadUrl,
      contentType: thumbnailContentType,
      filename: thumbnailFilename,
    } = await createSignedUploadUrl({
      uri: thumbnailUri,
    });

    const thumbnailUpload = await uploadMediaToFirebase({
      signedUploadUrl: thumbnailSignedUploadUrl,
      contentType: thumbnailContentType,
      uri: thumbnailUri,
      width: thumbnailWidth,
      height: thumbnailHeight,
      filename: thumbnailFilename,
      type: "image",
      onProgressChange: (progress) => onProgressChange(progress * 0.2),
    });

    const { signedUploadUrl, contentType, filename } = await createSignedUploadUrl({
      uri: media.uri,
    });

    const mediaUpload = await uploadMediaToFirebase({
      signedUploadUrl,
      contentType,
      uri: media.uri,
      width: media.width,
      height: media.height,
      filename,
      type: "video",
      onProgressChange: (progress) => onProgressChange(20 + progress * 0.8),
    });

    return { mediaUpload: { ...mediaUpload, duration: media.duration || undefined }, thumbnailUpload };
  }
}
