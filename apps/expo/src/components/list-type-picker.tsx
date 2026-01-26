import type { FC } from "react";
import { useEffect } from "react";
import { View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import Icon from "@expo/vector-icons/Feather";

import ButtonBase from "./ui/button-base";

interface Props {
  value: "grid" | "list";
  onChange: (value: "grid" | "list") => void;
}

const ListTypePicker: FC<Props> = ({ value, onChange }) => {
  const inidicatorPosition = useSharedValue(0);

  useEffect(() => {
    inidicatorPosition.value = withSpring(value === "grid" ? 0 : 56, { stiffness: 300, damping: 24 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: inidicatorPosition.value }],
    };
  });

  return (
    <View className="relative flex h-14 w-28 flex-row rounded-full border border-white">
      <Animated.View style={animatedStyles} className="absolute left-0 h-full w-14 rounded-full bg-white" />

      <ButtonBase onPress={() => onChange("grid")} className="flex h-full w-14 items-center justify-center">
        <Icon name="grid" color={value === "grid" ? "black" : "white"} size={20} />
      </ButtonBase>

      <ButtonBase onPress={() => onChange("list")} className="flex h-full w-14 items-center justify-center">
        <Icon name="square" color={value === "list" ? "black" : "white"} size={20} />
      </ButtonBase>
    </View>
  );
};

export default ListTypePicker;
