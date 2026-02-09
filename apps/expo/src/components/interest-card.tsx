import type { FC } from "react";
import { Pressable, View } from "react-native";
import Icon from "@expo/vector-icons/Ionicons";

import { cn } from "@/utils/cn";
import type { INTEREST } from "@/utils/models";
import { interestsMap } from "@/utils/models";
import { Image } from "./image";
import BlurView from "./ui/blur-view";
import Typography from "./ui/typography";

interface Props {
  interest: INTEREST;
  isSelected: boolean;
  onToggleSelect: (interest: INTEREST) => void;
}

const InterestCard: FC<Props> = ({ interest, isSelected, onToggleSelect }) => {
  return (
    <Pressable className="flex h-48 w-full overflow-hidden rounded-xl" onPress={() => onToggleSelect(interest)}>
      <Image source={interestsMap[interest]?.img} className="absolute z-0 h-48 w-full" contentFit="cover" />
      <View className="z-1 absolute flex h-48 w-full flex-col justify-between p-2">
        <View className="flex flex-row justify-end">
          <View className="overflow-hidden rounded-full border border-[#938DFB] bg-black/30">
            <BlurView intensity={20} cls={cn("flex flex-row items-center px-3 py-1.5")}>
              <Icon name="heart" size={16} color={isSelected ? "red" : "white"} />
              <Typography variant="h2" cls="text-xs md:text-sm lg:text-md ml-2">
                {interestsMap[interest]?.label}
              </Typography>
            </BlurView>
          </View>
        </View>
        <View className="rounded-lg bg-[#2C2C2C] p-2">
          <Typography variant="p" cls="text-xs md:text-sm lg:text-md">
            {interestsMap[interest]?.description}
          </Typography>
        </View>
      </View>
    </Pressable>
  );
};

export default InterestCard;
