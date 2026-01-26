import type { FC } from "react";
import { useState } from "react";
import { isClerkAPIResponseError, useSignIn } from "@clerk/clerk-expo";
import { View } from "moti";

import createToast from "@/utils/createToast";
import { PasswordInput } from "./password-input";
import { Button } from "./ui/button";
import Input from "./ui/input";

const SignInForm: FC = () => {
  const [emailOrUsername, setEmailOrUserName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { signIn, setActive, isLoaded } = useSignIn();

  const handleSignIn = async () => {
    if (!isLoaded) return;

    setLoading(true);
    try {
      const completeSignIn = await signIn.create({
        identifier: emailOrUsername,
        password,
      });
      await setActive({ session: completeSignIn.createdSessionId });
      setLoading(false);
    } catch (err) {
      Sentry.Native.captureException(err);
      if (isClerkAPIResponseError(err)) {
        createToast({
          message: err.errors[0]?.longMessage ?? "Something went wrong",
          type: "error",
        });
      } else {
        createToast({
          message: "Something went wrong",
          type: "error",
        });
      }

      setLoading(false);
    }
  };

  return (
    <View className="flex flex-col">
      <Input
        classes={{ root: "mt-4" }}
        placeholder="Enter your email or username"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        value={emailOrUsername}
        onChangeText={setEmailOrUserName}
      />
      <PasswordInput classes={{ root: "mt-4" }} placeholder="Enter your password" value={password} onChangeText={setPassword} />
      <Button
        onPress={handleSignIn}
        cls="mt-4 mb-4"
        variant="gradient"
        disabled={!isLoaded || !emailOrUsername || !password || loading}
        isLoading={loading}
      >
        Log in
      </Button>
    </View>
  );
};

export default SignInForm;
