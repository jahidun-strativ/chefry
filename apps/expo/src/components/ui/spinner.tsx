import type { FC } from "react";
import { View } from "react-native";
import { MaterialIndicator } from "react-native-indicators";

import { cn } from "@/utils/cn";

interface Props {
  size?: number;
  cls?: string;
}

const Spinner: FC<Props> = ({ size = 16, cls }) => {
  const colorMap = {
    white: "#fff",
  };

  return (
    <View className={cn("flex-none", cls)}>
      <MaterialIndicator size={size} color="white" />
    </View>
  );
};

export default Spinner;
