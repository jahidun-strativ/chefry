import type { FC } from "react";
import { View } from "react-native";
import MaterialIcon from "@expo/vector-icons/MaterialCommunityIcons";

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
});

interface Props {
  tag: INTEREST | null;
  onChange: (tags: INTEREST | null) => void;
}

const TagsEditor: FC<Props> = ({ onChange, tag }) => {
  const handleSelectInterest = (interest: INTEREST) => () => {
    const isSelected = tag === interest;
    if (isSelected) {
      onChange(null);
    } else {
      onChange(interest);
    }
  };

  return (
    <View className="mt-6 md:mt-8 lg:mt-10 flex flex-col items-center justify-center pb-32 max-w-2xl lg:max-w-3xl mx-auto w-full">
      <Typography cls="text-center" variant="h3">
        Tags
      </Typography>
      <View className="flex flex-row flex-wrap items-center justify-center gap-2 md:gap-3 lg:gap-4 px-4 md:px-6 lg:px-8 pt-6 md:pt-8 lg:pt-10">
        {interests.map((interest) => {
          const isSelected = tag === interest.id;
          return (
            <ButtonBase
              onPress={handleSelectInterest(interest.id as INTEREST)}
              key={interest.id}
              cls={cn("ml-2 md:ml-3 lg:ml-4 flex flex-row items-center rounded-full border border-white px-4 md:px-5 lg:px-6 py-1 md:py-1.5 lg:py-2", isSelected && "bg-white")}
            >
              <MaterialIcon name="heart" size={16} color={isSelected ? "black" : "white"} />
              <Typography cls={cn("text-2xl ml-2 md:ml-3 lg:ml-4 text-base md:text-lg lg:text-xl", isSelected ? "!text-black" : "!text-white")}>{interest.name}</Typography>
            </ButtonBase>
          );
        })}
      </View>
    </View>
  );
};

export default TagsEditor;
