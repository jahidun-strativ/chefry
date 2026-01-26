import type { ComponentProps, FC, ReactNode } from "react";
import { Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import { Link } from "expo-router";
import Icon from "@expo/vector-icons/Feather";
import clsx from "clsx";

interface Props {
  cls?: string;
  iconName?: ComponentProps<typeof Icon>["name"];
  icon?: ReactNode;
  iconColor?: string;
  size?: "xs" | "sm" | "base" | "lg";
  href?: string;
  onPress?: () => void;
}

const IconButton: FC<Props> = ({ cls, iconName, icon, href, onPress, size = "base", iconColor = "white" }) => {
  const sizeClass = clsx(
    size === "xs" && "h-6 w-6",
    size === "sm" && "h-8 w-8",
    size === "base" && "h-10 w-10",
    size === "lg" && "h-12 w-12",
  );

  const iconSize = size === "xs" ? 14 : size === "sm" ? 16 : size === "base" ? 20 : size === "lg" ? 24 : 20;

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onPress) {
      onPress();
    }
  };

  const button = (
    <Pressable onPress={handlePress} className={clsx("flex items-center justify-center rounded-full", sizeClass, cls)}>
      {iconName && <Icon name={iconName} size={iconSize + 6} color={iconColor} />}
      {icon}
    </Pressable>
  );

  if (href) {
    return (
      <Link asChild href={href}>
        {button}
      </Link>
    );
  }

  return (
    <Pressable onPress={handlePress} className={clsx("flex items-center justify-center rounded-full", sizeClass, cls)}>
      {iconName && <Icon name={iconName} size={iconSize + 6} color={iconColor} />}
      {icon}
    </Pressable>
  );
};

export default IconButton;
