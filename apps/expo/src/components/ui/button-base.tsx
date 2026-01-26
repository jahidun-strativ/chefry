import { forwardRef } from "react";
import type { GestureResponderEvent, PressableProps, View } from "react-native";
import { Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import { cssInterop } from "nativewind";

// const ButtonBase: FC<PressableProps & { cls?: string }> = ({ children, cls, onPress, ...props }) => {
const ButtonBase = forwardRef<View, PressableProps & { cls?: string }>(({ children, cls, onPress, ...props }, ref) => {
  const handlePress = (e: GestureResponderEvent) => {
    if (!props.disabled) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (onPress && !props.disabled) {
      onPress(e);
    }
  };

  return (
    <Pressable {...props} className={cls} onPress={handlePress} ref={ref}>
      {children}
    </Pressable>
  );
});

ButtonBase.displayName = "ButtonBase";

// export default ButtonBase;
export default cssInterop(ButtonBase, {
  className: {
    target: "style",
  },
});
