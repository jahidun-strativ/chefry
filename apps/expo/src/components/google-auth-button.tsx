import type { FC } from "react";
import { Text } from "react-native";

import { maxFontSizeMultiplier } from "@/utils/constants";
import { Image } from "@/components/image";
import googleLogo from "@/assets/google_logo.png";
import useOAuthSignIn from "@/hooks/useOAuthSignIn";
import { Button } from "./ui/button";

const GoogleAuthButton: FC = () => {
  const { signIn, isLoading } = useOAuthSignIn("oauth_google");

  return (
    <Button disabled={isLoading} onPress={signIn} cls="mt-4" variant="white">
      <Image source={googleLogo as string} className="mr-1.5 h-[20px] w-[20px]" />
      <Text style={{ fontFamily: "Inter_400Regular" }} className="ml-1 text-lg text-black" maxFontSizeMultiplier={maxFontSizeMultiplier}>
        Continue with Google
      </Text>
    </Button>
  );
};

export default GoogleAuthButton;
