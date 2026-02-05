/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { FC } from "react";
import React, { useMemo, useRef } from "react";
import { Platform, Pressable, View } from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import Icon from "@expo/vector-icons/Feather";
import LottieView from "lottie-react-native";
import { Skeleton } from "moti/skeleton";

import type { RouterOutputs } from "@startracker/api";

import { api } from "@/utils/api";
import { autoRelativeTimeFormat } from "@/utils/auto-relative-time-format";
import { cn } from "@/utils/cn";
import { getImageUrl } from "@/utils/imagekit";
import { Image } from "@/components/image";
import heartAnimation from "@/assets/animations/heart.json";
import smileAnimation from "@/assets/animations/smile.json";
import starAnimation from "@/assets/animations/star.json";
import StartrackerIcon from "@/assets/gradient_icon.svg";
import useOpenState from "@/hooks/useOpenState";
import ContentSettingsBottomSheet from "./content-settings-bottom-sheet";
import { ExpandablePostCaption } from "./expandable-post-caption";
import type { PostLikeButtonHandle } from "./post-like-button";
import PostLikeButton from "./post-like-button";
import PostShareButton from "./post-share-button";
import type { PostVideoPlayerHandle } from "./post-video-player";
import PostVideoPlayer from "./post-video-player";
import SubscibeToUserBottomSheet from "./subscribe-to-user-bottom-sheet";
import BlurView from "./ui/blur-view";
import ButtonBase from "./ui/button-base";
import IconButton from "./ui/icon-button";
import Typography from "./ui/typography";
import VerifiedTick from "./ui/verified-tick";

type Post = RouterOutputs["auth"]["post"]["list"]["items"][number];

interface Props {
  post: Post;
  linkPrefix?: string;
  isVisible: boolean;
  isStartracker: boolean;
  disableBottomPadding?: boolean;
  cls?: string;
  onOpenImageViewer: (imageUrl: string) => void;
  onOpenVideoViewer: (videoUrl: string) => void;
}

const PostListItem: FC<Props> = ({ cls, isVisible, post, linkPrefix, isStartracker }) => {
  const { data: me } = api.auth.user.me.useQuery();
  const { data: canSubscribe } = api.auth.stripe.canSubscribe.useQuery(
    { username: post.createdBy.username },
    { enabled: !isStartracker && !!me && !!post.starPost && post.createdBy.id !== me.id },
  );
  const [subscribeBottomSheetOpen, openSubscribeBottomSheet, closeSubscribeBottomSheet] = useOpenState();

  const [postSettingsOpen, openPostSettings, closePostSettings] = useOpenState();

  const heartAnimationRef = useRef<LottieView>(null);
  const smileAnimationRef = useRef<LottieView>(null);
  const starAnimationRef = useRef<LottieView>(null);

  // const { bottom, top } = useSafeAreaInsets();
  // const maxContentHeight = Dimensions.get("window").height - (bottom + (!disableBottomPadding ? 65 : 0)) - (top + 80);

  const media = post.media?.[0];
  const profileImage = post.createdBy.image;

  const aspectRatio = useMemo(() => {
    if (!media) {
      return 1;
    }

    const { cropX, cropY, cropWidth, cropHeight, width, height } = media;

    if (cropWidth != null && cropHeight != null && cropX != null && cropY != null) {
      return cropWidth / cropHeight;
    }

    if (width != null && height != null) {
      return width / height;
    }

    return 1;
  }, [media]);

  const { data: postReactionData, isLoading: isLoadingReactionData, refetch } = api.auth.post.postReactions.useQuery({ postId: post.id });

  const { myReaction, heartReactionCount, smileReactionCount, starReactionCount } = postReactionData || {
    myReaction: null,
    heartReactionCount: null,
    smileReactionCount: null,
    starReactionCount: null,
  };

  const postVideoPlayerHandleRef = useRef<PostVideoPlayerHandle>(null);
  const postLikeButtonHandleRef = useRef<PostLikeButtonHandle>(null);

  // const doubleTapRef = useRef<TapGestureHandler>(null);
  // const handleDoubleTapEvent = (e: HandlerStateChangeEvent<TapGestureHandlerEventPayload>) => {
  //   if (e.nativeEvent.state === State.ACTIVE && postLikeButtonHandleRef.current) {
  //     void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  //     postLikeButtonHandleRef.current.likePost();
  //   }
  // };

  // const handleSingleTapEvent = (e: HandlerStateChangeEvent<TapGestureHandlerEventPayload>) => {
  //   console.log("handleSingleTapEvent", e.nativeEvent.state);
  //   if (e.nativeEvent.state === State.ACTIVE && media && media.type === "VIDEO" && postVideoPlayerHandleRef.current) {
  //     void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  //     if (Platform.OS === "android") {
  //       onOpenVideoViewer(media.url);
  //     } else {
  //       postVideoPlayerHandleRef.current.onOpenInFullscreen();
  //     }
  //   } else if (e.nativeEvent.state === State.ACTIVE && media && media.type === "IMAGE") {
  //     void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  //     onOpenImageViewer(media.url); // push("/image/" + media.url);
  //   }
  // };

  const handlePostReact = (reactionType: "HEART" | "SMILE" | "STAR") => {
    if (reactionType === "HEART") {
      heartAnimationRef.current?.reset();
      heartAnimationRef.current?.play();
    } else if (reactionType === "SMILE") {
      smileAnimationRef.current?.reset();
      smileAnimationRef.current?.play();
    } else if (reactionType === "STAR") {
      starAnimationRef.current?.reset();
      starAnimationRef.current?.play();
    }
  };

  return (
    <>
      <View className={cn("mb-12 mt-12 flex flex-col pb-4", cls)}>
        <View className="flex flex-row items-center justify-between pl-[90px]">
          <Link
            disabled={!me || me.id === post.createdBy.id}
            asChild
            href={(linkPrefix || "") + "/view-profile/" + post.createdBy.username}
          >
            <ButtonBase className="flex flex-row items-center">
              <Typography cls="text-base" variant="h3">
                {post.createdBy.username}
              </Typography>
              {post.createdBy.verified && <VerifiedTick cls="ml-2" />}
            </ButtonBase>
          </Link>

          <IconButton iconName="more-horizontal" onPress={openPostSettings} />
        </View>

        <View className="relative flex-1">
          {/* <TapGestureHandler onHandlerStateChange={handleSingleTapEvent} numberOfTaps={1} waitFor={doubleTapRef}>
            <TapGestureHandler onHandlerStateChange={handleDoubleTapEvent} numberOfTaps={2} ref={doubleTapRef}> */}
          <LinearGradient
            colors={
              post.starPost
                ? ["#938DFB", "#9589F6", "#9B7FEA", "#A56ED5", "#B457B8", "#C73993", "#DD1465", "#EB004C"]
                : ["#FFFFFF", "#FFFFFF"]
            }
            start={[0.0, 0.5]}
            end={[1.0, 0.5]}
            className="rounded-[50px] p-px"
          >
            {media?.type === "IMAGE" && (
              <Image
                source={{
                  uri: getImageUrl(media.url, [{ width: "1024" }]),
                }}
                placeholder={Platform.OS === "ios" ? media.thumbhash : undefined}
                placeholderContentFit="cover"
                className="w-full rounded-[50px]"
                style={{ aspectRatio: Math.max(aspectRatio, 0.7) }}
                contentFit="cover"
                transition={200}
                recyclingKey={media.id}
              />
            )}

            {media?.type === "VIDEO" && (
              <PostVideoPlayer ref={postVideoPlayerHandleRef} isVisible={isVisible} media={media} aspectRatio={aspectRatio} />
            )}
          </LinearGradient>
          {/* </TapGestureHandler>
          </TapGestureHandler> */}

          {Platform.OS !== "web" && (
            <View className="absolute bottom-0 right-0 z-20 h-full w-full" pointerEvents="none">
              <LottieView
                autoPlay={false}
                // autoSize
                loop={false}
                progress={1}
                ref={heartAnimationRef}
                style={{
                  position: "absolute",
                  transform: Platform.OS === "android" ? undefined : [{ scale: 1.1 }],
                  width: "100%",
                  height: "100%",
                }}
                source={heartAnimation}
              />
              <LottieView
                autoPlay={false}
                // autoSize
                loop={false}
                progress={1}
                ref={starAnimationRef}
                style={{
                  position: "absolute",
                  transform: [{ scale: 1.1 }],
                  width: "100%",
                  height: "100%",
                }}
                source={starAnimation}
              />
              <LottieView
                autoPlay={false}
                // autoSize
                loop={false}
                progress={1}
                ref={smileAnimationRef}
                style={{
                  position: "absolute",
                  transform: [{ scale: 1.1 }],
                  width: "100%",
                  height: "100%",
                }}
                source={smileAnimation}
              />
            </View>
          )}

          {post.starPost && !isStartracker && (
            <LinearGradient
              colors={
                post.starPost
                  ? ["#938DFB", "#9589F6", "#9B7FEA", "#A56ED5", "#B457B8", "#C73993", "#DD1465", "#EB004C"]
                  : ["#FFFFFF", "#FFFFFF"]
              }
              start={[0.0, 0.5]}
              end={[1.0, 0.5]}
              className="absolute h-full w-full rounded-[50px] p-px"
            >
              <Pressable
                onPress={() => {
                  if (me && canSubscribe && post.starPost && post.createdBy.id !== me.id) {
                    openSubscribeBottomSheet();
                  }
                }}
                className="absolute m-px flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-[50px] bg-[#9A82EE]/40"
              >
                <BlurView cls={cn("absolute h-full w-full", Platform.OS === "android" ? "bg-black" : "bg-black/80")} />
                <StartrackerIcon width={80} height={80} />
                <Typography cls="mt-4 text-xl" variant="h2">
                  Subscribe to see this content
                </Typography>
              </Pressable>
            </LinearGradient>
          )}

          {profileImage && (
            <Link disabled={!me || me.id === post.createdBy.id} asChild href={("/view-profile/" + post.createdBy.username) as any}>
              <ButtonBase cls="absolute -top-12">
                <Image
                  source={{
                    uri: getImageUrl(profileImage.url, [{ width: "128" }]),
                    thumbhash: profileImage.thumbhash ?? undefined,
                  }}
                  className="left-0 h-20 w-20 rounded-full border-2 border-white bg-[#222222]"
                  contentFit="cover"
                />
              </ButtonBase>
            </Link>
          )}

          {!profileImage && (
            <View className="absolute -top-12 left-0 flex h-20 w-20 items-center justify-center rounded-full border-2 border-white bg-[#222222]">
              <Icon name="user" size={32} color="white" />
            </View>
          )}

          {(!post.starPost || isStartracker) && (
            <>
              <PostShareButton postId={post.id} />
              <PostLikeButton
                ref={postLikeButtonHandleRef}
                isLoading={isLoadingReactionData}
                myReaction={myReaction}
                refetchReactionData={refetch}
                postId={post.id}
                onReact={handlePostReact}
              />
            </>
          )}
        </View>

        <View className="mx-2 mt-2 flex flex-row items-center px-20">
          <View className="flex-1 flex-row items-center justify-center">
            <Icon name="heart" size={18} color="white" />
            {isLoadingReactionData ? (
              <View className="ml-1 opacity-30">
                <Skeleton colorMode="dark" height={20} width={20} radius={4} />
              </View>
            ) : (
              <Typography cls="text-sm ml-1" variant="p">
                {heartReactionCount || 0}
              </Typography>
            )}
          </View>

          <View className="flex-1 flex-row items-center justify-center">
            <Icon name="smile" size={18} color="white" />
            {isLoadingReactionData ? (
              <View className="ml-1 opacity-30">
                <Skeleton colorMode="dark" height={20} width={20} radius={4} />
              </View>
            ) : (
              <Typography cls="text-sm ml-1" variant="p">
                {smileReactionCount || 0}
              </Typography>
            )}
          </View>

          <View className="flex-1 flex-row items-center justify-center">
            <Icon name="star" size={18} color="white" />
            {isLoadingReactionData ? (
              <View className="ml-1 opacity-30">
                <Skeleton colorMode="dark" height={20} width={20} radius={4} />
              </View>
            ) : (
              <Typography cls="text-sm ml-1" variant="p">
                {starReactionCount || 0}
              </Typography>
            )}
          </View>
        </View>

        <ExpandablePostCaption caption={post.caption} username={post.createdBy.username} shouldBeHidden={post.starPost && !isStartracker} />
        <Typography variant="p" cls="mt-3 pl-2 text-xs">
          {autoRelativeTimeFormat(new Date(post.createdAt))}
        </Typography>
        <ContentSettingsBottomSheet isOpen={postSettingsOpen} onClose={closePostSettings} postId={post.id} />
      </View>
      <SubscibeToUserBottomSheet onClose={closeSubscribeBottomSheet} username={post.createdBy.username} isOpen={subscribeBottomSheetOpen} />
    </>
  );
};

export default PostListItem;
