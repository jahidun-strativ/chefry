import type { FC } from "react";
import { useState } from "react";
import type { NativeSyntheticEvent, TextInputChangeEventData } from "react-native";
import { View } from "react-native";
import { useSignUp } from "@clerk/clerk-expo";

import createToast from "@/utils/createToast";
import { PasswordInput } from "./password-input";
import { Button } from "./ui/button";
import Input from "./ui/input";

const CreateAccountForm: FC = () => {
  const { isLoaded, signUp, setActive } = useSignUp();

  const [signupData, setSignupData] = useState<{
    username: string;
    email: string;
    password: string;
    repeatedPassword: string;
  }>({ username: "", email: "", password: "", repeatedPassword: "" });

  const handleChangeSignUpData =
    (field: "username" | "email" | "password" | "repeatedPassword") => (e: NativeSyntheticEvent<TextInputChangeEventData>) => {
      setSignupData({ ...signupData, [field]: e.nativeEvent.text });
    };

  const [isLoading, setIsLoading] = useState(false);
  const handleCreateAccount = async () => {
    if (signupData.password !== signupData.repeatedPassword) {
      createToast({
        type: "error",
        message: "The passwords do not match",
      });
      return;
    }

    setIsLoading(true);
    try {
      await signUp?.create({
        emailAddress: signupData.email,
        password: signupData.password,
        username: signupData.username,
      });

      await signUp?.prepareEmailAddressVerification({ strategy: "email_code" });

      // if (authRes.error) {
      //   createToast({
      //     type: 'error',
      //     message: t('error'),
      //     description: authRes.error.message,
      //   })
      //   setIsLoading(false)
      //   return
      // }

      // push({ params: { email: signupData.email }, pathname: 'verify-email' })

      setIsLoading(false);
    } catch (e) {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex w-full flex-col max-w-md lg:max-w-lg mx-auto">
      <Input
        placeholder="Enter your username"
        classes={{ root: "mt-4 md:mt-5 lg:mt-6" }}
        autoCorrect={false}
        onChange={handleChangeSignUpData("username")}
        autoCapitalize="none"
        value={signupData.username}
      />
      <Input
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCorrect={false}
        autoCapitalize="none"
        classes={{ root: "mt-4 md:mt-5 lg:mt-6" }}
        onChange={handleChangeSignUpData("email")}
        value={signupData.email}
      />
      <PasswordInput
        placeholder="Create a password"
        classes={{ root: "mt-4 md:mt-5 lg:mt-6" }}
        autoCapitalize="none"
        onChange={handleChangeSignUpData("password")}
        value={signupData.password}
      />
      <PasswordInput
        placeholder="Repeat the password"
        secureTextEntry={true}
        classes={{ root: "mt-4 md:mt-5 lg:mt-6" }}
        autoCapitalize="none"
        onChange={handleChangeSignUpData("repeatedPassword")}
        value={signupData.repeatedPassword}
      />

      <Button
        cls="mt-8 md:mt-10 lg:mt-12"
        variant="gradient"
        disabled={isLoading || !signupData.email || !signupData.username || !signupData.password || !signupData.repeatedPassword}
        onPress={handleCreateAccount}
        isLoading={isLoading}
      >
        Create account
      </Button>
    </View>
  );
};

export default CreateAccountForm;
