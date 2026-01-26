import type { FC } from "react";
import { memo, useMemo } from "react";
import { View } from "react-native";
import MaterialIcon from "@expo/vector-icons/MaterialCommunityIcons";
import { FlashList } from "@shopify/flash-list";

import { api } from "@/utils/api";
import { cn } from "@/utils/cn";
import type { INTEREST } from "@/utils/models";
import { INTERESTS } from "@/utils/models";
import ButtonBase from "./ui/button-base";
import Typography from "./ui/typography";

const interests = INTERESTS.map((interest) => {
  let name = interest.replace("_", " ");
  name = name.toLowerCase();
  name = name.charAt(0).toUpperCase() + name.slice(1);

  return {
    id: interest as string,
    name,
  };
}); // .unshift("ALL") as unknown as string[];

interests.unshift({
  id: "ALL",
  name: "All",
});

interface Props {
  interestsFilter: INTEREST[] | "ALL";
  useStartPadding?: boolean;
  setInterestsFilter: (filter: INTEREST[] | "ALL") => void;
}

const InterestsFilterPanel: FC<Props> = ({ interestsFilter, useStartPadding, setInterestsFilter }) => {
  const { data: me } = api.auth.user.me.useQuery();

  const handleSelectInterest = (interest: INTEREST | "ALL") => () => {
    if (interest === "ALL") {
      setInterestsFilter("ALL");
    } else {
      if (interestsFilter === "ALL") {
        setInterestsFilter([interest]);
      } else {
        let newFilters = [...interestsFilter];
        if (interestsFilter.includes(interest)) {
          newFilters = newFilters.filter((i) => i !== interest);
        } else {
          newFilters = [...newFilters, interest];
        }

        setInterestsFilter(newFilters.length === 0 ? "ALL" : newFilters);
      }
    }
  };

  const sortedInterests = useMemo(() => {
    const sortedInterests = [...interests];
    sortedInterests.sort((a, b) => {
      // Sort so that "ALL" is always first, then sort by me.interests
      if (a.id === "ALL") {
        return -1;
      } else if (b.id === "ALL") {
        return 1;
      } else {
        if (me?.interests.includes(a.id as INTEREST) && !me?.interests.includes(b.id as INTEREST)) {
          return -1;
        } else if (!me?.interests.includes(a.id as INTEREST) && me?.interests.includes(b.id as INTEREST)) {
          return 1;
        } else {
          return 0;
        }
      }
    });
    return sortedInterests;
  }, [me]);

  return (
    <View className="w-full pb-2 pt-5">
      <FlashList
        horizontal
        key="filter"
        estimatedItemSize={100}
        ListHeaderComponent={useStartPadding ? <View className="w-2" /> : undefined}
        ListFooterComponent={<View className="w-12" />}
        showsHorizontalScrollIndicator={false}
        data={sortedInterests}
        renderItem={({ item, extraData }) => {
          const { interestsFilter } = extraData as { interestsFilter: INTEREST[] | "ALL" };
          const isSelected = interestsFilter === "ALL" ? item.id === "ALL" : interestsFilter.includes(item.id as INTEREST);
          return (
            <ButtonBase
              onPress={handleSelectInterest(item.id as INTEREST | "ALL")}
              key={item.id}
              cls={cn("ml-2 flex h-10 flex-row items-center rounded-full border border-white px-3", isSelected && "bg-white")}
            >
              <MaterialIcon name="heart" size={16} color={isSelected ? "black" : "white"} />
              <Typography cls={cn("text-2xl ml-2 text-base", isSelected ? "!text-black" : "!text-white")}>{item.name}</Typography>
            </ButtonBase>
          );
        }}
        extraData={{ interestsFilter }}
      />
    </View>
  );
};

export default memo(InterestsFilterPanel);
