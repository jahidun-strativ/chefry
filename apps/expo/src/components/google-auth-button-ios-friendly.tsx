import type { FC } from "react";
import { Text, Platform } from "react-native";

import { maxFontSizeMultiplier } from "@/utils/constants";
import { Image } from "@/components/image";
import googleLogo from "@/assets/google_logo.png";
import useOAuthSignIn from "@/hooks/useOAuthSignIn";
import { Button } from "./ui/button";

const GoogleAuthButtonIOSFriendly: FC = () => {
  const { signIn, isLoading } = useOAuthSignIn("oauth_google");

  const handlePress = async () => {
    // For iOS web, we need to ensure the action happens immediately
    // in the same call stack as the user interaction
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIOSWeb = /iphone|ipad|ipod/.test(userAgent);
      
      if (isIOSWeb) {
        // For iOS, immediately redirect to avoid popup blocking
        try {
          await signIn();
        } catch (error) {
          console.error("iOS OAuth error:", error);
          // Fallback: direct redirect to Google OAuth
          const redirectUrl = encodeURIComponent(window.location.origin + "/oauth-native-callback");
          const googleOAuthUrl = `https://accounts.google.com/oauth/authorize?client_id=${process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}&redirect_uri=${redirectUrl}&response_type=code&scope=openid%20email%20profile`;
          window.location.href = googleOAuthUrl;
        }
      } else {
        await signIn();
      }
    } else {
      await signIn();
    }
  };

  return (
    <Button disabled={isLoading} onPress={handlePress} cls="mt-4" variant="white">
      <Image source={googleLogo as string} className="mr-1.5 h-[20px] w-[20px]" />
      <Text style={{ fontFamily: "Inter_400Regular" }} className="ml-1 text-lg text-black" maxFontSizeMultiplier={maxFontSizeMultiplier}>
        Continue with Google
      </Text>
    </Button>
  );
};

export default GoogleAuthButtonIOSFriendly;