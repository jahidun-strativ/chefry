import type { FC } from "react";
import { useCallback, useState } from "react";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Portal } from "@gorhom/portal";
import { AnimatePresence, MotiView, View } from "moti";

import { api } from "@/utils/api";
import { constructMediaUrl } from "@/utils/imagekit";
import { Image } from "@/components/image";
import useOpenState from "@/hooks/useOpenState";
import CreatePostForm from "./create-post-form";
import ImageCropper from "./image-cropper";
import IconButton from "./ui/icon-button";

interface Props {
  isOpen: boolean;
  mediaId?: string;
  postType: "POST" | "STORY";
  onClose: () => void;
}

const CreatePostModal: FC<Props> = ({ isOpen, mediaId, postType, onClose }) => {
  const { data: media, refetch } = api.auth.media.get.useQuery({ id: mediaId || "" }, { enabled: !!mediaId && isOpen });

  const { top } = useSafeAreaInsets();

  const [cropMediaModalOpen, openCropMediaModal, closeCropMediaModal] = useOpenState();
  const [isRefetchingMedia, setIsRefetchingMedia] = useState(false);
  const handleRefetchMedia = useCallback(async () => {
    setIsRefetchingMedia(true);
    await refetch();
    setIsRefetchingMedia(false);
    closeCropMediaModal();
  }, [refetch, closeCropMediaModal]);

  return (
    <>
      <Portal>
        <AnimatePresence>
          {isOpen && media && (
            <MotiView
              from={{ opacity: 0, translateY: 100 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0, translateY: 100 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 30,
              }}
              className="absolute inset-0 z-50 h-full w-full bg-black/60"
            >
              <Animated.View className="flex h-full w-full flex-col justify-end overflow-hidden rounded-lg bg-black">
                {media && (
                  <>
                    {media.type === "IMAGE" && (
                      <Image source={constructMediaUrl(media)} contentFit="cover" className="absolute h-full w-full" />
                    )}

                    {media.type === "VIDEO" && (
                      <Image
                        source={{ uri: media.thumbnail ? constructMediaUrl(media.thumbnail) : undefined }}
                        className="absolute h-full w-full"
                        contentFit="cover"
                      />
                    )}

                    <View style={{ top: top + 5 }} className="absolute right-2 z-50">
                      <IconButton size="base" onPress={onClose} iconName="x" cls="bg-black/30" />
                    </View>

                    <CreatePostForm
                      media={media}
                      onClose={onClose}
                      isRefetchingMedia={isRefetchingMedia}
                      openCropMediaModal={openCropMediaModal}
                      cropMediaModalOpen={cropMediaModalOpen}
                      postType={postType}
                    />
                  </>
                )}
              </Animated.View>
              {/* </GestureDetector> */}
            </MotiView>
          )}
        </AnimatePresence>
      </Portal>
      <ImageCropper
        isOpen={media != null && cropMediaModalOpen}
        mediaId={media?.id}
        aspect={postType === "POST" ? 1 : 9 / 16}
        onClose={closeCropMediaModal}
        onCropSuccess={handleRefetchMedia}
      />
    </>
  );
};

export default CreatePostModal;
