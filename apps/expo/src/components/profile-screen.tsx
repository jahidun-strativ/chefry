import type { FC } from "react";
import { useCallback, useRef, useState } from "react";
import { View } from "react-native";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import type { RefObject } from "react";
import type { FlashList } from "@shopify/flash-list";

import type { RouterOutputs } from "@/utils/api";
import { api } from "@/utils/api";
import PostsFeed from "./posts-feed";
import ProfileOverview from "./profile-overview";

type Post = RouterOutputs["auth"]["post"]["list"]["items"][number];

interface Props {
  username: string;
  linkPrefix?: string;
  onScroll: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

const ProfileScreen: FC<Props> = ({ username, linkPrefix, onScroll }) => {
  const { data: me } = api.auth.user.me.useQuery();
  const scrollRef = useRef<FlashList<Post>>(null) as RefObject<FlashList<Post>>;
  const profileOverviewHeight = useRef(0);

  const scrollPosition = useRef(0);
  const handleSetListType = useCallback((value: "grid" | "list") => {
    setListType(value);
  }, []);

  const [listType, setListType] = useState<"grid" | "list">("grid");

  return (
    <View className="max-w-4xl lg:max-w-6xl mx-auto w-full h-full">
      <PostsFeed
        listType={listType}
        ListHeaderComponent={
          <ProfileOverview
            onMeasured={(height) => (profileOverviewHeight.current = height)}
            listType={listType}
            username={username}
            onChangeListType={handleSetListType}
          />
        }
        linkPrefix={linkPrefix}
        variables={{ username }}
        feedEmptyText={
          username === me?.username ? "You have not yet uploaded any content" : "Unfortunately, this account has not posted any content yet."
        }
        scrollRef={scrollRef}
        onScroll={(e) => {
          scrollPosition.current = e.nativeEvent.contentOffset.y;
          onScroll(e);
        }}
      />
    </View>
  );
};

export default ProfileScreen;