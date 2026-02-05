/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ComponentType, FC, JSXElementConstructor, ReactElement, RefObject } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { Dimensions, Platform, RefreshControl, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";

import type { RouterInputs, RouterOutputs } from "@/utils/api";
import { api } from "@/utils/api";
import { cn } from "@/utils/cn";
import { useResponsive } from "@/hooks/useResponsive";
import subscribeLogo from "@/assets/subscribe-logo.png";
import { Image } from "@/components/image";
import { ImageViewer } from "./image-viewer";
import PostGridItem from "./post-grid-item";
import PostListItem from "./post-list-item";
import { Button } from "./ui/button";
import Spinner from "./ui/spinner";
import Typography from "./ui/typography";
import { VideoViewer } from "./video-viewer";

type Variables = RouterInputs["auth"]["post"]["list"];
type Post = RouterOutputs["auth"]["post"]["list"]["items"][number];

interface Props {
  listType: "grid" | "list";
  variables?: Variables;
  limit?: number;
  scrollRef?: RefObject<FlashList<Post>>;
  ListHeaderComponent?: ReactElement<any, string | JSXElementConstructor<any>> | ComponentType<any> | null | undefined;
  feedEmptyText?: string;
  showDiscoverButtonOnEmpty?: boolean;
  linkPrefix?: string;
  onPostsLoaded?: (posts: Post[]) => void;
  onScroll?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onRefetch?: () => Promise<void>;
}

const PostsFeed: FC<Props> = ({
  listType,
  variables = {},
  limit = 10,
  ListHeaderComponent,
  onScroll,
  scrollRef,
  onPostsLoaded,
  feedEmptyText,
  onRefetch,
  linkPrefix,
  showDiscoverButtonOnEmpty,
}) => {
  const { bottom, top } = useSafeAreaInsets();
  const { width, isMobile, isTablet, isDesktop } = useResponsive();
  const headerHeight = isMobile ? 70 : isTablet ? 75 : 80;
  const listItemContentHeight = Dimensions.get("window").height - (bottom + 55) - ((top || 20) + headerHeight);

  const [visibleItems, setVisibleItems] = useState<string[]>([]);

  const { data, isLoading, hasNextPage, fetchNextPage, refetch } = api.auth.post.list.useInfiniteQuery(
    { limit, ...variables },
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  );

  const [isRefreshing, setIsRefereshing] = useState(false);
  const handleRefresh = async () => {
    setIsRefereshing(true);
    try {
      await Promise.all(onRefetch ? [refetch(), onRefetch()] : [refetch()]);
      setIsRefereshing(false);
    } catch (e) {
      setIsRefereshing(false);
    }
  };

  const posts = useMemo(() => data?.pages.map((p) => p.items).flat() || [], [data]);
  const handleEndReached = async () => {
    if (hasNextPage && !isLoading) {
      await fetchNextPage();
    }
  };

  useEffect(() => {
    onPostsLoaded?.(posts);
  }, [posts, onPostsLoaded]);

  const { data: myStarFollows } = api.auth.user.myStarFollows.useQuery();
  const { data: me } = api.auth.user.me.useQuery();

  function renderHeader() {
    if (Platform.OS === "ios") {
      return ListHeaderComponent;
    } else {
      return (
        <View className="mt-28">
          <>{ListHeaderComponent}</>
        </View>
      );
    }
  }

  const [selectedImageUrl, setSelectedImageUrl] = useState<string>();
  const handleSelectImageUrl = useCallback((imageUrl: string) => setSelectedImageUrl(imageUrl), []);
  const handleCloseImageViewer = useCallback(() => setSelectedImageUrl(undefined), []);

  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string>();
  const handleSelectVideoUrl = useCallback((VideoUrl: string) => setSelectedVideoUrl(VideoUrl), []);
  const handleCloseVideoViewer = useCallback(() => setSelectedVideoUrl(undefined), []);

  return (
    <>
      <FlashList
        className="flex h-full w-full flex-col gap-6"
        scrollEventThrottle={50}
        data={posts}
        ref={scrollRef}
        ListEmptyComponent={() => {
          if (isLoading) {
            return null;
          }

          return (
            <View className={cn("flex flex-col items-center justify-center p-6 md:p-8 lg:p-12", Platform.OS === "android" && "py-0")}>
              {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any */}
              <Image source={subscribeLogo as any} style={{ width: isMobile ? 160 : isTablet ? 180 : 200, height: isMobile ? 160 : isTablet ? 180 : 200, opacity: 0.6 }} contentFit="contain" />
              <Typography variant="h2" fontWeight="bold" cls="text-center mt-6 md:mt-8 lg:mt-10">
                No posts yet
              </Typography>
              <Typography variant="p" fontWeight="regular" cls="text-center mt-2 md:mt-3 lg:mt-4 mb-10 md:mb-12 lg:mb-14">
                {feedEmptyText || "Unfortunately, none of the accounts you follow have posted any content."}
              </Typography>

              {showDiscoverButtonOnEmpty && (
                <Button href="/discover" size="lg" variant="outline" cls="w-full max-w-md lg:max-w-lg mb-12 md:mb-14 lg:mb-16 bg-black/30">
                  Discover new stars
                </Button>
              )}
            </View>
          );
        }}
        refreshControl={
          // <View className="" style={{ height: (top || 20) + 60 }}>
          <RefreshControl style={{ height: (top || 20) + 60 }} refreshing={isRefreshing} onRefresh={handleRefresh} />
          // </View>
        }
        onRefresh={handleRefresh}
        refreshing={isRefreshing}
        ListHeaderComponent={renderHeader()}
        ListFooterComponent={() => (
          <View style={{ paddingBottom: bottom + 160 }} className="flex flex-col items-center justify-start">
            {isLoading && (
              <View className="flex h-20 w-20 items-center justify-center">
                <Spinner size={32} />
              </View>
            )}
          </View>
        )}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={({ viewableItems }) => {
          setVisibleItems(viewableItems.map((item) => item.key));
        }}
        // viewabilityConfig={{
        //   itemVisiblePercentThreshold: 10,
        // }}
        extraData={{ visibleItems, listType, myStarFollows: myStarFollows?.map((follow) => follow?.followedUser.id) || [], meId: me?.id }}
        renderItem={({ item, extraData, index }) => {
          const { visibleItems, listType, myStarFollows, meId } = extraData as {
            visibleItems: string[];
            listType: string;
            myStarFollows: string[];
            meId: string;
          };
          const isStartracker = meId === item.createdBy.id || myStarFollows?.some((id) => id === item.createdBy.id) || false;

          if (listType === "list") {
            return (
              <PostListItem
                isStartracker={isStartracker}
                isVisible={!!visibleItems.find((id) => id === item.id)}
                post={item}
                linkPrefix={linkPrefix}
                onOpenImageViewer={handleSelectImageUrl}
                onOpenVideoViewer={handleSelectVideoUrl}
                cls="px-2 md:px-4 lg:px-6 mt-2 md:mt-3 lg:mt-4 mb-6 md:mb-8 lg:mb-10"
              />
            );
          } else {
            return <PostGridItem linkPrefix={linkPrefix} key={item.id} isStartracker={isStartracker} post={item} index={index} />;
          }
        }}
        onEndReached={handleEndReached}
        estimatedItemSize={listType === "list" ? listItemContentHeight : 130}
        numColumns={listType === "grid" ? 3 : 1}
        // ref={scrollRef}
        onScroll={onScroll}
      />
      <ImageViewer mediaUrl={selectedImageUrl} onClose={handleCloseImageViewer} />
      <VideoViewer mediaUrl={selectedVideoUrl} onClose={handleCloseVideoViewer} />
    </>
  );
};

export default PostsFeed;
