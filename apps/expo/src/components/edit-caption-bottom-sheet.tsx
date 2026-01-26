import type { FC } from "react";
import { useEffect, useState } from "react";
import { Keyboard, View } from "react-native";

import { api } from "@/utils/api";
import { cn } from "@/utils/cn";
import createToast from "@/utils/createToast";
import { PortalTextInput } from "./PortalTextInput";
import BottomSheet from "./ui/bottom-sheet";
import { Button } from "./ui/button";
import Toggle from "./ui/toggle";
import Typography from "./ui/typography";

interface Props {
  isOpen: boolean;
  storyId?: string;
  postId?: string;
  onClose: () => void;
}

export const EditCaptionBottomSheet: FC<Props> = ({ isOpen, onClose, postId, storyId }) => {
  const { data: me } = api.auth.user.me.useQuery();
  const { data: post } = api.auth.post.get.useQuery({ id: postId || "" }, { enabled: !!postId && isOpen });
  const { data: story } = api.auth.story.get.useQuery({ id: storyId || "" }, { enabled: !!storyId && isOpen });

  const [caption, setCaption] = useState(post?.caption || story?.caption || "");
  const [isStarPost, setIsStarPost] = useState(post?.starPost || story?.starPost || false);

  useEffect(() => {
    if (!me || (!post && !story)) return;

    if (post?.createdBy.id !== me.id && story?.createdBy.id !== me.id) onClose();

    setCaption(post?.caption || story?.caption || "");
    setIsStarPost(post?.starPost || story?.starPost || false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me, post, story]);

  const utils = api.useContext();
  const { mutate: updatePost, isLoading: isUpdatingPost } = api.auth.post.update.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.auth.post.invalidate()]);
      createToast({
        message: "Post updated!",
        type: "success",
      });
      onClose();
    },
    onError: () => {
      createToast({
        message: "Something went wrong",
        type: "error",
      });
    },
  });
  const { mutate: updateStory, isLoading: isUpdatingStory } = api.auth.story.update.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.auth.story.invalidate()]);
      createToast({
        message: "Story updated!",
        type: "success",
      });
      onClose();
    },
    onError: () => {
      createToast({
        message: "Something went wrong",
        type: "error",
      });
    },
  });

  const handleUpdate = () => {
    if (storyId) {
      updateStory({ id: storyId, caption, isStarPost });
    } else if (postId) {
      updatePost({ id: postId, caption, isStarPost });
    }
  };

  return (
    <BottomSheet open={isOpen} onClose={onClose} isLoading={caption == null && !me}>
      <View className="pb-6">
        <Typography cls="text-center mb-2 text-lg" fontWeight="bold">
          Edit post
        </Typography>

        <View className="mt-2">
          <Typography cls="mb-1.5 ml-1 text-sm text-center" variant="h3">
            Caption
          </Typography>
          <PortalTextInput value={caption} onChangeText={setCaption} onEndEditing={() => Keyboard.dismiss()} numberOfLines={4} />
        </View>

        {me?.verified && (
          <View className="mt-4 flex flex-col">
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

        <Button onPress={handleUpdate} cls="mt-4" variant="gradient" isLoading={isUpdatingPost || isUpdatingStory}>
          Save
        </Button>
      </View>
    </BottomSheet>
  );
};
