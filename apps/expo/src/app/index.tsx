import React from "react";
import { View } from "moti";

import GradientBackground from "@/components/gradient-background";
import Spinner from "@/components/ui/spinner";

const Index = () => {
  return (
    <GradientBackground>
      <View className="flex h-full w-full items-center justify-center">
        <Spinner size={32} />
      </View>
    </GradientBackground>
  );
};

export default Index;
