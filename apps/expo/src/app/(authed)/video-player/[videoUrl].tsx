import type { FC } from "react";
import { useRef, useState } from "react";
import { View } from "react-native";
import { Video, VideoFullscreenUpdate } from "expo-av";
import { useLocalSearchParams, useRouter } from "expo-router";
import clsx from "clsx";

import { mediaBaseUrl } from "@/utils/imagekit";

const VideoPlayerPage: FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const handleLoad = () => {
    setIsLoaded(true);
    void videoRef.current?.presentFullscreenPlayer();
  };

  const videoRef = useRef<Video>(null);

  const { videoUrl } = useLocalSearchParams() as { videoUrl: string };
  const { back } = useRouter();

  // const [orientation, setOrientation] = useState<ScreenOrientation.OrientationLock>(OrientationLock.PORTRAIT_UP);
  // useEffect(() => {
  //   void ScreenOrientation.unlockAsync();

  //   const subscription = ScreenOrientation.addOrientationChangeListener((e) => setOrientation(e.orientationLock));
  //   return () => {
  //     void ScreenOrientation.lockAsync(OrientationLock.PORTRAIT_UP);
  //     void ScreenOrientation.removeOrientationChangeListener(subscription);
  //   };
  // }, []);

  return (
    <View className="relative h-full w-full bg-black">
      <View className="absolute h-full w-full opacity-0">
        <Video
          ref={videoRef}
          source={{ uri: mediaBaseUrl + "tr:w-1024/" + videoUrl }}
          useNativeControls
          isMuted={false}
          shouldPlay
          onLoad={handleLoad}
          onFullscreenUpdate={(e) => {
            if (
              e.fullscreenUpdate === VideoFullscreenUpdate.PLAYER_DID_DISMISS ||
              e.fullscreenUpdate === VideoFullscreenUpdate.PLAYER_WILL_DISMISS
            ) {
              // back();
            }
          }}
          className={clsx("h-full w-full", isLoaded ? "opacity-100" : "opacity-0")}
        />
      </View>
    </View>
    // <View className="relative flex h-full w-full flex-col bg-black" style={{ paddingTop: top }}>
    //   <IconButton iconName="x" cls="absolute top-24 right-2 z-20 bg-black/50" size="lg" onPress={back} />
    //   <Video source={{ uri: mediaBaseUrl + "tr:w-1024/" + videoUrl }} useNativeControls shouldPlay className="h-full w-full" />
    // </View>
  );
};

export default VideoPlayerPage;
