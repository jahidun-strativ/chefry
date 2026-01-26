import type { FC } from "react";
import { useMemo } from "react";
import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "@expo/vector-icons/Feather";

import { api } from "@/utils/api";
import { cn } from "@/utils/cn";
import { getImageUrl } from "@/utils/imagekit";
import { Image } from "@/components/image";
import useOpenState from "@/hooks/useOpenState";
import StoriesPlayer from "./stories-player";
import ButtonBase from "./ui/button-base";
import Skeleton from "./ui/skeleton";
import Typography from "./ui/typography";

export const MyStory: FC = () => {
  const { data: me } = api.auth.user.me.useQuery();
  const { data: stories_ } = api.auth.story.list.useQuery({ username: me?.username ?? "" }, { enabled: !!me?.username });

  const stories = useMemo(() => stories_ || [], [stories_]);
  const storiesCount = stories?.length ?? 0;
  const storiesAreViewed = useMemo(() => stories?.every((story) => story?.isViewed), [stories]);

  const [storiesPlayerOpen, openStoriesPlayer, closeStoriesPlayer] = useOpenState();

  if (stories.length === 0) return <View className="w-2" />;

  return (
    <>
      <ButtonBase cls="z-20 mr-2 ml-2" disabled={storiesCount === 0} onPress={openStoriesPlayer}>
        <LinearGradient
          colors={
            storiesCount === 0
              ? ["rgba(100, 100, 100, 0.5)", "rgba(100, 100, 100, 0.9)"]
              : storiesAreViewed
                ? ["#666666", "#999999"]
                : ["#938DFB", "#9589F6", "#9B7FEA", "#A56ED5", "#B457B8", "#C73993", "#DD1465", "#EB004C"]
          }
          start={[0.0, 0.5]}
          end={[1.0, 0.5]}
          className={cn("z-10 aspect-square w-24 rounded-full p-[3px]")}
        >
          {!me && <Skeleton cls="w-full h-full rounded-full overflow-hidden opacity-50" width={150} height={150} />}

          {me && me?.image && (
            <Image
              source={{
                uri: getImageUrl(me.image.url, [{ width: "200", height: "200" }]),
                thumbhash: me.image.thumbhash ?? undefined,
              }}
              className="aspect-square w-full rounded-full bg-[#222222]"
              contentFit="fill"
            />
          )}
          {me && !me?.image && (
            <View className="flex aspect-square w-full items-center justify-center rounded-full bg-[#222222]">
              <Icon name="user" color="white" size={32} />
            </View>
          )}
        </LinearGradient>
        <Typography cls="truncate mt-1 text-xs text-center" fontWeight="bold" numberOfLines={1}>
          My story
        </Typography>
      </ButtonBase>
      <StoriesPlayer open={storiesPlayerOpen} stories={stories} onClose={closeStoriesPlayer} />
    </>
  );
};
