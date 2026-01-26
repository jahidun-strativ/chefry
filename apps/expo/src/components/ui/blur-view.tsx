import type { FC, PropsWithChildren } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { Platform, View } from "react-native";
import { BlurView as ExpoBlurView } from "expo-blur";
import clsx from "clsx";

interface Props extends PropsWithChildren {
  cls?: string;
  intensity?: number;
  style?: StyleProp<ViewStyle>;
}

const BlurView: FC<Props> = ({ children, intensity, style, cls }) => {
  if (Platform.OS === "ios") {
    return (
      <ExpoBlurView tint="dark" intensity={intensity || 50} className={cls} style={style}>
        {children}
      </ExpoBlurView>
    );
  } else {
    return (
      <View style={style} className={clsx("bg-black/50", cls)}>
        {children}
      </View>
    );
  }
};

export default BlurView;
