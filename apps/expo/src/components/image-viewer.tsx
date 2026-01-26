import type { FC } from "react";
import { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ScreenOrientation from "expo-screen-orientation";
import { Portal } from "@gorhom/portal";
import { ImageZoom } from "@likashefqet/react-native-image-zoom";
import { AnimatePresence, MotiView } from "moti";

import { getImageUrl } from "@/utils/imagekit";
import IconButton from "@/components/ui/icon-button";

export const ImageViewer: FC<{ mediaUrl?: string; onClose: () => void }> = ({ mediaUrl, onClose }) => {
  const { top } = useSafeAreaInsets();

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  useEffect(() => {
    if (mediaUrl) {
      setImageUrl(getImageUrl(mediaUrl, [{ width: "1024" }]));
    } else {
      setImageUrl(null);
    }
  }, [mediaUrl]);

  useEffect(() => {
    if (imageUrl) {
      void ScreenOrientation.unlockAsync();
    } else {
      void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    }
  }, [imageUrl]);

  return (
    <Portal>
      <AnimatePresence>
        {imageUrl && (
          <MotiView
            className="absolute inset-0 h-full w-full bg-black"
            style={{ paddingTop: top, zIndex: 100000 }}
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <IconButton iconName="x" cls="absolute top-14 right-2 z-20 bg-black/50" size="lg" onPress={onClose} />
            <ImageZoom uri={imageUrl} minScale={0.5} maxScale={5} resizeMode="contain" />
          </MotiView>
        )}
      </AnimatePresence>
    </Portal>
  );
};
