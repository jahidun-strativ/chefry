/* eslint-disable jsx-a11y/no-autofocus */
import type { FC } from "react";
import { useMemo, useState } from "react";
import { Platform, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, MotiView } from "moti";
import { useDebounce } from "usehooks-ts";
import { z } from "zod";

import { api } from "@/utils/api";
import { cn } from "@/utils/cn";
import { useResponsive } from "@/hooks/useResponsive";
import type { INTEREST } from "@/utils/models";
import subscribeLogo from "@/assets/subscribe-logo.png";
import { Image } from "@/components/image";
import FollowSuggestionItem from "@/components/follow-suggestion-item";
import InterestsFilterPanel from "@/components/interests-filter-panel";
import MainLayout from "@/components/main-layout";
import Input from "@/components/ui/input";
import Typography from "@/components/ui/typography";
import UserSearchListItem from "@/components/user-search-list-item";

const RecentSearchesSchema = z.array(z.string());

const SearchPage: FC = () => {
  const [searchText, setSearchText] = useState("");

  const [interestsFilter, setInterestsFilter] = useState<"ALL" | INTEREST[] | null>("ALL");

  const debouncedSearchText = useDebounce(searchText, 300);

  const { data, isLoading: isLoading_ } = api.auth.user.search.useQuery(
    { searchText: debouncedSearchText, interests: interestsFilter !== "ALL" ? interestsFilter : undefined },
    { enabled: debouncedSearchText.length > 1 },
  );

  const searchResults = useMemo(() => data ?? [], [data]);

  const isLoading = isLoading_ && debouncedSearchText.length > 1;

  const utils = api.useContext();
  const { data: recentSearchesData, refetch } = useQuery(["recent-searches"], async () => {
    try {
      const jsonRecentSearches = await AsyncStorage.getItem("recent-searches");
      const recentSearchesUsernames =
        jsonRecentSearches != null ? await RecentSearchesSchema.parseAsync(JSON.parse(jsonRecentSearches)) : [];
      return (await utils.auth.user.byUsernames.fetch(recentSearchesUsernames)).sort((a, b) => {
        const aIndex = recentSearchesUsernames.indexOf(a.username);
        const bIndex = recentSearchesUsernames.indexOf(b.username);
        return aIndex - bIndex;
      });
    } catch (e) {
      await AsyncStorage.setItem("recent-searches", JSON.stringify([]));
      return [];
    }
  });
  const recentSearches = useMemo(() => recentSearchesData ?? [], [recentSearchesData]);

  const handleAddRecentSearch = async (username: string) => {
    try {
      const jsonRecentSearches = await AsyncStorage.getItem("recent-searches");
      const recentSearchesUsernames =
        jsonRecentSearches != null ? await RecentSearchesSchema.parseAsync(JSON.parse(jsonRecentSearches)) : [];
      const newRecentSearchesUsernames = [username, ...recentSearchesUsernames.filter((u) => u !== username)].slice(0, 5);
      await AsyncStorage.setItem("recent-searches", JSON.stringify(newRecentSearchesUsernames));
      await refetch();
    } catch (e) {
      await AsyncStorage.setItem("recent-searches", JSON.stringify([]));
    }
  };

  const handleDeleteSearch = async (username: string) => {
    try {
      const jsonRecentSearches = await AsyncStorage.getItem("recent-searches");
      const recentSearchesUsernames =
        jsonRecentSearches != null ? await RecentSearchesSchema.parseAsync(JSON.parse(jsonRecentSearches)) : [];
      const newRecentSearchesUsernames = recentSearchesUsernames.filter((u) => u !== username);
      await AsyncStorage.setItem("recent-searches", JSON.stringify(newRecentSearchesUsernames));
      await refetch();
    } catch (e) {
      await AsyncStorage.setItem("recent-searches", JSON.stringify([]));
    }
  };

  const { data: suggestions, isLoading: isLoadingSuggestions } = api.auth.user.suggestions.useQuery();
  const { isMobile, isTablet, isDesktop } = useResponsive();

  return (
    <MainLayout showBackButton contentType="scrollable">
      <Input placeholder="Search..." autoFocus value={searchText} onChangeText={setSearchText} className="max-w-md lg:max-w-lg mx-auto w-full" />

      <View className="-mx-4 w-[110%]">
        {interestsFilter && (
          <InterestsFilterPanel interestsFilter={interestsFilter} setInterestsFilter={setInterestsFilter} useStartPadding />
        )}
      </View>

      <AnimatePresence exitBeforeEnter>
        {!isLoading && !isLoadingSuggestions && suggestions?.length !== 0 && debouncedSearchText.length < 2 && (
          <MotiView
            key="empty-search"
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "timing", duration: 200 }}
          >
            <Typography variant="h3" cls="mt-8 md:mt-10 lg:mt-12 mb-3 md:mb-4 lg:mb-5">
              Suggestions
            </Typography>
            <ScrollView horizontal className="-mx-6 md:-mx-8 lg:-mx-10" showsHorizontalScrollIndicator={false}>
              <View className="w-6 md:w-8 lg:w-10" />
              {suggestions?.map((suggestion) => (
                <FollowSuggestionItem key={suggestion.id} suggestion={suggestion} />
              ))}
            </ScrollView>

            <AnimatePresence>
              {recentSearches.length !== 0 && (
                <MotiView
                  key="recent-searches"
                  from={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "timing", duration: 200 }}
                >
                  <Typography variant="h3" cls="mt-8 md:mt-10 lg:mt-12 mb-3 md:mb-4 lg:mb-5">
                    Recent searches
                  </Typography>
                  {recentSearches.map((user) => (
                    <UserSearchListItem key={user.id} user={user} isRecentSearch onDeleteSearch={handleDeleteSearch} />
                  ))}
                </MotiView>
              )}
            </AnimatePresence>
          </MotiView>
        )}

        {isLoading && searchResults.length === 0 && (
          <MotiView
            key="search-results-loading"
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "timing", duration: 200 }}
          >
            <Typography variant="h3" cls="mt-8 md:mt-10 lg:mt-12 mb-3 md:mb-4 lg:mb-5">
              Stars to follow
            </Typography>
            {Array.from(Array(6).keys()).map((i) => (
              <UserSearchListItem key={i} />
            ))}
          </MotiView>
        )}

        {!isLoading && searchResults.length !== 0 && (
          <MotiView
            key="search-results"
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "timing", duration: 200 }}
          >
            <Typography variant="h3" cls="mt-8 md:mt-10 lg:mt-12 mb-3 md:mb-4 lg:mb-5">
              Stars to follow
            </Typography>
            {searchResults.map((user) => (
              <UserSearchListItem key={user.id} user={user} onPressUser={handleAddRecentSearch} />
            ))}
          </MotiView>
        )}

        {!isLoading && searchResults.length === 0 && debouncedSearchText.length > 1 && (
          <MotiView
            key="no-results"
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "timing", duration: 200 }}
          >
            <View className={cn("flex flex-col items-center justify-center p-6 md:p-8 lg:p-12", Platform.OS === "android" && "py-0")}>
              {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any */}
              <Image source={subscribeLogo as any} style={{ width: isMobile ? 160 : isTablet ? 180 : 200, height: isMobile ? 160 : isTablet ? 180 : 200, opacity: 0.6 }} contentFit="contain" />
              <Typography variant="h2" fontWeight="bold" cls="text-center mt-6 md:mt-8 lg:mt-10">
                No results yet
              </Typography>
              <Typography variant="p" fontWeight="regular" cls="text-center mt-2 md:mt-3 lg:mt-4 mb-10 md:mb-12 lg:mb-14">
                Unfortunately, no accounts exist with that name. We are working to onboard stars to the app so check back soon to see who
                has arrived!
              </Typography>
            </View>
          </MotiView>
        )}
      </AnimatePresence>
    </MainLayout>
  );
};

export default SearchPage;
