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
import type { INTEREST } from "@/utils/models";
import FollowSuggestionItem from "@/components/follow-suggestion-item";
import InterestsFilterPanel from "@/components/interests-filter-panel";
import MainLayout from "@/components/main-layout";
import Input from "@/components/ui/input";
import Typography from "@/components/ui/typography";
import UserSearchListItem from "@/components/user-search-list-item";
import StartrackerIcon from "@/assets/startracker_icon.svg";

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

  return (
    <MainLayout showBackButton contentType="scrollable">
      <Input placeholder="Search..." autoFocus value={searchText} onChangeText={setSearchText} />

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
            <Typography variant="h3" cls="mt-8 text-base mb-3">
              Suggestions
            </Typography>
            <ScrollView horizontal className="-mx-6" showsHorizontalScrollIndicator={false}>
              <View className="w-6" />
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
                  <Typography variant="h3" cls="mt-8 text-base mt-8ske mb-3">
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
            <Typography variant="h3" cls="mt-8 text-base mb-3">
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
            <Typography variant="h3" cls="mt-8 text-base mb-3">
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
            <View className={cn("flex flex-col items-center justify-center p-6", Platform.OS === "android" && "py-0")}>
              <StartrackerIcon className="opacity-60" width={160} height={160} />
              <Typography variant="h2" fontWeight="bold" cls="text-center mt-6">
                No results yet
              </Typography>
              <Typography variant="p" fontWeight="regular" cls="text-center text-lg mt-2 mb-10">
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
