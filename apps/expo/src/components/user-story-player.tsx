import type { FC } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Dimensions, Platform, View } from "react-native";
import { withAnchorPoint } from "react-native-anchor-point";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ResizeMode, Video } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";

import { api } from "@/utils/api";
import { cn } from "@/utils/cn";
import { getImageUrl, mediaBaseUrl } from "@/utils/imagekit";
import { Image } from "@/components/image";
import subscribeLogo from "@/assets/subscribe-logo.png";
import type { UserStory } from "./stories-player";
import BlurView from "./ui/blur-view";
import ButtonBase from "./ui/button-base";
import IconButton from "./ui/icon-button";
import Spinner from "./ui/spinner";
import Typography from "./ui/typography";

interface Props {
  story: UserStory;
  storySettingsIsOpen: boolean;
  isPaused: boolean;
  isStartracker: boolean;
  onPreviousUser: () => void;
  onNextUser: () => void;
  onClose: () => void;
  onOpenStorySettings: (storyId: string) => void;
}

const UserStoryPlayer: FC<Props> = ({
  onPreviousUser,
  onNextUser,
  story,
  onClose,
  onOpenStorySettings,
  isStartracker,
  storySettingsIsOpen,
  isPaused,
}) => {
  const { top: safeAreaTop } = useSafeAreaInsets();

  const stories = story.stories;

  const progress = useRef(new Animated.Value(0)).current;

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentStory = useMemo(() => stories[currentIndex], [stories, currentIndex]);

  const { mutate: registerView } = api.auth.story.registerView.useMutation();
  useEffect(() => {
    if (currentStory && !currentStory.isViewed) {
      registerView({ storyId: currentStory.id });
    }
  }, [currentStory, registerView]);

  function handleClose() {
    progress.setValue(0);
    reset();
    onClose();
  }

  function start(duration = 5000) {
    Animated.timing(progress, {
      toValue: 1,
      duration,
      easing: (x) => x,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        next();
      }
    });
  }

  const pauseInterval = useRef<NodeJS.Timeout | null>(null);

  const isPausedRef = useRef(false);
  const videoRef = useRef<Video>(null);
  const [pausedAt, setPausedAt] = useState(0);

  function pause() {
    pauseInterval.current = setTimeout(() => {
      isPausedRef.current = true;
      videoRef.current?.pauseAsync().catch(() => null);
      progress.stopAnimation((value) => {
        setPausedAt(value);
      });
    }, 200);
  }

  function resume() {
    videoRef.current?.playAsync().catch(() => null);
    if (pauseInterval.current) {
      clearTimeout(pauseInterval.current);
      isPausedRef.current = false;
    }
    Animated.timing(progress, {
      toValue: 1,
      duration: (1 - pausedAt) * 5000,
      easing: (x) => x,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        next();
      }
    });
  }

  useEffect(() => {
    if (storySettingsIsOpen) {
      pause();
    } else {
      resume();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storySettingsIsOpen]);

  function next() {
    if (isPausedRef.current) return;

    if (currentIndex !== stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      progress.setValue(0);
    } else {
      onNextUser();
    }
  }

  function previous() {
    if (currentIndex - 1 >= 0) {
      setCurrentIndex(currentIndex - 1);
      progress.setValue(0);
    } else {
      onPreviousUser();
      // reset();
    }
  }

  function reset() {
    setCurrentIndex(0);
    setPausedAt(0);
    progress.setValue(0);
  }

  useEffect(() => {
    if (isPaused) {
      pause();
    } else {
      resume();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaused]);

  return (
    <View className="flex h-full w-full flex-col">
      {currentStory && currentStory.media.type === "IMAGE" && (
        <Image
          onLoadEnd={() => {
            progress.setValue(0);
            start();
          }}
          source={{
            uri: getImageUrl(currentStory.media.url, [{ width: "1000" }]),
          }}
          placeholder={Platform.OS === "ios" ? currentStory.media.thumbhash : undefined}
          placeholderContentFit="cover"
          className="absolute inset-0 h-full w-full"
          contentFit="cover"
        />
      )}

      {currentStory && currentStory.media.type === "VIDEO" && (
        <>
          <Image
            className="absolute inset-0 h-full w-full"
            contentFit="cover"
            source={{ uri: currentStory.media.thumbhash ?? undefined }}
          />
          <View className="absolute inset-0 flex h-full w-full items-center justify-center">
            <Spinner size={32} />
          </View>
          <Video
            ref={videoRef}
            onReadyForDisplay={(e) => {
              progress.setValue(0);
              if (e.status?.isLoaded) {
                start(Math.min(e.status.durationMillis || 5000, 600000));
              }
            }}
            source={{
              uri: mediaBaseUrl + "tr:w-1024/" + currentStory.media.url,
            }}
            shouldPlay
            isMuted
            positionMillis={0}
            className="absolute inset-0 h-full w-full"
            resizeMode={ResizeMode.CONTAIN}
          />
        </>
      )}

      {currentStory?.caption && (
        <LinearGradient
          colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.4)", "rgba(0,0,0,0.5)", "rgba(0,0,0,0.6)"]}
          className="absolute bottom-0 flex w-full items-center justify-end p-8 py-12"
        >
          <Typography fontWeight="bold" cls="text-center text-2xl bg-white text-black">
            {currentStory.caption}
          </Typography>
        </LinearGradient>
      )}

      {currentStory?.starPost && !isStartracker && (
        <View className="absolute flex h-full w-full flex-col items-center justify-center overflow-hidden bg-[#9A82EE]/40">
          <BlurView cls={cn("absolute h-full w-full", Platform.OS === "android" ? "bg-black" : "bg-black/40")} />
          {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any */}
          <Image source={subscribeLogo as any} style={{ width: 120, height: 120 }} contentFit="contain" />
          <Typography cls="mt-4" variant="h2">
            Subscribe to see this content
          </Typography>
        </View>
      )}

      <View className="absolute z-10 flex h-full w-full flex-row">
        <ButtonBase className="flex-1" onPress={previous} />
        <ButtonBase className="flex-1" onPress={next} />
      </View>

      <LinearGradient
        className="absolute top-0 z-20 flex w-full flex-col space-y-4 pb-16"
        colors={["rgba(0,0,0,0.6)", "rgba(0,0,0,0.5)", "rgba(0,0,0,0.4)", "rgba(0,0,0,0)"]}
        style={{ paddingTop: safeAreaTop }}
      >
        <View className="mt-4 flex w-full flex-row px-2">
          {stories.map((_, index) => {
            return (
              <View key={index} className="mx-0.5 flex h-0.5 flex-1 flex-row overflow-hidden rounded-full bg-white/20">
                {currentIndex === index && (
                  <Animated.View
                    className="h-0.5 w-full bg-white"
                    style={withAnchorPoint(
                      { transform: [{ scaleX: currentIndex === index ? progress : currentIndex > index ? 1 : 0 }] },
                      { x: 0, y: 0.5 },
                      { width: Dimensions.get("window").width / stories.length, height: 2 },
                    )}
                  />
                )}
                {currentIndex > index && <View className="h-0.5 w-full bg-white" />}
              </View>
            );
          })}
        </View>

        <View className="flex w-full flex-row items-center justify-between px-2">
          <View className="flex flex-row items-center">
            {story.user.image && (
              <Image
                source={{
                  uri: getImageUrl(story.user.image.url, [{ width: "64" }]),
                  thumbhash: story.user.image.thumbhash ?? undefined,
                }}
                className="h-6 w-6 rounded-full border border-white"
                contentFit="cover"
              />
            )}
            <Link href={`/view-profile/${story.user.username}`} onPress={onClose} disabled={false} className="ml-3">
              <Typography fontWeight="bold" cls="text-sm">
                {story.user.username}
              </Typography>
            </Link>
          </View>

          <View className="flex flex-row items-center px-2">
            <IconButton iconName="more-horizontal" onPress={() => currentStory && onOpenStorySettings(currentStory.id)} />
            <View className="w-1" />
            <IconButton iconName="x" onPress={handleClose} />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

export default UserStoryPlayer;
