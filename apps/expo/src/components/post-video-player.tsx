import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Platform, View } from "react-native";
import { ResizeMode, Video, VideoFullscreenUpdate } from "expo-av";
import * as NavigationBar from "expo-navigation-bar";
import * as ScreenOrientation from "expo-screen-orientation";
// AnimatePresence/MotiView removed — thumbnail conditionally rendered instead

import type { RouterOutputs } from "@startracker/api";

import { getImageUrl, mediaBaseUrl } from "@/utils/imagekit";
import { Image } from "@/components/image";
import Spinner from "./ui/spinner";

interface Props {
  isVisible: boolean;
  aspectRatio: number;
  media: RouterOutputs["auth"]["post"]["list"]["items"][number]["media"][number];
}

export interface PostVideoPlayerHandle {
  onTogglePlay: () => void;
  onOpenInFullscreen: () => void;
}

const PostVideoPlayer = forwardRef<PostVideoPlayerHandle, Props>(({ media, isVisible, aspectRatio }, ref) => {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<Video>(null);

  // Auto-play/pause based on visibility
  useEffect(() => {
    if (!videoRef.current) return;

    if (isVisible) {
      void videoRef.current.playAsync().catch(() => {
        // Will retry once loaded via onLoad
      });
    } else {
      void videoRef.current.pauseAsync();
    }
  }, [isVisible]);

  useImperativeHandle(ref, () => ({
    onTogglePlay: () => {
      if (videoRef.current) {
        void videoRef.current.getStatusAsync().then((status) => {
          if (status.isLoaded) {
            if (status.isPlaying) {
              void videoRef.current?.pauseAsync();
            } else {
              void videoRef.current?.playAsync();
            }
          }
        });
      }
    },
    onOpenInFullscreen: async () => {
      await videoRef.current?.presentFullscreenPlayer();
    },
  }));

  return (
    <>
      {isFullscreen && <View className="fixed inset-0 h-full w-full bg-black" />}
      <View
        className="w-full overflow-hidden rounded-[30px]"
        style={{
          aspectRatio: Math.max(aspectRatio, 0.7),
          backgroundColor: "#111",
        }}
      >
        {/* Thumbnail — always behind as fallback, hidden after video loads */}
        <Image
          source={{
            uri: media.thumbnail?.url ? getImageUrl(media.thumbnail?.url, [{ width: "1024" }]) : undefined,
          }}
          placeholder={Platform.OS === "ios" ? media.thumbhash : undefined}
          placeholderContentFit="contain"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1,
            opacity: hasLoaded ? 0 : 1,
          }}
          contentFit="contain"
          recyclingKey={media.id}
        />

        {/* Spinner while loading */}
        {!hasLoaded && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 2,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Spinner size={32} />
          </View>
        )}

        {/* Video — uses inline styles to ensure proper sizing on web */}
        <Video
          source={{ uri: mediaBaseUrl + "tr:w-1024/" + media.url }}
          shouldPlay={isVisible}
          isLooping
          ref={videoRef}
          isMuted={isMuted}
          onLoad={(status) => {
            setHasLoaded(true);
            if (isVisible && status.isLoaded) {
              void videoRef.current?.playAsync().catch((error) => {
                console.warn("Video play on load error:", error);
              });
            }
          }}
          onReadyForDisplay={() => {
            setHasLoaded(true);
          }}
          onPlaybackStatusUpdate={(status) => {
            if (status.isLoaded && status.isPlaying && !hasLoaded) {
              setHasLoaded(true);
            }
          }}
          onError={(error) => {
            console.warn("Video load error:", error);
          }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 10,
          }}
          resizeMode={ResizeMode.CONTAIN}
          onFullscreenUpdate={(e) => {
            if (e.fullscreenUpdate === VideoFullscreenUpdate.PLAYER_WILL_DISMISS) {
              setIsFullscreen(false);
              void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
              if (Platform.OS === "android") void NavigationBar.setVisibilityAsync("visible");
            } else if (e.fullscreenUpdate === VideoFullscreenUpdate.PLAYER_DID_PRESENT) {
              setIsFullscreen(true);
              if (Platform.OS === "android") void NavigationBar.setVisibilityAsync("hidden");
              void ScreenOrientation.unlockAsync();
            } else if (e.fullscreenUpdate === VideoFullscreenUpdate.PLAYER_DID_DISMISS) {
              if (Platform.OS === "ios") {
                void videoRef.current?.playAsync();
              }
            }
          }}
        />
      </View>
    </>
  );
});

PostVideoPlayer.displayName = "PostVideoPlayer";

export default PostVideoPlayer;
