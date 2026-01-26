import { Image as ExpoImage } from "expo-image";
import { MotiPressable } from "moti/interactions";
import { cssInterop } from "nativewind";

export const AnimatedPressable = cssInterop(MotiPressable, {
  className: {
    target: "style",
  },
});
