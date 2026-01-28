import React, { useEffect } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";

import GradientBackground from "@/components/gradient-background";
import { Logo } from "@/components/logo";

const OauthCallbackPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Complete the OAuth session
    WebBrowser.maybeCompleteAuthSession();
    
    // Redirect to home after a short delay
    const timer = setTimeout(() => {
      router.replace("/");
    }, 1500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <GradientBackground>
      <View className="flex h-full w-full items-center justify-center">
        <Logo width={200} height={60} />
        <Text className="mt-4 text-white text-center">
          Completing sign in...
        </Text>
      </View>
    </GradientBackground>
  );
};

export default OauthCallbackPage;
