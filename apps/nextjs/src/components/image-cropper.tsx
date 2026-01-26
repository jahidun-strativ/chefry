"use client";

import type { FC } from "react";
import { useCallback, useEffect, useState } from "react";
import type { Area, Point } from "react-easy-crop";
import Cropper from "react-easy-crop";

import type { Media } from "@startracker/db";

const getWebView = () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
  return (window as any).ReactNativeWebView as {
    postMessage: (message: string) => void;
  };
};

interface Props {
  media: Media;
  aspect: number;
}

const ImageCropper: FC<Props> = ({ media, aspect }) => {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | undefined>(() => {
    const { cropX, cropY, cropWidth, cropHeight } = media || {};
    if (cropX != null && cropY != null && cropWidth != null && cropHeight != null) {
      return { x: cropX, y: cropY, width: cropWidth, height: cropHeight };
    }
  });

  const handleCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels({
      x: croppedAreaPixels.x,
      y: croppedAreaPixels.y,
      width: croppedAreaPixels.width,
      height: croppedAreaPixels.height,
    });
    getWebView()?.postMessage(JSON.stringify({ type: "CROP_CHANGE", payload: croppedAreaPixels }));
  }, []);

  const handleMediaLoaded = useCallback(() => {
    getWebView()?.postMessage(JSON.stringify({ type: "IMAGE_LOADED" }));
  }, []);

  useEffect(() => {
    if (!media) {
      getWebView()?.postMessage(JSON.stringify({ type: "IMAGE_LOAD_ERROR" }));
    }
  }, [media]);

  return (
    <>
      <Cropper
        classes={{ containerClassName: "w-full h-full !bg-black" }}
        aspect={aspect}
        crop={crop}
        zoom={zoom}
        onCropChange={setCrop}
        onZoomChange={setZoom}
        initialCroppedAreaPixels={croppedAreaPixels}
        image={media.type === "IMAGE" ? "https://ik.imagekit.io/shader/" + media.url : undefined}
        video={media.type === "VIDEO" ? "https://ik.imagekit.io/shader/" + media.url : undefined}
        onCropComplete={handleCropComplete}
        showGrid={false}
        restrictPosition
        onMediaLoaded={() => {
          handleMediaLoaded();
          const { cropX, cropY, cropWidth, cropHeight } = media;

          if (cropX == null || cropY == null || cropWidth == null || cropHeight == null) {
            // setZoom(mediaSize.naturalHeight / window.innerHeight)
          }
        }}
      />
    </>
  );
};

export default ImageCropper;
