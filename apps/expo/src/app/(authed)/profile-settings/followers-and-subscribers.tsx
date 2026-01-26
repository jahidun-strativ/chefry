import type { FC } from "react";
import { useCallback, useMemo, useState } from "react";
import { Alert, RefreshControl, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "@expo/vector-icons/Feather";
import { FlashList } from "@shopify/flash-list";

import type { RouterOutputs } from "@/utils/api";
import { api } from "@/utils/api";
import { cn } from "@/utils/cn";
import createToast from "@/utils/createToast";
import { getImageUrl } from "@/utils/imagekit";
import { Image } from "@/components/image";
import MainLayout from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import ButtonBase from "@/components/ui/button-base";
import Skeleton from "@/components/ui/skeleton";
import Typography from "@/components/ui/typography";
import StartrackerIcon from "@/assets/startracker_icon.svg";

const FollowersAndSubscribersPage: FC = () => {
  const [followerType, setFollowerType] = useState<"DEFAULT" | "STAR_TRACKER">("DEFAULT");

  const { data, isLoading, hasNextPage, fetchNextPage, refetch } = api.auth.userFollow.list.useInfiniteQuery(
    { limit: 20, myFollowers: true, type: followerType },
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  );

  const [isRefreshing, setIsRefereshing] = useState(false);
  const handleRefresh = async () => {
    setIsRefereshing(true);
    try {
      await refetch();
      setIsRefereshing(false);
    } catch (e) {
      setIsRefereshing(false);
    }
  };

  const followers = useMemo(() => data?.pages.map((p) => p.items).flat() || [], [data]);
  const handleEndReached = async () => {
    if (hasNextPage && !isLoading) {
      await fetchNextPage();
    }
  };

  const utils = api.useContext();
  const { mutate } = api.auth.userFollow.removeFollower.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.auth.user.invalidate(),
        utils.auth.post.invalidate(),
        utils.auth.story.invalidate(),
        utils.auth.userFollow.invalidate(),
      ]);
      createToast({
        message: "Follower removed!",
        type: "success",
      });
    },
    onError: () => {
      createToast({
        message: "Follower removed!",
        type: "error",
      });
    },
  });

  const handleRemoveFollower = useCallback(
    (follower: RouterOutputs["auth"]["userFollow"]["list"]["items"][number]) => {
      if (!follower.subscriptionId) {
        Alert.alert(
          "Remove follower",
          `Are you sure you want to remove ${follower.followingUser.username} as a follower?`,
          [
            {
              text: "Delete",
              style: "destructive",
              onPress: () => {
                mutate({ username: follower.followingUser.username });
              },
            },
            { text: "Cancel", style: "cancel" },
          ],
          { cancelable: false },
        );
      } else {
        Alert.alert(
          "Remove follower and subscription",
          `Are you sure you want to remove ${follower.followingUser.username} as a follower and a subscriber? This will cancel their subscription.`,
          [
            {
              text: "Delete",
              style: "destructive",
              onPress: () => {
                mutate({ username: follower.followingUser.username });
              },
            },
            { text: "Cancel", style: "cancel" },
          ],
          { cancelable: false },
        );
      }
    },
    [mutate],
  );

  const handleRenderFollower = useCallback(
    ({ item }: { item: RouterOutputs["auth"]["userFollow"]["list"]["items"][number] }) => {
      const user = item.followingUser;
      return (
        <View className="flex flex-row items-center px-4 py-2">
          <LinearGradient
            colors={["#938DFB", "#9589F6", "#9B7FEA", "#A56ED5", "#B457B8", "#C73993", "#DD1465", "#EB004C"]}
            start={[0.0, 0.5]}
            end={[1.0, 0.5]}
            className="mr-4 aspect-square w-12 rounded-full p-[2px]"
          >
            {!user && <Skeleton cls="w-full h-full rounded-full overflow-hidden opacity-50" width={150} height={150} />}

            {user && user?.image && (
              <Image
                source={{
                  uri: getImageUrl(user.image.url, [{ width: "200", height: "200" }]),
                  thumbhash: user.image.thumbhash ?? undefined,
                }}
                className="aspect-square w-full rounded-full bg-[#222222]"
                contentFit="fill"
              />
            )}
            {user && !user?.image && (
              <View className="flex aspect-square w-full items-center justify-center rounded-full bg-[#222222]">
                <Icon name="user" color="white" size={16} />
              </View>
            )}
          </LinearGradient>

          <View className="flex-1">
            <Typography fontWeight="bold">{item.followingUser.username}</Typography>
          </View>
          <Button size="xs" variant="outline" cls="py-1 px-2" onPress={() => handleRemoveFollower(item)}>
            Remove
          </Button>
        </View>
      );
    },
    [handleRemoveFollower],
  );

  return (
    <MainLayout title="Followers & subscribers" contentType="custom" showBackButton>
      <FlashList
        className="flex h-full w-full flex-col space-y-6 px-6"
        scrollEventThrottle={50}
        ListHeaderComponent={
          <View className="flex w-full items-center justify-center pb-4 pt-10">
            <View className="flex flex-row rounded-full border border-white">
              <View className="overflow-hidden rounded-full">
                <ButtonBase
                  className={cn("rounded-full px-3 py-3", followerType === "DEFAULT" && "bg-white")}
                  onPress={() => setFollowerType("DEFAULT")}
                >
                  <Typography fontWeight="bold" cls={cn("text-white text-sm", followerType === "DEFAULT" && "text-black")}>
                    Followers
                  </Typography>
                </ButtonBase>
              </View>

              <View className="overflow-hidden rounded-full">
                <ButtonBase
                  className={cn("rounded-full px-3 py-3", followerType === "STAR_TRACKER" && "bg-white")}
                  onPress={() => setFollowerType("STAR_TRACKER")}
                >
                  <Typography fontWeight="bold" cls={cn("text-white text-sm", followerType === "STAR_TRACKER" && "text-black")}>
                    Subscribers
                  </Typography>
                </ButtonBase>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={() => {
          if (isLoading) {
            return null;
          }

          return (
            <View className="flex flex-col items-center justify-center p-6 py-6">
              <StartrackerIcon className="opacity-60" width={160} height={160} />
              <Typography variant="h2" fontWeight="bold" cls="text-center mt-6">
                {followerType === "DEFAULT" ? "No followers yet" : "No subscribers yet"}
              </Typography>
              <Typography variant="p" fontWeight="regular" cls="text-center text-lg leading-5 mt-2 mb-10">
                {followerType === "DEFAULT" ? "You do not have any followers yet." : "You do not have any subscribers yet."}
              </Typography>
            </View>
          );
        }}
        onRefresh={handleRefresh}
        refreshing={isRefreshing}
        data={followers}
        refreshControl={
          <View className="mt-28">
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          </View>
        }
        keyExtractor={(item) => item.id}
        onEndReached={handleEndReached}
        estimatedItemSize={100}
        // onScroll={onScroll}
        renderItem={handleRenderFollower}
      />
    </MainLayout>
  );
};

export default FollowersAndSubscribersPage;
