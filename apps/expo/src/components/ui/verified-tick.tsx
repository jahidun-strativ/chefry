import type { FC } from "react";
import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "@expo/vector-icons/Feather";

import { cn } from "@/utils/cn";

interface Props {
  cls?: string;
}

const VerifiedTick: FC<Props> = ({ cls }) => {
  return (
    <View className={cn("h-5 w-5 rounded-full bg-white p-[1px]", cls)}>
      <LinearGradient
        colors={["#938DFB", "#9589F6", "#9B7FEA", "#A56ED5", "#B457B8", "#C73993", "#DD1465", "#EB004C"]}
        start={[0.0, 0.5]}
        end={[1.0, 0.5]}
        className="flex h-full w-full items-center justify-center rounded-full"
      >
        <Icon name="check" color="white" size={12} />
      </LinearGradient>
    </View>
  );
};

export default VerifiedTick;
