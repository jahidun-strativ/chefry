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
import { useResponsive } from "@/hooks/useResponsive";
import { getImageUrl } from "@/utils/imagekit";
import { Image } from "@/components/image";
import heartAnimation from "@/assets/animations/heart.json";
import smileAnimation from "@/assets/animations/smile.json";
import starAnimation from "@/assets/animations/star.json";
import subscribeLogo from "@/assets/subscribe-logo.png";
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
  const { isMobile, isTablet } = useResponsive();
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

    if (cropWidth != null && cropHeight != null && cropX != null && cropY != null && cropHeight > 0) {
      const ratio = cropWidth / cropHeight;
      return Math.max(0.5, Math.min(ratio, 2)); // Clamp between 0.5 and 2
    }

    if (width != null && height != null && height > 0) {
      const ratio = width / height;
      return Math.max(0.5, Math.min(ratio, 2)); // Clamp between 0.5 and 2
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
console.log({media});

  return (
    <>
      <View className={cn("mb-4 md:mb-6 lg:mb-8 mt-4 md:mt-6 lg:mt-8 flex flex-col pb-2 md:pb-3 lg:pb-4", cls)}>
        <View 
          className="relative flex flex-row items-center justify-between mb-2 md:mb-3 lg:mb-4 mx-auto w-full" 
          style={{ 
            maxWidth: isMobile ? "100%" : isTablet ? 500 : 600,
          }}
        >
          <View className="flex flex-row items-center flex-1">
            {profileImage && (
              <Link disabled={!me || me.id === post.createdBy.id} asChild href={(linkPrefix || "") + "/view-profile/" + post.createdBy.username}>
                <ButtonBase className="mr-2 md:mr-3 lg:mr-4">
                  <Image
                    source={{
                      uri: getImageUrl(profileImage.url, [{ width: "128" }]),
                      thumbhash: profileImage.thumbhash ?? undefined,
                    }}
                    className="rounded-full border-2 border-white bg-[#222222]"
                    style={{ 
                      width: isMobile ? 48 : isTablet ? 52 : 56,
                      height: isMobile ? 48 : isTablet ? 52 : 56,
                    }}
                    contentFit="cover"
                  />
                </ButtonBase>
              </Link>
            )}

            {!profileImage && (
              <View className="mr-2 md:mr-3 lg:mr-4 flex items-center justify-center rounded-full border-2 border-white bg-[#222222]" style={{ width: isMobile ? 48 : isTablet ? 52 : 56, height: isMobile ? 48 : isTablet ? 52 : 56 }}>
                <Icon name="user" size={isMobile ? 20 : isTablet ? 22 : 24} color="white" />
              </View>
            )}

            <Link
              disabled={!me || me.id === post.createdBy.id}
              asChild
              href={(linkPrefix || "") + "/view-profile/" + post.createdBy.username}
            >
              <ButtonBase className="flex flex-row items-center">
                <Typography cls="text-sm md:text-base lg:text-lg" variant="h3">
                  {post.createdBy.username}
                </Typography>
                {post.createdBy.verified && <VerifiedTick cls="ml-1.5 md:ml-2 lg:ml-2.5" />}
              </ButtonBase>
            </Link>
          </View>

          <IconButton 
            iconName="more-horizontal" 
            onPress={openPostSettings} 
            size="sm" 
          />
        </View>

        <View className="relative flex-1 overflow-hidden" >
          {/* <TapGestureHandler onHandlerStateChange={handleSingleTapEvent} numberOfTaps={1} waitFor={doubleTapRef}>
            <TapGestureHandler onHandlerStateChange={handleDoubleTapEvent} numberOfTaps={2} ref={doubleTapRef}> */}
          <View 
            className="relative w-full mx-auto" 
            style={{ 
              maxWidth: isMobile ? "100%" : isTablet ? 500 : 600,
            }}
          >
            {media?.url ? (
              <View className="relative">
                <LinearGradient
                  colors={
                    post.starPost
                      ? ["#938DFB", "#9589F6", "#9B7FEA", "#A56ED5", "#B457B8", "#C73993", "#DD1465", "#EB004C"]
                      : ["#FFFFFF", "#FFFFFF"]
                  }
                  start={[0.0, 0.5]}
                  end={[1.0, 0.5]}
                  className="relative rounded-[30px] p-px"
                  style={{ 
                    overflow: "hidden",
                  }}
                >
                  {media.type === "IMAGE" && (
                    <View 
                      className="w-full rounded-[30px] overflow-hidden"
                      style={{
                        aspectRatio: aspectRatio,
                        backgroundColor: "#111",
                      }}
                    >
                      <Image
                        source={{
                          uri: getImageUrl(media.url, [{ width: isMobile ? "800" : isTablet ? "900" : "1000" }]),
                        }}
                        placeholder={Platform.OS === "ios" && media.thumbhash ? media.thumbhash : undefined}
                        placeholderContentFit="contain"
                        style={{ 
                          width: "100%",
                          height: "100%",
                        }}
                        contentFit="contain"
                        transition={200}
                        recyclingKey={media.id}
                        onError={(error) => {
                          console.warn("Image load error:", error);
                        }}
                      />
                    </View>
                  )}

                  {media.type === "VIDEO" && (
                    <PostVideoPlayer ref={postVideoPlayerHandleRef} isVisible={isVisible} media={media} aspectRatio={aspectRatio} />
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
                </LinearGradient>
              </View>
            ) : (
              <View className="w-full rounded-[30px] bg-white/10 border border-white/20" style={{ height: 200, minHeight: 200 }}>
                <View className="flex h-full w-full items-center justify-center">
                  <Icon name="image" size={32} color="white" style={{ opacity: 0.5 }} />
                </View>
              </View>
            )}
          </View>
          {/* </TapGestureHandler>
          </TapGestureHandler> */}

          {Platform.OS !== "web" && (
            <View  className="absolute bottom-0 right-0 z-20 h-full w-full" pointerEvents="none">
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
              className="absolute h-full w-full rounded-[30px] p-px"
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
                {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any */}
                <Image source={subscribeLogo as any} style={{ width: isMobile ? 60 : isTablet ? 70 : 80, height: isMobile ? 60 : isTablet ? 70 : 80 }} contentFit="contain" />
                <Typography cls="mt-3 md:mt-4 lg:mt-5 text-base md:text-lg lg:text-xl" variant="h2">
                  Subscribe to see this content
                </Typography>
              </Pressable>
            </LinearGradient>
          )}
        </View>

        <View className="mx-2 md:mx-3 lg:mx-4 mt-3 md:mt-4 lg:mt-5 flex flex-row items-center" style={{ paddingHorizontal: isMobile ? 60 : isTablet ? 72 : 84 }}>
          <View className="flex-1 flex-row items-center justify-center">
            <Icon name="heart" size={isMobile ? 16 : isTablet ? 18 : 20} color="white" />
            {isLoadingReactionData ? (
              <View className="ml-1 md:ml-1.5 lg:ml-2 opacity-30">
                <Skeleton colorMode="dark" height={16} width={16} radius={4} />
              </View>
            ) : (
              <Typography cls="text-xs md:text-sm lg:text-base ml-1 md:ml-1.5 lg:ml-2" variant="p">
                {heartReactionCount || 0}
              </Typography>
            )}
          </View>

          <View className="flex-1 flex-row items-center justify-center">
            <Icon name="smile" size={isMobile ? 16 : isTablet ? 18 : 20} color="white" />
            {isLoadingReactionData ? (
              <View className="ml-1 md:ml-1.5 lg:ml-2 opacity-30">
                <Skeleton colorMode="dark" height={16} width={16} radius={4} />
              </View>
            ) : (
              <Typography cls="text-xs md:text-sm lg:text-base ml-1 md:ml-1.5 lg:ml-2" variant="p">
                {smileReactionCount || 0}
              </Typography>
            )}
          </View>

          <View className="flex-1 flex-row items-center justify-center">
            <Icon name="star" size={isMobile ? 16 : isTablet ? 18 : 20} color="white" />
            {isLoadingReactionData ? (
              <View className="ml-1 md:ml-1.5 lg:ml-2 opacity-30">
                <Skeleton colorMode="dark" height={16} width={16} radius={4} />
              </View>
            ) : (
              <Typography cls="text-xs md:text-sm lg:text-base ml-1 md:ml-1.5 lg:ml-2" variant="p">
                {starReactionCount || 0}
              </Typography>
            )}
          </View>
        </View>

        <ExpandablePostCaption caption={post.caption} username={post.createdBy.username} shouldBeHidden={post.starPost && !isStartracker} />
        <Typography variant="p" cls="mt-2 md:mt-3 lg:mt-4 pl-2 md:pl-3 lg:pl-4 text-xs md:text-sm lg:text-base">
          {autoRelativeTimeFormat(new Date(post.createdAt))}
        </Typography>
        <ContentSettingsBottomSheet isOpen={postSettingsOpen} onClose={closePostSettings} postId={post.id} />
      </View>
      <SubscibeToUserBottomSheet onClose={closeSubscribeBottomSheet} username={post.createdBy.username} isOpen={subscribeBottomSheetOpen} />
    </>
  );
};

export default PostListItem;
