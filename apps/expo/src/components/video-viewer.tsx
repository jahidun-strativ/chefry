import type { FC } from "react";
import { useEffect, useRef, useState } from "react";
import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ResizeMode, Video } from "expo-av";
import * as ScreenOrientation from "expo-screen-orientation";
import { Portal } from "@gorhom/portal";
import { AnimatePresence, MotiView } from "moti";

import { mediaBaseUrl } from "@/utils/imagekit";
import IconButton from "@/components/ui/icon-button";
import Spinner from "./ui/spinner";

export const VideoViewer: FC<{ mediaUrl?: string; onClose: () => void }> = ({ mediaUrl, onClose }) => {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { top } = useSafeAreaInsets();
  const videoRef = useRef<Video>(null);

  useEffect(() => {
    if (Platform.OS === "android") {
      if (mediaUrl) {
        setIsFullscreen(true);
        void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.ALL);
      } else {
        setIsFullscreen(false);
        void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      }
    }
  }, [mediaUrl]);

  return (
    <Portal>
      <AnimatePresence>
        {mediaUrl && (
          <MotiView
            className="absolute inset-0 flex h-full w-full items-center justify-center bg-black"
            style={{ paddingTop: 0, zIndex: 100000 }}
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <View className="absolute right-2 z-[1000]" style={{ top: top }}>
              <IconButton iconName="x" cls="bg-black/50" size="lg" onPress={onClose} />
            </View>

            <Video
              source={{ uri: mediaBaseUrl + "tr:w-1024/" + mediaUrl }}
              shouldPlay
              isLooping
              ref={videoRef}
              isMuted={false}
              onLoad={() => {
                setHasLoaded(true);
              }}
              className="h-full w-full"
              useNativeControls={true}
              resizeMode={isFullscreen ? ResizeMode.CONTAIN : ResizeMode.CONTAIN}
              // onFullscreenUpdate={(e) => {
              //   if (e.fullscreenUpdate === VideoFullscreenUpdate.PLAYER_WILL_DISMISS) {
              //     setIsFullscreen(false);
              //     void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
              //     if (Platform.OS === "android") void NavigationBar.setVisibilityAsync("visible");
              //   } else if (e.fullscreenUpdate === VideoFullscreenUpdate.PLAYER_DID_PRESENT) {
              //     setIsFullscreen(true);
              //     void ScreenOrientation.unlockAsync();
              //   }
              // }}
            />
            {!hasLoaded && (
              <View className="absolute inset-0 flex h-full w-full items-center justify-center">
                <Spinner size={24} />
              </View>
            )}
          </MotiView>
        )}
      </AnimatePresence>
    </Portal>
  );
};
