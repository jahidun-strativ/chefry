import type { FC } from "react";
import { View } from "react-native";
import MaterialIcon from "@expo/vector-icons/MaterialCommunityIcons";

import { cn } from "@/utils/cn";
import { useResponsive } from "@/hooks/useResponsive";
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
});

interface Props {
  tag: INTEREST | null;
  onChange: (tags: INTEREST | null) => void;
}

const TagsEditor: FC<Props> = ({ onChange, tag }) => {
  const { isMobile, isTablet } = useResponsive();
  const iconSize = isMobile ? 12 : isTablet ? 14 : 16;
  
  const handleSelectInterest = (interest: INTEREST) => () => {
    const isSelected = tag === interest;
    if (isSelected) {
      onChange(null);
    } else {
      onChange(interest);
    }
  };

  return (
    <View className="mt-2 md:mt-3 lg:mt-4 flex flex-col items-center justify-center pb-20 md:pb-24 lg:pb-28 w-full">
      <Typography cls="text-center text-sm md:text-base lg:text-lg mb-2 md:mb-3 lg:mb-4" variant="h3">
        Tags
      </Typography>
      <View className="flex flex-row flex-wrap items-center justify-center gap-2 md:gap-3 lg:gap-4 px-2 md:px-4 lg:px-6 pt-2 md:pt-3 lg:pt-4">
        {interests.map((interest) => {
          const isSelected = tag === interest.id;
          return (
            <ButtonBase
              onPress={handleSelectInterest(interest.id as INTEREST)}
              key={interest.id}
              cls={cn("flex flex-row items-center rounded-full border border-white", isSelected && "bg-white", isMobile ? "px-3 py-1.5" : isTablet ? "px-4 py-2" : "px-5 py-2.5")}
            >
              <MaterialIcon name="heart" size={iconSize} color={isSelected ? "black" : "white"} />
              <Typography cls={cn("ml-2 md:ml-2.5 lg:ml-3 text-xs md:text-sm lg:text-md", isSelected ? "!text-black" : "!text-white")}>{interest.name}</Typography>
            </ButtonBase>
          );
        })}
      </View>
    </View>
  );
};

export default TagsEditor;
