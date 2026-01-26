import type { FC } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ImageZoom } from "@likashefqet/react-native-image-zoom";

import { getImageUrl } from "@/utils/imagekit";
import IconButton from "@/components/ui/icon-button";

const VideoPlayerPage: FC = () => {
  const { mediaUrl } = useLocalSearchParams() as { mediaUrl: string };
  const { top } = useSafeAreaInsets();
  const { back } = useRouter();

  const imageUrl = getImageUrl(mediaUrl, [{ width: "1024" }]);

  return (
    <View className="relative flex h-full w-full flex-col bg-black" style={{ paddingTop: top }}>
      <IconButton iconName="x" cls="absolute top-14 right-2 z-20 bg-black/50" size="lg" onPress={() => back()} />

      <ImageZoom uri={imageUrl} minScale={0.5} maxScale={5} resizeMode="contain" />
      {/* <Video source={{ uri: mediaBaseUrl + "tr:w-1024/" + videoUrl }} useNativeControls shouldPlay className="h-full w-full" /> */}
      {/* <VideoPlayer
        defaultControlsVisible
        videoProps={{
          shouldPlay: true,
          resizeMode: ResizeMode.CONTAIN,
          source: { uri: mediaBaseUrl + "tr:w-1024/" + videoUrl },
        }}
        slider={{
          visible: true,
        }}
        style={{ height: Dimensions.get("window").height - top - bottom }}
      /> */}
      {/* </SafeAreaView> */}
    </View>
  );
};

export default VideoPlayerPage;
