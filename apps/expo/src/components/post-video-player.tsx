import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Platform, View } from "react-native";
import { ResizeMode, Video, VideoFullscreenUpdate } from "expo-av";
import * as NavigationBar from "expo-navigation-bar";
import * as ScreenOrientation from "expo-screen-orientation";
import { AnimatePresence, MotiView } from "moti";

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
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  const [isFullscreen, setIsFullscreen] = useState(false);

  const videoRef = useRef<Video>(null);

  useEffect(() => {
    if (isPlaying) {
      setTimeout(() => setShowPlayButton(false), 500);
    } else {
      setShowPlayButton(true);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (hasLoaded && isVisible) {
      setIsPlaying(true);
    } else if (!isVisible) {
      setIsPlaying(false);
    }
  }, [hasLoaded, isVisible]);

  useImperativeHandle(ref, () => ({
    onTogglePlay: () => setIsPlaying((isPlaying) => !isPlaying),
    onOpenInFullscreen: async () => {
      await videoRef.current?.presentFullscreenPlayer();
      // push("/video-player/" + media.url),
    },
  }));

  return (
    <>
      {isFullscreen && <View className="fixed inset-0 h-full w-full bg-black" />}
      <View className="w-full overflow-hidden rounded-[50px]" style={{ aspectRatio: Math.max(aspectRatio, 0.7) }}>
        <Image
          source={{
            uri: media.thumbnail?.url ? getImageUrl(media.thumbnail?.url, [{ width: "1024" }]) : undefined,
          }}
          placeholder={Platform.OS === "ios" ? media.thumbhash : undefined}
          placeholderContentFit="cover"
          className="absolute h-full w-full"
          contentFit="cover"
          recyclingKey={media.id}
        />

        <View className="absolute flex h-full w-full items-center justify-center">
          <Spinner size={32} />
        </View>

        <AnimatePresence>
          {isVisible && (
            <MotiView className="absolute h-full w-full" from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Video
                source={{ uri: mediaBaseUrl + "tr:w-1024/" + media.url }}
                shouldPlay={isPlaying}
                isLooping
                ref={videoRef}
                isMuted={isMuted}
                onLoad={() => {
                  setShowPlayButton(false);
                  setHasLoaded(true);
                }}
                className="h-full w-full"
                resizeMode={isFullscreen ? ResizeMode.CONTAIN : ResizeMode.COVER}
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
            </MotiView>
          )}
        </AnimatePresence>

        {/* <AnimatePresence>
          {showPlayButton && hasLoaded && (
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute flex h-full w-full items-center justify-center"
            >
              <View className="flex h-20 w-20 items-center justify-center rounded-full bg-black/20">
                <Icon name={isPlaying ? "pause" : "play"} size={30} color="white" />
              </View>
            </MotiView>
          )}
        </AnimatePresence>

        <View className="absolute right-4 top-4 flex flex-row items-center">
          <IconButton
            onPress={() => {
              setIsPlaying(false);
              setIsMuted(true);
            }}
            href={"/video-player/" + media.url}
            iconName="maximize"
            cls="bg-black/20"
          />
          <View className="w-4" />
          <IconButton onPress={() => setIsMuted((isMuted) => !isMuted)} iconName={isMuted ? "volume-x" : "volume-2"} cls="bg-black/20" />
        </View> */}
      </View>
    </>
  );
});

PostVideoPlayer.displayName = "PostVideoPlayer";

export default PostVideoPlayer;
