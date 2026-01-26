import type { ElementRef, FC } from "react";
import { useEffect, useMemo, useState } from "react";
import { Keyboard, Platform } from "react-native";
import { useClickOutside } from "react-native-click-outside";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ResizeMode, Video } from "expo-av";
import { View } from "moti";

import type { RouterOutputs } from "@/utils/api";
import { api } from "@/utils/api";
import { cn } from "@/utils/cn";
import createToast from "@/utils/createToast";
import { constructMediaUrl } from "@/utils/imagekit";
import { Image } from "@/components/image";
import BlurView from "./ui/blur-view";
import { Button } from "./ui/button";
import IconButton from "./ui/icon-button";
import Input from "./ui/input";
import Spinner from "./ui/spinner";
import Toggle from "./ui/toggle";
import Typography from "./ui/typography";

interface Props {
  media: RouterOutputs["auth"]["media"]["get"];
  cropMediaModalOpen: boolean;
  isRefetchingMedia: boolean;
  postType: "POST" | "STORY";
  openCropMediaModal: () => void;
  onClose: () => void;
}

const CreatePostForm: FC<Props> = ({ media, onClose, isRefetchingMedia, openCropMediaModal, postType }) => {
  const { data: me } = api.auth.user.me.useQuery();

  const [isStarPost, setIsStarPost] = useState(false);
  const [caption, setCaption] = useState("");

  const handleClose = () => {
    setCaption("");
    onClose();
  };

  const utils = api.useContext();
  const { mutateAsync: createPost, isLoading: isCreatingPost } = api.auth.post.create.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.auth.post.list.invalidate(), utils.auth.post.count.invalidate(), utils.auth.user.metaInfo.invalidate()]);
    },
  });

  const { mutateAsync: createStory, isLoading: isCreatingStory } = api.auth.story.create.useMutation({
    onSuccess: async () => {
      await utils.auth.story.list.invalidate();
    },
  });

  const isCreating = isCreatingPost || isCreatingStory;

  const handleCreatePost = async () => {
    if (!media) return;

    try {
      if (postType === "POST") {
        await createPost({ mediaId: media.id, caption, starPost: isStarPost });
      } else {
        await createStory({ mediaId: media.id, caption, starPost: isStarPost });
      }

      createToast({
        type: "success",
        message: postType === "POST" ? "Post created!" : "Story created!",
      });
      handleClose();
    } catch (e) {
      createToast({
        type: "error",
        message: "Something went wrong, please try again.",
      });
    }
  };

  const { top } = useSafeAreaInsets();
  const ref = useClickOutside<ElementRef<typeof View>>(() => Keyboard.dismiss());

  const aspectRatio = useMemo(() => {
    const { cropX, cropY, cropWidth, cropHeight, width, height } = media;

    if (postType === "STORY") {
      return 9 / 16;
    }

    if (cropWidth != null && cropHeight != null && cropX != null && cropY != null) {
      return cropWidth / cropHeight;
    }

    if (width != null && height != null) {
      return width / height;
    }

    return 1;
  }, [media, postType]);

  const [keyboardStatus, setKeyboardStatus] = useState<"hidden" | "shown">("hidden");

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardStatus("shown");
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardStatus("hidden");
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

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
        {/* <BlurView
        cls={cn(
          "flex w-full flex-col min-h-screen overflow-hidden flex-1 px-2 pb-8",
          Platform.OS === "android" ? "bg-black/70" : "bg-black/40",
        )}
        style={{ paddingTop: top + 10 }}
      > */}
        {me && (
          <>
            <Typography variant="h2" fontWeight="bold" cls="text-center mb-2">
              New {postType === "POST" ? "post" : "story"}
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

                {postType === "STORY" && (
                  <View className="absolute flex h-full w-full items-center justify-end p-4">
                    <Typography fontWeight="bold" cls="text-center text-white bg-black">
                      {caption}
                    </Typography>
                  </View>
                )}

                {media.type === "IMAGE" && (
                  <IconButton onPress={openCropMediaModal} iconName="crop" cls="absolute top-2 right-2" size="sm" />
                )}

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
                editable={!isCreatingPost}
                onEndEditing={() => Keyboard.dismiss()}
              />
            </View>

            {me.verified && (
              <View className="mt-2 flex flex-col">
                <Typography variant="h3" cls="text-center" numberOfLines={1}>
                  Share with
                </Typography>

                <View className="mb-2 mt-2 flex w-full flex-row items-center">
                  <View className="flex flex-1 items-end pr-2">
                    <Typography cls={cn("text-sm", isStarPost && "opacity-60")} fontWeight="medium" numberOfLines={1}>
                      All users
                    </Typography>
                  </View>

                  <View className="flex-none">
                    <Toggle checked={isStarPost} onToggle={() => setIsStarPost(!isStarPost)} />
                  </View>

                  <View className="flex w-full flex-1 items-start pl-2">
                    <Typography cls={cn("text-sm", !isStarPost && "opacity-60")} fontWeight="medium" numberOfLines={1}>
                      Subscribers only
                    </Typography>
                  </View>
                </View>
              </View>
            )}

            <Button onPress={handleCreatePost} isLoading={isCreating} size="lg" variant="outline" cls="mt-4">
              {isCreating ? "Uploading..." : "Upload"}
            </Button>
          </>
        )}
        {/* </BlurView> */}
      </KeyboardAwareScrollView>
    </BlurView>
  );
};

export default CreatePostForm;
