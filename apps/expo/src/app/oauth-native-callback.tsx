import React from "react";
import { View } from "react-native";

import GradientBackground from "@/components/gradient-background";
import { Logo } from "@/components/logo";

const OauthCallbackPage = () => {
  return (
    <GradientBackground>
      <View className="flex h-full w-full items-center justify-center">
        <Logo width={200} height={60} />
      </View>
    </GradientBackground>
  );
};

export default OauthCallbackPage;
