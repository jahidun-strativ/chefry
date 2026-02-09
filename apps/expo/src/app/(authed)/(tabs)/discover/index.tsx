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
        <View className="px-2 md:px-4 lg:px-6 mt-3">
          <Link asChild href="/discover/search">
            <ButtonBase className="flex h-12 md:h-14 lg:h-16 flex-row items-center rounded-full border border-white bg-white/10 px-4 md:px-6 lg:px-8 max-w-2xl lg:max-w-3xl mx-auto w-full">
              <Icon name="search" size={16} color="white" />
              <Typography cls="text-sm md:text-lg lg:text-xl ml-4 md:ml-5 lg:ml-6">Search...</Typography>
            </ButtonBase>
          </Link>
        </View>
        {interestsFilter && (
          <View className="max-w-6xl lg:max-w-7xl mx-auto w-full px-2 md:px-4 lg:px-6">
            <InterestsFilterPanel interestsFilter={interestsFilter} setInterestsFilter={setInterestsFilter} />
          </View>
        )}
      </View>
    );
  }

  return (
    <MainLayout isScrolled={isScrolled} contentType="custom" showProfileButton isLoading={!interestsFilter}>
      <View className="max-w-7xl mx-auto w-full h-full">
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
      </View>
    </MainLayout>
  );
};

export default DiscoverPage;
