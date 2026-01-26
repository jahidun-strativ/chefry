import type { FC } from "react";
import { useCallback, useEffect, useState } from "react";
import { Alert, View } from "react-native";
import Icon from "@expo/vector-icons/Feather";
import type { CONTENT_FLAG_TYPE } from "@prisma/client";

import { api } from "@/utils/api";
import { cn } from "@/utils/cn";
import createToast from "@/utils/createToast";
import { EditCaptionBottomSheet } from "./edit-caption-bottom-sheet";
import FullPageLoadingOverlay from "./full-page-loading-overlay";
import BottomSheet from "./ui/bottom-sheet";
import ButtonBase from "./ui/button-base";
import Spinner from "./ui/spinner";
import Typography from "./ui/typography";

interface Props {
  isOpen: boolean;
  postId?: string;
  storyId?: string;
  onContentHiddenOrDeleted?: () => void;
  onClose: () => void;
}

const flagTypeMap: Record<keyof typeof CONTENT_FLAG_TYPE, string> = {
  DISINFORMATION: "Disinformation",
  HATE_SPEECH: "Hate Speech",
  NUDE_CONTENT: "Nude Content",
  SPAM: "Spam",
  VIOLENCE: "Violence",
};

const flagTypes = Object.keys(flagTypeMap) as (keyof typeof CONTENT_FLAG_TYPE)[];

const ContentSettingsBottomSheet: FC<Props> = ({ isOpen, onClose, postId, storyId, onContentHiddenOrDeleted }) => {
  const { data: me } = api.auth.user.me.useQuery();
  const { data: post } = api.auth.post.get.useQuery({ id: postId || "" }, { enabled: !!postId });
  const { data: story } = api.auth.story.get.useQuery({ id: storyId || "" }, { enabled: !!storyId });

  const [flagContentActive, setFlagContentActive] = useState(false);

  useEffect(() => {
    setFlagContentActive(false);
  }, [isOpen]);

  const { mutate: flagContent, isLoading: isFlaggingContent } = api.auth.contentFlag.flag.useMutation({
    onSuccess: () => {
      onClose();
      Alert.alert(
        "Thank you",
        "We hope this message finds you well. We want to inform you that the content you recently flagged has been received and is currently under review by our dedicated team. We greatly appreciate your commitment to maintaining a safe and respectful environment for all users",
        [
          {
            text: "Continue",
          },
        ],
      );
    },
    onError: (e) => {
      createToast({
        type: "error",
        message: "Something went wrong while flagging content",
      });
    },
  });

  const handleFlagContent = (type: keyof typeof CONTENT_FLAG_TYPE) => () => {
    flagContent({
      storyId,
      postId,
      type,
    });
  };

  const utils = api.useContext();
  const { mutate: deletePost, isLoading: isDeletingPost } = api.auth.post.delete.useMutation({
    onSuccess: async () => {
      await utils.auth.post.list.invalidate();
      onClose();
      createToast({
        type: "success",
        message: "Content deleted!",
      });
      onContentHiddenOrDeleted?.();
    },
    onError: (e) => {
      createToast({
        type: "error",
        message: e.message || "Failed to delete content.",
      });
    },
  });

  const { mutate: deleteStory, isLoading: isDeletingStory } = api.auth.story.delete.useMutation({
    onSuccess: async () => {
      await utils.auth.post.list.invalidate();
      onClose();
      createToast({
        type: "success",
        message: "Content deleted!",
      });
      onContentHiddenOrDeleted?.();
    },
    onError: (e) => {
      createToast({
        type: "error",
        message: e.message || "Failed to delete content.",
      });
    },
  });

  const isDeleting = isDeletingPost || isDeletingStory;

  const { mutate: hidePost, isLoading: isHidingPost } = api.auth.post.hide.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.auth.post.list.invalidate(), utils.auth.post.count.invalidate(), utils.auth.user.metaInfo.invalidate()]);
      onClose();
      createToast({
        type: "success",
        message: "Content hidden!",
      });
      onContentHiddenOrDeleted?.();
    },
    onError: (e) => {
      createToast({
        type: "error",
        message: e.message || "Failed to hide content",
      });
    },
  });

  const { mutate: hideStory, isLoading: isHidingStory } = api.auth.story.hide.useMutation({
    onSuccess: async () => {
      await utils.auth.post.list.invalidate();
      onClose();
      createToast({
        type: "success",
        message: "Content deleted!",
      });
      onContentHiddenOrDeleted?.();
    },
    onError: (e) => {
      createToast({
        type: "error",
        message: e.message || "Failed to hide content",
      });
    },
  });

  const isHiding = isHidingPost || isHidingStory;

  const handleHideContent = () => {
    if (postId) {
      hidePost({ id: postId });
    } else if (storyId) {
      hideStory({ id: storyId });
    }
  };

  const handleDeleteContent = () => {
    onClose();
    Alert.alert(
      "Delete content",
      "Are you sure you want to delete this content? This action can't be undone.",
      [
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            if (post) {
              deletePost({ id: post.id });
            } else if (story) {
              deleteStory({ id: story.id });
            }
          },
        },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: false },
    );
  };

  const { mutate: blockUser } = api.auth.user.block.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.auth.post.invalidate(), utils.auth.user.invalidate(), utils.auth.story.invalidate()]);
      onClose();
      createToast({
        type: "success",
        message: "User blocked!",
      });
    },
    onError: (e) => {
      createToast({
        type: "error",
        message: e.message || "Failed to block user",
      });
    },
  });

  const handleBlockUser = () => {
    onClose();
    Alert.alert(
      "Block user?",
      "Are you sure you want to block this user? None of the users content will show up within the app anymore. If you're subscribing to the user, your subscription will be cancelled.",
      [
        {
          text: "Confirm block",
          style: "destructive",
          onPress: () => {
            if (post?.createdBy.username) {
              blockUser({ username: post.createdBy.username });
            }
          },
        },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: false },
    );
  };

  const [editedPostId, setEditedPostId] = useState<string>();
  const [editedStoryId, setEditedStoryId] = useState<string>();

  const editCaptionBottomSheetOpen = !!editedPostId || !!editedStoryId;
  const handleCloseEditCaptionBottomSheet = useCallback(() => {
    setEditedPostId(undefined);
    setEditedStoryId(undefined);
  }, []);

  return (
    <>
      <EditCaptionBottomSheet
        isOpen={editCaptionBottomSheetOpen}
        onClose={handleCloseEditCaptionBottomSheet}
        storyId={editedStoryId}
        postId={editedPostId}
      />

      <BottomSheet
        open={isOpen && !editCaptionBottomSheetOpen}
        onClose={onClose}
        isLoading={!me || (!post && !!postId) || (!story && !!storyId)}
      >
        {!flagContentActive && (
          <View className="flex flex-col pb-6">
            <Typography cls="text-center text-lg" fontWeight="bold">
              Post settings
            </Typography>
            {me && post?.createdBy.id !== me?.id && (
              <View className="flex flex-col space-y-2 divide-y divide-white/10">
                <ButtonBase onPress={() => setFlagContentActive(true)} cls="w-full">
                  <View className="flex w-full flex-row items-center justify-between pb-1 pt-3">
                    <Typography cls="text-base text-red-500">Flag</Typography>
                    <Icon name="chevron-right" size={24} color="white" />
                  </View>
                </ButtonBase>
                <ButtonBase onPress={handleHideContent} disabled={isHiding} cls={cn("w-full", isHiding && "opacity-50")}>
                  <View className="flex w-full flex-row items-center justify-between pb-1 pt-3">
                    <View className="flex flex-row items-center">
                      {isHiding && <Spinner size={16} />}
                      <Typography cls={cn("text-base", isHiding && "ml-4")}>Hide this content</Typography>
                    </View>
                    <Icon name="chevron-right" size={24} color="white" />
                  </View>
                </ButtonBase>
                <ButtonBase onPress={handleBlockUser} disabled={isHiding} cls={cn("w-full", isHiding && "opacity-50")}>
                  <View className="flex w-full flex-row items-center justify-between pb-1 pt-3">
                    <View className="flex flex-row items-center">
                      {isHiding && <Spinner size={16} />}
                      <Typography cls={cn("text-base", isHiding && "ml-4")}>Block this user</Typography>
                    </View>
                    <Icon name="chevron-right" size={24} color="white" />
                  </View>
                </ButtonBase>
              </View>
            )}
            {me && ((post && post.createdBy.id === me.id) || (story && story.createdBy.id === me.id)) && (
              <>
                <ButtonBase
                  onPress={() => {
                    onClose();

                    setTimeout(() => {
                      if (story) setEditedStoryId(story.id);
                      else if (post) setEditedPostId(post.id);
                    }, 500);
                  }}
                  cls="w-full mt-4 mb-3"
                >
                  <View className="flex w-full flex-row items-center justify-between pb-1 pt-3">
                    <View className="flex flex-row items-center">
                      <Typography cls={cn("text-base")}>Edit</Typography>
                    </View>
                    <Icon name="chevron-right" size={24} color="white" />
                  </View>
                </ButtonBase>
                <ButtonBase onPress={handleDeleteContent} cls="w-full mb-4">
                  <View className="flex w-full flex-row items-center justify-between pb-1 pt-3">
                    <View className="flex flex-row items-center">
                      {isDeleting && <Spinner size={16} />}
                      <Typography cls={cn("text-base", isHiding && "ml-4")}>Delete content</Typography>
                    </View>
                    <Icon name="chevron-right" size={24} color="white" />
                  </View>
                </ButtonBase>
              </>
            )}
          </View>
        )}

        {flagContentActive && (
          <View className="relative flex flex-col pb-6 ">
            <Typography cls="text-center text-lg mb-4" fontWeight="bold">
              Flag
            </Typography>

            <Typography cls="text-base mb-2" fontWeight="regular">
              Why are you flagging this content?
            </Typography>

            <Typography variant="p" cls="text-[#B6B6B6] text-xs">
              Before you proceed to flag content on startracker, we want to assure you that flagging is completely anonymous. We respect
              your privacy and understand the importance of creating a safe environment for all users. Your identity will remain
              confidential throughout the process.
            </Typography>

            <View className="mt-4 flex flex-col space-y-2 divide-y divide-white/10">
              {flagTypes.map((reason) => (
                <ButtonBase onPress={handleFlagContent(reason)} key={reason} cls="w-full">
                  <View className="flex w-full flex-row items-center justify-between pb-1 pt-3">
                    <Typography cls="text-sm">{flagTypeMap[reason]}</Typography>
                    <Icon name="chevron-right" size={24} color="white" />
                  </View>
                </ButtonBase>
              ))}
            </View>

            {isFlaggingContent && (
              <View className="absolute flex h-full w-full items-center justify-center bg-[#48464B]/70">
                <Spinner size={32} />
              </View>
            )}
          </View>
        )}
      </BottomSheet>
      <FullPageLoadingOverlay isLoading={isDeletingPost} />
    </>
  );
};

export default ContentSettingsBottomSheet;
