import type { FC } from "react";
import { Text } from "react-native";

import { maxFontSizeMultiplier } from "@/utils/constants";
import { Image } from "@/components/image";
import facebook_logo from "@/assets/facebook_icon.png";
import useOAuthSignIn from "@/hooks/useOAuthSignIn";
import { Button } from "./ui/button";

const FacebookAuthButton: FC = () => {
  const { signIn, isLoading } = useOAuthSignIn("oauth_facebook");

  return (
    <Button disabled={isLoading} cls="mt-4" variant="white" onPress={signIn}>
      <Image source={facebook_logo as string} className="mr-1.5 h-[20px] w-[20px]" />
      <Text
        style={{ fontFamily: "Inter_400Regular" }}
        className="ml-1 text-lg text-black"
        numberOfLines={1}
        maxFontSizeMultiplier={maxFontSizeMultiplier}
      >
        Continue with Facebook
      </Text>
    </Button>
  );
};

export default FacebookAuthButton;
