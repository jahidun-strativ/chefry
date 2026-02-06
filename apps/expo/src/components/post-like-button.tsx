/* eslint-disable @typescript-eslint/no-explicit-any */
import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import { View } from "react-native";
import { useClickOutside } from "react-native-click-outside";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "@expo/vector-icons/Feather";
import type { QueryObserverResult } from "@tanstack/react-query";
import type LottieView from "lottie-react-native";
import { AnimatePresence } from "moti";

import { api } from "@/utils/api";
import { cn } from "@/utils/cn";
import { useResponsive } from "@/hooks/useResponsive";
import createToast from "@/utils/createToast";
import type { POST_REACTION_TYPE } from "@/utils/models";
import useOpenState from "@/hooks/useOpenState";
import { AnimatedPostInteractionButton, postInteractions } from "./animated-post-interaction-button";
import ButtonBase from "./ui/button-base";
import Spinner from "./ui/spinner";

interface Props {
  postId: string;
  myReaction: POST_REACTION_TYPE | null;
  isLoading: boolean;
  onReact: (reactionType: "HEART" | "SMILE" | "STAR") => void;
  refetchReactionData: () => Promise<QueryObserverResult<any, any>>;
}

export interface PostLikeButtonHandle {
  likePost: () => void;
}

const PostLikeButton = forwardRef<PostLikeButtonHandle, Props>(
  ({ myReaction, refetchReactionData, isLoading, postId, onReact }, actionRef) => {
    const [interactionPickerOpen, openInteractionPicker, closeInteractionPicker] = useOpenState();

    const heartAnimationRef = useRef<LottieView>(null);
    const smileAnimationRef = useRef<LottieView>(null);
    const starAnimationRef = useRef<LottieView>(null);

    const utils = api.useContext();
    const { mutate } = api.auth.post.react.useMutation({
      onMutate: async ({ reactionType }) => {
        if (reactionType === "HEART" && myReaction !== "HEART") {
          onReact("HEART");
        }

        if (reactionType === "SMILE" && myReaction !== "SMILE") {
          onReact("SMILE");
        }

        if (reactionType === "STAR" && myReaction !== "STAR") {
          onReact("STAR");
        }

        await utils.auth.post.postReactions.cancel();
        const prevPostReactions = utils.auth.post.postReactions.getData({ postId });
        if (prevPostReactions) {
          const prevMyReaction = prevPostReactions.myReaction;
          utils.auth.post.postReactions.setData(
            { postId },
            {
              myReaction: myReaction === reactionType ? null : reactionType,
              heartReactionCount:
                prevPostReactions.heartReactionCount +
                (myReaction === reactionType ? 0 : reactionType === "HEART" ? 1 : 0) -
                (prevMyReaction === "HEART" ? 1 : 0),
              smileReactionCount:
                prevPostReactions.smileReactionCount +
                (myReaction === reactionType ? 0 : reactionType === "SMILE" ? 1 : 0) -
                (prevMyReaction === "SMILE" ? 1 : 0),
              starReactionCount:
                prevPostReactions.starReactionCount +
                (myReaction === reactionType ? 0 : reactionType === "STAR" ? 1 : 0) -
                (prevMyReaction === "STAR" ? 1 : 0),
            },
          );
        }
      },
      onSuccess: async () => {
        await refetchReactionData();
      },
      onError: (e) => {
        createToast({
          type: "error",
          message: e.message,
        });
      },
    });

    const handleReact = (type: POST_REACTION_TYPE) => () => {
      console.log("handleReact", type);
      mutate({ postId, reactionType: type });
      closeInteractionPicker();
    };

    useImperativeHandle(actionRef, () => ({
      likePost: () => {
        console.log("likePost", myReaction);
        mutate({ postId, reactionType: myReaction ?? "HEART" });
        openInteractionPicker();
      },
    }));

    const buttonGradient = useMemo(() => {
      if (!myReaction) return ["#938DFB", "#9589F6", "#9B7FEA", "#A56ED5", "#B457B8", "#C73993", "#DD1465", "#EB004C"];
      return postInteractions.find((interaction) => interaction.type === myReaction)?.gradientColors || [];
    }, [myReaction]);

    const { isMobile, isTablet } = useResponsive();
    const buttonSize = isMobile ? 64 : isTablet ? 72 : 80;
    const iconSize = isMobile ? 18 : isTablet ? 20 : 22;
    const bottomOffset = isMobile ? -32 : isTablet ? -36 : -40;

    return (
      <>
        <View className="pointer-events-auto absolute z-10" style={{ bottom: 10, right: 10, width: buttonSize, height: buttonSize }}>
          <AnimatePresence>
            {interactionPickerOpen &&
              postInteractions.map((interaction, index) => (
                <AnimatedPostInteractionButton
                  key={index}
                  index={index}
                  interaction={interaction}
                  onReact={handleReact(interaction.type)}
                  myReaction={myReaction}
                />
              ))}
          </AnimatePresence>
        </View>

        {/* {postInteractions[0] && (
      <AnimatedPostInteractionButton interaction={postInteractions[0]} />
      )} */}

        <LinearGradient
          colors={buttonGradient as [string, string, ...string[]]}
          className="absolute z-20 rounded-full p-[2px]"
          style={{ bottom: 10, right: 10, width: buttonSize, height: buttonSize }}
          start={[0.0, 0.0]}
          end={[1.0, 1.0]}
        >
          <ButtonBase
            onPress={!interactionPickerOpen ? openInteractionPicker : closeInteractionPicker}
            className={cn("flex h-full w-full items-center justify-center rounded-full", !myReaction ? "bg-[#222222]" : "bg-transparent")}
            disabled={isLoading}
          >
            {!interactionPickerOpen && !isLoading && (
              <>
                {!myReaction && <Icon name="heart" size={iconSize} color="#B950AF" />}
                {myReaction === "HEART" && <Icon name="heart" size={iconSize} color="white" />}
                {myReaction === "STAR" && <Icon name="star" size={iconSize} color="white" />}
                {myReaction === "SMILE" && <Icon name="smile" size={iconSize} color="white" />}
              </>
            )}
            {interactionPickerOpen && !isLoading && <Icon name="x" size={iconSize} color="white" />}
            {isLoading && <Spinner size={iconSize} />}
          </ButtonBase>
        </LinearGradient>
      </>
    );
  },
);

PostLikeButton.displayName = "PostLikeButton";

export default PostLikeButton;
