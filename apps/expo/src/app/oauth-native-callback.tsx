import React, { useEffect } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { useClerk } from "@clerk/clerk-expo";
import * as WebBrowser from "expo-web-browser";

import GradientBackground from "@/components/gradient-background";
import { Logo } from "@/components/logo";
import createToast from "@/utils/createToast";

const OauthCallbackPage = () => {
  const router = useRouter();
  const clerk = useClerk();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Complete the OAuth session
        WebBrowser.maybeCompleteAuthSession();
        
        // Handle the redirect callback with current URL
        if (typeof window !== "undefined") {
          const currentUrl = window.location.href;
          await clerk.handleRedirectCallback({
            redirectUrl: currentUrl,
          });
        }
        
        console.log("OAuth callback handled successfully");
        
        // Redirect to home after successful authentication
        setTimeout(() => {
          router.replace("/");
        }, 1500);
        
      } catch (error) {
        console.error("OAuth callback error:", error);
        createToast({
          message: "Authentication failed. Please try again.",
          type: "error",
        });
        
        // Redirect back to sign-in on error
        setTimeout(() => {
          router.replace("/sign-in");
        }, 2000);
      }
    };

    void handleOAuthCallback();
  }, [router, clerk]);

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
