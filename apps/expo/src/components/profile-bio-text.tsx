import type { FC } from "react";
import { useState } from "react";
import type { LayoutChangeEvent, NativeSyntheticEvent, TextLayoutEventData, TextLayoutLine } from "react-native";
import { Platform, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";
import { Portal } from "@gorhom/portal";
import { AnimatePresence, MotiView } from "moti";
import { linkIt } from "react-linkify-it";

import BlurView from "./ui/blur-view";
import IconButton from "./ui/icon-button";
import Typography from "./ui/typography";

interface Props {
  bio: string;
}

const MAX_LINE_COUNT = 3;

export const ProfileBioText: FC<Props> = ({ bio }) => {
  const { top } = useSafeAreaInsets();

  const IS_ANDROID = Platform.OS === "android";

  // prettier-ignore
  // eslint-disable-next-line
  const urlRegex = /(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/igm
  const bioWithLinks = linkIt(
    bio || "",
    (match, key) => {
      return (
        <Typography
          key={key}
          cls="text-white text-sm text-blue-500"
          fontWeight="bold"
          variant="p"
          onPress={() => WebBrowser.openBrowserAsync(match)}
        >
          {match}
        </Typography>
      );
    },
    urlRegex,
  );

  const [moreVisible, setMoreVisible] = useState(false);
  const [width, setWidth] = useState(0);

  const isTruncated = (lines: TextLayoutLine[]) => {
    if (IS_ANDROID) return lines.length > MAX_LINE_COUNT;
    return lines[lines.length - 1]!.text.length > lines[0]!.text.length || lines[lines.length - 1]!.width >= width * 0.82;
  };

  const handleLayout = (e: LayoutChangeEvent) => {
    if (!IS_ANDROID) setWidth(e.nativeEvent.layout.width);
  };

  const handleTextLayout = (e: NativeSyntheticEvent<TextLayoutEventData>) => {
    setMoreVisible(isTruncated(e.nativeEvent.lines));
  };

  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <View className="w-full">
        <Typography onLayout={handleLayout} variant="p" cls="text-left text-xs md:text-sm lg:text-base mt-0.5 md:mt-1 lg:mt-1.5" numberOfLines={3} onTextLayout={handleTextLayout}>
          {bioWithLinks}
        </Typography>
        {moreVisible && (
          <Pressable hitSlop={20} onPress={() => setIsExpanded(true)} className="mt-1 md:mt-1.5 lg:mt-2">
            <Typography variant="p" fontWeight="bold" className="text-xs md:text-sm lg:text-base">
              View more
            </Typography>
          </Pressable>
        )}
      </View>
      <Portal>
        <AnimatePresence>
          {isExpanded && (
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 300,
              }}
              className="absolute inset-0 z-50 flex h-full w-full items-center justify-center bg-black/60 p-6"
            >
              <MotiView
                from={{ opacity: 0, translateY: 100 }}
                animate={{ opacity: 1, translateY: 0 }}
                exit={{ opacity: 0, translateY: 100 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 30,
                }}
                className="relative w-full overflow-hidden rounded-2xl border border-white/40 shadow"
              >
                <BlurView cls="absolute inset-0 h-full w-full" />
                <View className="p-4">
                  <Typography className="text-sm text-white">{bio}</Typography>
                </View>
              </MotiView>
              <View style={{ top: top + 5 }} className="absolute right-2 z-50">
                <IconButton size="base" onPress={() => setIsExpanded(false)} iconName="x" cls="bg-black/30" />
              </View>
            </MotiView>
          )}
        </AnimatePresence>
      </Portal>
    </>
  );
};
