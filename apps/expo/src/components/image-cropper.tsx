/* eslint-disable @typescript-eslint/no-unsafe-argument */

/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FC } from "react";
import { useEffect, useState } from "react";
import { View } from "react-native";
import WebView from "react-native-webview";
import * as Haptics from "expo-haptics";
import Icon from "@expo/vector-icons/Feather";
import { Portal } from "@gorhom/portal";
import clsx from "clsx";
import { AnimatePresence, MotiSafeAreaView, MotiView } from "moti";
import { z } from "zod";

import { api, getBaseUrl } from "../utils/api";
import createToast from "../utils/createToast";
import { Button } from "./ui/button";
import IconButton from "./ui/icon-button";
import Spinner from "./ui/spinner";

const EventDataSchema = z.object({
  type: z.enum(["CROP_CHANGE", "IMAGE_LOADED", "IMAGE_LOAD_ERROR", "LOG"]),
  payload: z.any(),
});

const ImageCropEventDataSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
});

interface Props {
  isOpen: boolean;
  mediaId?: string;
  aspect: number;
  onClose: () => void;
  onCropSuccess: () => Promise<void>;
}

const ImageCropper: FC<Props> = ({ isOpen, onClose, mediaId, aspect, onCropSuccess }) => {
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ x: number; y: number; width: number; height: number }>();
  const [webviewLoaded, setWebviewLoaded] = useState(false);

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => null);
    onClose();
  };

  const { mutate, isLoading } = api.auth.media.update.useMutation({
    onSuccess: async () => {
      await onCropSuccess();
      createToast({
        type: "success",
        message: "Image cropped",
      });
    },
    onError: (e) => {
      createToast({
        type: "error",
        message: e.message,
      });
    },
  });

  const handleCrop = () => {
    if (!croppedAreaPixels || !mediaId) {
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => null);
    mutate({
      id: mediaId,
      crop: {
        x: croppedAreaPixels.x,
        y: croppedAreaPixels.y,
        width: croppedAreaPixels.width,
        height: croppedAreaPixels.height,
      },
    });
  };

  useEffect(() => {
    if (!isOpen) {
      setWebviewLoaded(false);
      setCroppedAreaPixels(undefined);
    }
  }, [isOpen]);

  return (
    <Portal>
      <AnimatePresence>
        {isOpen && (
          <MotiSafeAreaView
            from={{ opacity: 0, translateY: 0 }}
            animate={{ opacity: 1, translateY: 0 }}
            exit={{ opacity: 0, translateY: 0 }}
            transition={{ type: "timing", duration: 200 }}
            className="absolute z-[1000] h-full w-full bg-black"
          >
            <IconButton
              icon={<Icon size={24} name="x" color="#fff" />}
              onPress={handleClose}
              cls="absolute top-20 left-6 z-30 opacity-50"
            />

            <AnimatePresence>
              {!webviewLoaded && (
                <MotiView
                  from={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute z-20 h-full w-full items-center justify-center bg-black"
                >
                  <Spinner size={32} />
                </MotiView>
              )}
            </AnimatePresence>

            <WebView
              source={{
                uri: `${getBaseUrl()}/image-cropper/${mediaId}?webview=true&aspect=${aspect}`,
              }}
              className={clsx("h-full w-full bg-black", !webviewLoaded && "opacity-0")}
              onMessage={(event) => {
                const eventDataParse = EventDataSchema.safeParse(JSON.parse(event.nativeEvent.data as any));

                if (!eventDataParse.success) {
                  console.error("Error parsing event data", eventDataParse.error);
                  return;
                }

                const eventData = eventDataParse.data;

                if (eventData?.type === "IMAGE_LOADED") {
                  setWebviewLoaded(true);
                } else if (eventData.type === "IMAGE_LOAD_ERROR") {
                  createToast({
                    type: "error",
                    message: "Could not load image",
                  });
                  onClose();
                } else if (eventData.type === "CROP_CHANGE") {
                  const payloadParse = ImageCropEventDataSchema.safeParse(eventData.payload);
                  if (!payloadParse.success) {
                    console.error("Error parsing crop data", payloadParse.error);
                    return;
                  }
                  setCroppedAreaPixels(payloadParse.data);
                }
              }}
            />
            <View className="absolute bottom-2 left-0 right-0 z-10 flex flex-row items-center justify-center self-center p-6">
              <Button onPress={handleCrop} isLoading={isLoading} size="default" variant="gradient">
                {isLoading ? "Updating media..." : "Save image crop"}
              </Button>
            </View>
          </MotiSafeAreaView>
        )}
      </AnimatePresence>
    </Portal>
  );
};

export default ImageCropper;
