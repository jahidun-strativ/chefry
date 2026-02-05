import type { FC } from "react";
import { useState } from "react";
import { Platform, View } from "react-native";
import { Link } from "expo-router";
import Icon from "@expo/vector-icons/Feather";

import { cn } from "@/utils/cn";
import type { INTEREST } from "@/utils/models";
import InterestsFilterPanel from "@/components/interests-filter-panel";
import MainLayout from "@/components/main-layout";
import PostsFeed from "@/components/posts-feed";
import ButtonBase from "@/components/ui/button-base";
import Typography from "@/components/ui/typography";
import useScrollTracker from "@/hooks/useScrollTracker";

const DiscoverPage: FC = () => {
  const [isScrolled, onScroll] = useScrollTracker("/discover");

  const [interestsFilter, setInterestsFilter] = useState<"ALL" | INTEREST[] | null>("ALL");

  function renderHeader() {
    return (
      <View key="header" className={cn("flex flex-col pb-2 md:pb-3 lg:pb-4", Platform.OS === "ios" ? "pt-8 md:pt-10 lg:pt-12" : "pt-8 md:pt-10 lg:pt-12")}>
        <View className="px-2 md:px-4 lg:px-6">
          <Link asChild href="/discover/search">
            <ButtonBase className="flex h-14 md:h-16 lg:h-18 flex-row items-center rounded-full border border-white bg-white/10 px-6 md:px-8 lg:px-10">
              <Icon name="search" size={24} color="white" />
              <Typography cls="text-2xl md:text-3xl lg:text-4xl ml-4 md:ml-5 lg:ml-6">Search...</Typography>
            </ButtonBase>
          </Link>
        </View>
        {interestsFilter && <InterestsFilterPanel interestsFilter={interestsFilter} setInterestsFilter={setInterestsFilter} />}
      </View>
    );
  }

  return (
    <MainLayout isScrolled={isScrolled} contentType="custom" showProfileButton isLoading={!interestsFilter}>
      <PostsFeed
        listType="grid"
        ListHeaderComponent={renderHeader()}
        onScroll={onScroll}
        linkPrefix="/discover"
        feedEmptyText="Unfortunately, no accounts have posted any content yet. We are working to onboard stars to the app so check back soon to see who has arrived!"
        variables={{
          isDiscoverFeed: true,
          tags: interestsFilter !== "ALL" ? interestsFilter : undefined,
        }}
      />
    </MainLayout>
  );
};

export default DiscoverPage;
