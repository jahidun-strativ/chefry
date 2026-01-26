import type { FC } from "react";
import { useRef } from "react";

import MainLayout from "@/components/main-layout";
import PostsFeed from "@/components/posts-feed";
import type { StoriesListHandle } from "@/components/stories-list";
import StoriesList from "@/components/stories-list";
import useScrollTracker from "@/hooks/useScrollTracker";

const FeedPage: FC = () => {
  const [isScrolled, onScroll] = useScrollTracker("/feed");

  const storiesListHandle = useRef<StoriesListHandle>(null);
  const handleRefresh = async () => {
    await storiesListHandle.current?.refetch();
  };

  return (
    <MainLayout isScrolled={isScrolled} contentType="custom" showProfileButton>
      <PostsFeed
        listType="list"
        onScroll={onScroll}
        linkPrefix="/feed"
        ListHeaderComponent={<StoriesList ref={storiesListHandle} />}
        onRefetch={handleRefresh}
        showDiscoverButtonOnEmpty
      />
    </MainLayout>
  );
};

export default FeedPage;
