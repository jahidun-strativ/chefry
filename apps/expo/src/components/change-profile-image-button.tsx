import type { FC } from "react";
import { useState } from "react";
import { View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "@expo/vector-icons/Feather";

import { api } from "@/utils/api";
import { cn } from "@/utils/cn";
import createToast from "@/utils/createToast";
import { getImageUrl, uploadMedia } from "@/utils/imagekit";
import { Image } from "@/components/image";
import ButtonBase from "./ui/button-base";
import Skeleton from "./ui/skeleton";
import Spinner from "./ui/spinner";

interface Props {
  refetchUser?: () => Promise<void>;
}

const ChangeProfileImageButton: FC<Props> = ({ refetchUser }) => {
  const { refetch, data: user } = api.auth.user.me.useQuery();

  const utils = api.useContext();
  const { mutateAsync } = api.auth.user.updateProfileImage.useMutation({
    onSuccess: async () => {
      await Promise.all([refetch(), refetchUser?.(), utils.auth.user.invalidate()]);
      createToast({
        type: "success",
        message: "Profile image updated!",
      });
    },
  });

  const { mutateAsync: createSignedUploadUrl } = api.auth.media.createSignedUploadUrl.useMutation();

  const [isUploading, setIsUploading] = useState(false);
  const handlePickNewProfileImage = async () => {
    setIsUploading(true);

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        quality: 0.8,
        allowsEditing: true,
        aspect: [1, 1],
      });

      if (result.canceled) {
        setIsUploading(false);
        return;
      }

      const media = result.assets?.[0];
      if (!media) {
        setIsUploading(false);
        return;
      }

      const { mediaUpload } = await uploadMedia(media, createSignedUploadUrl, (progress) => console.log("progress", progress));

      if (!mediaUpload) throw new Error("Failed to upload media");

      await mutateAsync({
        media: mediaUpload,
      });

      setIsUploading(false);
    } catch (e) {
      setIsUploading(false);
      createToast({
        type: "error",
        message: "Something went wrong",
      });
    }
  };

  if (isUploading) {
    return (
      <View className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-white">
        <Spinner size={20} />
      </View>
    );
  }

  // return <IconButton onPress={handlePickNewProfileImage} iconName="image" cls="border-2 bg-black/10 border-white w-16 h-16" size="lg" />;
  return (
    <ButtonBase cls="z-10" onPress={handlePickNewProfileImage}>
      <LinearGradient
        colors={["#938DFB", "#A56ED5", "#B457B8", "#C73993", "#DD1465", "#EB004C"]}
        start={[0.0, 0.5]}
        end={[1.0, 0.5]}
        className={cn("z-10 aspect-square w-28 rounded-full", "p-[2px]")}
      >
        {!user && <Skeleton cls="w-full h-full rounded-full overflow-hidden opacity-50" />}

        {user && user?.image && (
          <Image
            source={{
              uri: getImageUrl(user.image.url, [{ width: "200", height: "200" }]),
              thumbhash: user.image.thumbhash ?? undefined,
            }}
            className="aspect-square w-full rounded-full bg-[#222222]"
            contentFit="fill"
          />
        )}
        {user && !user?.image && (
          <View className="flex aspect-square w-full items-center justify-center rounded-full bg-[#222222]">
            <Icon name="user" color="white" size={32} />
          </View>
        )}
      </LinearGradient>
    </ButtonBase>
  );
};

export default ChangeProfileImageButton;
