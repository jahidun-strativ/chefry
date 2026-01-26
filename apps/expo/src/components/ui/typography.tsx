import type { FC, PropsWithChildren } from "react";
import type { TextProps } from "react-native";
import { Text } from "react-native";
import clsx from "clsx";

import { maxFontSizeMultiplier } from "@/utils/constants";

interface Props extends PropsWithChildren, TextProps {
  variant?: "h1" | "h2" | "h3" | "p";
  fontWeight?: "bold" | "medium" | "regular";
  cls?: string;
}

const Typography: FC<Props> = ({ children, fontWeight, variant = "p", cls, style = {}, ...props }) => {
  const variantClass = clsx(
    variant === "h1" && "text-5xl text-white",
    variant === "h2" && "text-2xl text-white",
    variant === "h3" && "text-sm text-white",
    variant === "p" && "text-base text-white",
  );

  let fontFamily = clsx(
    variant === "h1" && "Inter_500Medium",
    variant === "h2" && "Inter_500Medium",
    variant === "h3" && "Inter_600SemiBold",
    variant === "p" && "Inter_400Regular",
  );

  if (fontWeight) {
    fontFamily = clsx(
      fontWeight === "bold" && "Inter_600SemiBold",
      fontWeight === "medium" && "Inter_500Medium",
      fontWeight === "regular" && "Inter_400Regular",
    );
  }

  return (
    <Text {...props} style={[{ fontFamily }, style]} className={clsx(variantClass, cls)} maxFontSizeMultiplier={maxFontSizeMultiplier}>
      {children}
    </Text>
  );
};

export default Typography;
