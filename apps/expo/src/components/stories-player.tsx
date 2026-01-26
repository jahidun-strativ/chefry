import type { FC } from "react";
import React, { useCallback, useEffect, useState } from "react";
import { Dimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { Portal } from "@gorhom/portal";
import { AnimatePresence, MotiView } from "moti";

import type { RouterOutputs } from "@startracker/api";

import ContentSettingsBottomSheet from "./content-settings-bottom-sheet";
import UserStoryPlayer from "./user-story-player";

export type UserStory = RouterOutputs["auth"]["story"]["list"][number];

interface Props {
  open: boolean;
  initialStoryId?: string;
  stories: UserStory[];
  onClose: () => void;
}

const StoriesPlayer: FC<Props> = ({ open, stories, initialStoryId, onClose }) => {
  const [currrentUserStoryIndex, setCurrentUserStoryIndex] = useState(-1);
  const [userStoryTransitionDirection, setUserStoryTransitionDirection] = useState<-1 | 1>(1);
  const [isPaused, setIsPaused] = useState(false);

  const [storySettingsOpenForId, setStorySettingsOpenForId] = useState<string>();
  const handleCloseStorySettings = useCallback(() => {
    setStorySettingsOpenForId(undefined);
  }, []);

  const handleClose = useCallback(() => {
    setCurrentUserStoryIndex(-1);

    onClose();
    setIsPaused(false);
    handleCloseStorySettings();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (initialStoryId) {
      const initialStoryIndex = stories.findIndex((story) => story.id === initialStoryId);
      if (initialStoryIndex !== -1) {
        setCurrentUserStoryIndex(initialStoryIndex);
      } else {
        setCurrentUserStoryIndex(0);
      }
    } else {
      setCurrentUserStoryIndex(0);
    }
  }, [initialStoryId, open, stories]);

  const handlePreviousUserStory = () => {
    if (currrentUserStoryIndex > 0) {
      setUserStoryTransitionDirection(-1);
      setTimeout(() => {
        setCurrentUserStoryIndex(currrentUserStoryIndex - 1);
      }, 100);
    } else {
      setCurrentUserStoryIndex(0);
    }
  };

  const handleNextUserStory = () => {
    if (currrentUserStoryIndex < stories.length - 1) {
      setUserStoryTransitionDirection(1);
      setTimeout(() => {
        setCurrentUserStoryIndex(currrentUserStoryIndex + 1);
      }, 100);
    } else handleClose();
  };

  useEffect(() => {
    if (stories.length === 0) {
      return;
    }

    if (currrentUserStoryIndex < -1 || currrentUserStoryIndex > stories.length - 1) {
      handleClose();
    }
  }, [currrentUserStoryIndex, stories.length, handleClose]);

  const currentUserStory = stories[currrentUserStoryIndex];

  const screenWidth = Dimensions.get("screen").width;

  const dragY = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onBegin(() => {
      runOnJS(setIsPaused)(true);
    })
    .onUpdate(({ translationY }) => {
      dragY.value = Math.max(translationY, 0) * 0.3;
    })
    .onEnd(({ translationY }) => {
      dragY.value = withSpring(0, { stiffness: 300, damping: 24 });
      if (translationY > 200) {
        runOnJS(handleClose)();
      }
    })
    .onTouchesUp(() => {
      runOnJS(setIsPaused)(false);
    });

  const dragStyles = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: dragY.value }, { scale: Math.max(1 - dragY.value / 2000, 0.95) }],
    };
  });

  return (
    <>
      <Portal>
        <AnimatePresence>
          {open && (
            <MotiView
              from={{ opacity: 0, translateY: 100 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0, translateY: 100 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 30,
              }}
              className="absolute inset-0 z-50 h-full w-screen bg-black/60"
            >
              <GestureDetector gesture={gesture}>
                <Animated.View className="h-full w-full overflow-hidden rounded-lg" style={dragStyles}>
                  {currentUserStory && currrentUserStoryIndex !== -1 && (
                    <AnimatePresence initial={false}>
                      <MotiView
                        key={currentUserStory.id}
                        className="absolute h-full w-full"
                        from={{ translateX: userStoryTransitionDirection * screenWidth }}
                        animate={{ translateX: 0 }}
                        exit={{ translateX: -userStoryTransitionDirection * screenWidth }}
                        transition={{
                          type: "timing",
                          duration: 500,
                        }}
                      >
                        <UserStoryPlayer
                          key={currentUserStory.id}
                          onClose={handleClose}
                          story={currentUserStory}
                          isStartracker={currentUserStory.isStartracker}
                          onNextUser={handleNextUserStory}
                          onPreviousUser={handlePreviousUserStory}
                          onOpenStorySettings={setStorySettingsOpenForId}
                          storySettingsIsOpen={!!storySettingsOpenForId}
                          isPaused={isPaused}
                        />
                      </MotiView>
                    </AnimatePresence>
                  )}
                </Animated.View>
              </GestureDetector>
            </MotiView>
          )}
        </AnimatePresence>
      </Portal>
      <ContentSettingsBottomSheet
        isOpen={!!storySettingsOpenForId}
        onClose={handleCloseStorySettings}
        storyId={storySettingsOpenForId}
        onContentHiddenOrDeleted={handleClose}
      />
    </>
  );
};

export default StoriesPlayer;
