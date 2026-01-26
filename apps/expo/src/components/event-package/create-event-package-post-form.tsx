import type { ElementRef, FC } from "react";
import { useMemo, useState } from "react";
import { Keyboard, Platform } from "react-native";
import { useClickOutside } from "react-native-click-outside";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ResizeMode, Video } from "expo-av";
import { View } from "moti";

import type { RouterOutputs } from "@/utils/api";
import { cn } from "@/utils/cn";
import { constructMediaUrl } from "@/utils/imagekit";
import { Image } from "@/components/image";
import BlurView from "../ui/blur-view";
import { Button } from "../ui/button";
import IconButton from "../ui/icon-button";
import Input from "../ui/input";
import Spinner from "../ui/spinner";
import Typography from "../ui/typography";
import type { CreatedEventPackagePost } from "./create-event-package-content";

type Media = RouterOutputs["auth"]["media"]["get"];

interface Props {
  media: Media;
  cropMediaModalOpen: boolean;
  isRefetchingMedia: boolean;
  openCropMediaModal: () => void;
  onCreated: (post: CreatedEventPackagePost) => void;
  onClose: () => void;
}

const CreateEventPackagePostForm: FC<Props> = ({ media, onClose, isRefetchingMedia, onCreated, openCropMediaModal }) => {
  const [caption, setCaption] = useState("");

  const handleClose = () => {
    setCaption("");
    onClose();
  };

  const handleCreatePost = () => {
    if (!media) return;
    onCreated({ media, caption });
    handleClose();
  };

  const { top } = useSafeAreaInsets();
  const ref = useClickOutside<ElementRef<typeof View>>(() => Keyboard.dismiss());

  const aspectRatio = useMemo(() => {
    const { cropX, cropY, cropWidth, cropHeight, width, height } = media;

    if (cropWidth != null && cropHeight != null && cropX != null && cropY != null) {
      return cropWidth / cropHeight;
    }

    if (width != null && height != null) {
      return width / height;
    }

    return 1;
  }, [media]);

  return (
    <BlurView cls={cn("w-full h-full", Platform.OS === "android" ? "bg-black/70" : "bg-black/40")}>
      <KeyboardAwareScrollView
        contentContainerStyle={{ minHeight: "100%" }}
        className="flex flex-col px-2 pb-12"
        style={{ paddingTop: top + 10 }}
        // extraHeight={1000}
        extraScrollHeight={Platform.OS === "android" ? 100 : 0}
        scrollEnabled={true}
        enableOnAndroid
      >
        <Typography variant="h2" fontWeight="bold" cls="text-center mb-2">
          New post for pacakge
        </Typography>

        <View className="flex max-h-[400px] min-h-[260px] items-center justify-center px-1">
          <View className="relative mx-auto mb-4 mt-4 overflow-hidden rounded-lg border border-white bg-black" style={{ aspectRatio }}>
            {media.type === "IMAGE" && (
              <Image
                className={aspectRatio >= 1 ? "w-full" : "h-full"}
                contentFit="cover"
                style={{ aspectRatio }}
                source={constructMediaUrl(media)}
              />
            )}

            {media.type === "VIDEO" && (
              <Video
                source={{ uri: constructMediaUrl(media) }}
                shouldPlay
                isLooping
                className={aspectRatio > 1 ? "w-full" : "h-full"}
                style={{ aspectRatio }}
                resizeMode={ResizeMode.CONTAIN}
              />
            )}

            {media.type === "IMAGE" && <IconButton onPress={openCropMediaModal} iconName="crop" cls="absolute top-2 right-2" size="sm" />}

            {isRefetchingMedia && (
              <View className="absolute flex h-full w-full items-center justify-center bg-black/40">
                <Spinner />
              </View>
            )}
          </View>
        </View>

        <View ref={ref} accessible={false} className="mt-6 flex-none">
          <Input
            multiline
            numberOfLines={5}
            classes={{ root: "flex-none", inputWrapper: "rounded-lg", input: "px-4 py-4 h-full rounded-lg" }}
            placeholder="Write a caption..."
            value={caption}
            onChangeText={setCaption}
            onEndEditing={() => Keyboard.dismiss()}
          />
        </View>

        <Button onPress={handleCreatePost} size="lg" variant="outline" cls="mt-4">
          Create
        </Button>
      </KeyboardAwareScrollView>
    </BlurView>
  );
};

export default CreateEventPackagePostForm;
