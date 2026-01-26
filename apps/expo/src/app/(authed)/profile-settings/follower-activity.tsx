import type { FC } from "react";
import { useCallback, useMemo, useState } from "react";
import { RefreshControl, View } from "react-native";
import { FlashList } from "@shopify/flash-list";

import type { RouterOutputs } from "@/utils/api";
import { api } from "@/utils/api";
import FollowersGraph from "@/components/followers-graph";
import MainLayout from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import Typography from "@/components/ui/typography";
import StartrackerIcon from "@/assets/startracker_icon.svg";
import useScrollTracker from "@/hooks/useScrollTracker";

const FollowerActivityPage: FC = () => {
  const [isScrolled, onScroll] = useScrollTracker("/follower-activity");

  const { data: me } = api.auth.user.me.useQuery();
  const { data, isLoading, hasNextPage, fetchNextPage, refetch } = api.auth.userFollow.list.useInfiniteQuery(
    { limit: 20, myFollowers: true },
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

  const handleRenderFollower = useCallback(({ item }: { item: RouterOutputs["auth"]["userFollow"]["list"]["items"][number] }) => {
    return (
      <View className="flex flex-row items-center justify-between px-4 py-2">
        <Typography>{item.followingUser.username}</Typography>
        <Button size="sm" variant="outline" cls="py-1">
          Remove
        </Button>
      </View>
    );
  }, []);

  return (
    <MainLayout isScrolled={isScrolled} showBackButton contentType="custom" isLoading={!me || !data}>
      {/* <FollowersGraph /> */}
      <FlashList
        className="flex h-full w-full flex-col space-y-6 px-6"
        scrollEventThrottle={50}
        ListHeaderComponent={<FollowersGraph />}
        ListEmptyComponent={() => {
          if (isLoading) {
            return null;
          }

          return (
            <View className="flex flex-col items-center justify-center p-6 py-6">
              <StartrackerIcon className="opacity-60" width={160} height={160} />
              <Typography variant="h2" fontWeight="bold" cls="text-center mt-6">
                No posts yet
              </Typography>
              <Typography variant="p" fontWeight="regular" cls="text-center text-lg leading-5 mt-2 mb-10">
                You do not have any followers yet.
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
        onScroll={onScroll}
        renderItem={handleRenderFollower}
      />
    </MainLayout>
  );
};

export default FollowerActivityPage;
