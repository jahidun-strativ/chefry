import { useState } from "react";
import { Alert, Platform, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import type { RouterOutputs } from "@startracker/api";

import { api } from "@/utils/api";
import { cn } from "@/utils/cn";
import createToast from "@/utils/createToast";
import { constructMediaUrl } from "@/utils/imagekit";
import { Image } from "@/components/image";
import StartrackerIcon from "@/assets/startracker_icon.svg";
import IconButton from "../ui/icon-button";
import Spinner from "../ui/spinner";
import Typography from "../ui/typography";
import type { CreatedEventPackagePost } from "./create-event-package-post-button";
import { CreateEventPackagePostButton } from "./create-event-package-post-button";

type EventPackage = RouterOutputs["auth"]["eventPackage"]["getWithPosts"];

interface Props {
  eventPackage: EventPackage;
}

export function EditEventPackageContent({ eventPackage }: Props) {
  const utils = api.useUtils();
  const { mutate: createPost } = api.auth.post.create.useMutation({
    onSuccess: async () => {
      await utils.auth.eventPackage.invalidate();
      createToast({
        message: "Post created!",
        type: "success",
      });
    },
    onError: (e) => {
      createToast({
        message: e.message,
        type: "error",
      });
    },
  });

  const handleCreate = (post: CreatedEventPackagePost) => {
    if (!eventPackage) return;

    createPost({
      mediaId: post.media.id,
      caption: post.caption,
      eventPackageId: eventPackage.id,
      starPost: false,
    });
  };

  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const { mutate: deletePost } = api.auth.post.delete.useMutation({
    onMutate: ({ id }) => {
      setDeletingPostId(id);
    },
    onSuccess: async () => {
      await utils.auth.eventPackage.invalidate();
      setDeletingPostId(null);
      createToast({
        message: "Post deleted!",
        type: "success",
      });
    },
    onError: (e) => {
      setDeletingPostId(null);

      createToast({
        message: e.message,
        type: "error",
      });
    },
  });

  const handleDeletePost = (id: string) => {
    Alert.alert("Do you want to delete the post?", "This action cannot be undone.", [
      {
        text: "Cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deletePost({ id });
        },
      },
    ]);
  };

  const posts = eventPackage?.posts || [];

  return (
    <>
      <View className="flex flex-col">
        {posts.length === 0 && (
          <View className={cn("flex flex-col items-center justify-center p-6", Platform.OS === "android" && "py-0")}>
            <StartrackerIcon className="opacity-60" width={160} height={160} />
            <Typography variant="h2" fontWeight="bold" cls="text-center mt-6">
              No content added
            </Typography>
          </View>
        )}

        <View className="flex flex-row flex-wrap">
          {posts.map((post, index) => {
            const media = post.media[0];
            return (
              <View key={index} className="p-1" style={{ width: "49%" }}>
                <View className="relative mb-4 aspect-square w-full overflow-hidden rounded-xl border border-white bg-black">
                  {deletingPostId === post.id && (
                    <View className="absolute z-30 flex h-full w-full items-center justify-center bg-black/30">
                      <Spinner size={24} />
                    </View>
                  )}

                  {media && media.type === "IMAGE" && (
                    <Image source={constructMediaUrl(media)} contentFit="cover" className="absolute h-full w-full" />
                  )}

                  {media && media.type === "VIDEO" && (
                    <Image
                      source={{ uri: media.thumbnail ? constructMediaUrl(media.thumbnail) : undefined }}
                      className="absolute h-full w-full"
                      contentFit="cover"
                    />
                  )}

                  <LinearGradient
                    className="absolute z-20 flex h-full w-full flex-col justify-between p-1"
                    colors={["rgba(0,0,0,0)", "rgba(0,0,0,1)"]}
                  >
                    <View className="flex flex-row items-center justify-end">
                      <IconButton
                        href={`/edit-event-package/${eventPackage?.id}/post/${post.id}`}
                        size="xs"
                        iconName="eye"
                        cls="w-10 h-10 rounded-full  border border-white bg-black/50"
                      />
                      <View className="w-2" />
                      <IconButton
                        onPress={() => handleDeletePost(post.id)}
                        size="xs"
                        iconName="trash"
                        cls="w-10 h-10 rounded-full  border border-white bg-black/50"
                      />
                    </View>
                    <Typography numberOfLines={3} className="p-2 text-xs text-white">
                      {post.caption}
                    </Typography>
                  </LinearGradient>
                </View>
              </View>
            );
          })}
        </View>

        <View className="h-6" />
        <CreateEventPackagePostButton onCreate={handleCreate} />
      </View>
    </>
  );
}
