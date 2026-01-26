import { forwardRef, useImperativeHandle, useMemo, useState } from "react";
import { Platform, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "@expo/vector-icons/Feather";
import { FlashList } from "@shopify/flash-list";
import { AnimatePresence, MotiView } from "moti";

import { api } from "@/utils/api";
import { cn } from "@/utils/cn";
import { getImageUrl } from "@/utils/imagekit";
import { Image } from "@/components/image";
import { MyStory } from "./my-story";
import StoriesPlayer from "./stories-player";
import ButtonBase from "./ui/button-base";
import Typography from "./ui/typography";

export interface StoriesListHandle {
  refetch: () => Promise<void>;
}

const StoriesList = forwardRef<StoriesListHandle>((_, ref) => {
  const [openStoryId, setOpenStoryId] = useState<string>();

  const { data, refetch } = api.auth.story.list.useQuery({});
  const userStories = useMemo(() => data || [], [data]);

  const { data: me } = api.auth.user.me.useQuery();
  const { data: myStories_ } = api.auth.story.list.useQuery({ username: me?.username ?? "" }, { enabled: !!me?.username });
  const myStories = useMemo(() => myStories_ || [], [myStories_]);

  const handleCloseStoryPlayer = async () => {
    setOpenStoryId(undefined);
    await refetch();
  };

  useImperativeHandle(ref, () => ({
    async refetch() {
      await refetch();
    },
  }));

  const [height, setHeight] = useState(116);

  function renderMyStory() {
    return <MyStory />;
  }

  return (
    <>
      <View className="mb-4 mt-8">
        <AnimatePresence>
          {(userStories.length > 0 || myStories.length > 0) && (
            <MotiView
              className={cn("relative w-full overflow-hidden")}
              from={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: height }}
              exit={{ opacity: 0, height: 0 }}
              delay={1000}
              transition={{
                type: "spring",
                stiffness: 180,
                damping: 15,
              }}
            >
              <View className="absolute left-0 right-0 top-0 w-full" onLayout={(e) => setHeight(e.nativeEvent.layout.height)}>
                <FlashList
                  horizontal
                  data={userStories}
                  className="h-24"
                  estimatedItemSize={100}
                  renderItem={({ item }) => {
                    return (
                      <ButtonBase onPress={() => setOpenStoryId(item.id)} cls="mr-2 h-32">
                        <LinearGradient
                          colors={
                            !item.isViewed
                              ? ["#938DFB", "#9589F6", "#9B7FEA", "#A56ED5", "#B457B8", "#C73993", "#DD1465", "#EB004C"]
                              : ["#666666", "#999999"]
                          }
                          className={cn("h-24 w-24 rounded-full p-[3px]", item.isViewed && "opacity-60")}
                          start={[0.0, 0.0]}
                          end={[1.0, 1.0]}
                        >
                          {item.user.image && (
                            <Image
                              source={{
                                uri: getImageUrl(item.user.image.url, [{ width: "200", height: "200" }]),
                                thumbhash: Platform.OS === "ios" ? (item.user.image.thumbhash ?? undefined) : undefined,
                              }}
                              className="h-full w-full rounded-full"
                              contentFit="cover"
                            />
                          )}
                          {!item.user.image && (
                            <View className="flex aspect-square w-full items-center justify-center rounded-full bg-[#222222]">
                              <Icon name="user" color="white" size={32} />
                            </View>
                          )}
                        </LinearGradient>
                        <Typography cls="truncate mt-1 text-xs text-center" fontWeight="bold" numberOfLines={1}>
                          {item.user.username}
                        </Typography>
                      </ButtonBase>
                    );
                  }}
                  ListHeaderComponent={renderMyStory()}
                  keyExtractor={(item) => item.user.id}
                />
              </View>
            </MotiView>
          )}
        </AnimatePresence>
      </View>
      <StoriesPlayer
        key={openStoryId}
        open={!!openStoryId}
        onClose={handleCloseStoryPlayer}
        initialStoryId={openStoryId}
        stories={userStories}
      />
    </>
  );
});

StoriesList.displayName = "StoriesList";

export default StoriesList;
