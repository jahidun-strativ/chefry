import type { FC } from "react";
import { useState } from "react";
import type { LayoutChangeEvent, NativeSyntheticEvent, TextLayoutEventData, TextLayoutLine } from "react-native";
import { Platform, Pressable, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { linkIt } from "react-linkify-it";

import Typography from "./ui/typography";

interface Props {
  username: string;
  caption: string | null;
  shouldBeHidden?: boolean;
}

const MAX_LINE_COUNT = 2;

export const ExpandablePostCaption: FC<Props> = ({ username, caption: _caption, shouldBeHidden }) => {
  const IS_ANDROID = Platform.OS === "android";

  // Get the 25 first characters of the caption
  const caption = _caption ? (shouldBeHidden ? (_caption?.length > 25 ? `${_caption.substring(0, 25)}...` : _caption) : _caption) : null;

  // prettier-ignore
  // eslint-disable-next-line
  const urlRegex = /(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/igm
  const captionWitLinks = linkIt(
    caption || "",
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

  const [numberOfLines, setNumberOfLines] = useState<number | undefined>(MAX_LINE_COUNT);
  const [moreVisible, setMoreVisible] = useState(false);
  const [width, setWidth] = useState(0);

  const isTruncated = (lines: TextLayoutLine[]) => {
    if (numberOfLines == null || lines.length < numberOfLines) return false;
    if (IS_ANDROID) return lines.length > numberOfLines;
    return lines[lines.length - 1]!.text.length > lines[0]!.text.length || lines[lines.length - 1]!.width >= width * 0.82;
  };

  const handleLayout = (e: LayoutChangeEvent) => {
    if (!IS_ANDROID) setWidth(e.nativeEvent.layout.width);
  };

  const handleTextLayout = (e: NativeSyntheticEvent<TextLayoutEventData>) => {
    setMoreVisible(isTruncated(e.nativeEvent.lines));
  };

  return (
    <View className="mt-3 md:mt-4 lg:mt-5 px-2 md:px-3 lg:px-4 leading-5">
      <Typography
        key={numberOfLines}
        numberOfLines={numberOfLines}
        cls="text-xs md:text-sm lg:text-base"
        variant="p"
        onLayout={handleLayout}
        onTextLayout={handleTextLayout}
      >
        <Typography cls="leading-5" fontWeight="bold">
          {username}{" "}
        </Typography>
        {captionWitLinks || <Typography cls="opacity-50">No caption</Typography>}
      </Typography>

      {moreVisible && (
        <Pressable
          hitSlop={20}
          onPress={() => {
            console.log("onPress");
            setNumberOfLines(undefined);
          }}
          className="mt-1 md:mt-1.5 lg:mt-2"
        >
          <Typography variant="p" fontWeight="bold" className="text-xs md:text-sm lg:text-base">
            Read more
          </Typography>
        </Pressable>
      )}
    </View>
  );
};
