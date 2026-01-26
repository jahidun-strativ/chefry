import type { FC } from "react";
import { Text, View } from "react-native";

import { maxFontSizeMultiplier } from "@/utils/constants";
import AppleLogo from "@/assets/apple_logo.svg";
import useOAuthSignIn from "@/hooks/useOAuthSignIn";
import { Button } from "./ui/button";

const AppleAuthButton: FC = () => {
  const { signIn, isLoading } = useOAuthSignIn("oauth_apple");

  return (
    <Button disabled={isLoading} onPress={signIn} cls="mt-4" className="" variant="black">
      <View className="-my-4">
        <AppleLogo width={56} height={56} className="-my-3 -mb-2" />
      </View>
      <Text style={{ fontFamily: "Inter_400Regular" }} className="-ml-2 text-lg text-white" maxFontSizeMultiplier={maxFontSizeMultiplier}>
        Continue with Apple
      </Text>
    </Button>
  );
};

export default AppleAuthButton;
