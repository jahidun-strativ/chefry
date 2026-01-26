import type { FC } from "react";
import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import Icon from "@expo/vector-icons/Feather";

import type { RouterOutputs } from "@startracker/api";

import { getImageUrl } from "@/utils/imagekit";
import { Image } from "@/components/image";
import ButtonBase from "./ui/button-base";
import Typography from "./ui/typography";

interface Props {
  suggestion: RouterOutputs["auth"]["user"]["suggestions"][number];
}

const FollowSuggestionItem: FC<Props> = ({ suggestion }) => {
  return (
    <Link href={`/view-profile/${suggestion.username}`} asChild>
      <ButtonBase className="items-cneter mr-4 flex flex-col">
        <LinearGradient
          colors={["#938DFB", "#9589F6", "#9B7FEA", "#A56ED5", "#B457B8", "#C73993", "#DD1465", "#EB004C"]}
          start={[0.0, 0.5]}
          end={[1.0, 0.5]}
          className="z-10 h-24 w-24 rounded-full p-0.5"
        >
          {/* {!user && <Skeleton cls="w-full h-full rounded-full overflow-hidden opacity-50" width={200} height={200} />} */}
          {suggestion?.image && (
            <Image
              source={{
                uri: getImageUrl(suggestion.image.url, [{ width: "200", height: "200" }]),
                thumbhash: suggestion.image.thumbhash ?? undefined,
              }}
              className="aspect-square w-full rounded-full bg-[#222222]"
              contentFit="fill"
            />
          )}
          {!!suggestion && !suggestion?.image && (
            <View className="flex aspect-square w-full items-center justify-center rounded-full bg-[#222222]">
              <Icon name="user" color="white" size={32} />
            </View>
          )}
        </LinearGradient>
        <Typography cls="mt-2 text-center" variant="h3">
          {suggestion.username}
        </Typography>
      </ButtonBase>
    </Link>
  );
};

export default FollowSuggestionItem;
