import type { FC, PropsWithChildren } from "react";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

import { cn } from "@/utils/cn";
import GradientBackground from "./gradient-background";

interface Props extends PropsWithChildren {
  isScrollable?: boolean;
  cls?: string;
}

const PageLayout: FC<Props> = ({ children, isScrollable, cls }) => {
  const className = cn("w-screen pt-24 px-6 h-full flex flex-col", cls);

  return (
    <GradientBackground>
      <SafeAreaView className="h-full w-full">
        {!isScrollable && <View className={className}>{children}</View>}
        {isScrollable && <ScrollView className={className}>{children}</ScrollView>}
      </SafeAreaView>
    </GradientBackground>
  );
};

export default PageLayout;
