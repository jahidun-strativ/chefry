/* eslint-disable jsx-a11y/no-autofocus */
import type { FC } from "react";
import { useState } from "react";
import type { NativeSyntheticEvent, TextInputChangeEventData } from "react-native";
import { View } from "react-native";
import { isClerkAPIResponseError, useSignUp } from "@clerk/clerk-expo";
import Icon from "@expo/vector-icons/Feather";
import { AnimatePresence, MotiView } from "moti";

import createToast from "@/utils/createToast";
import MainLayout from "@/components/main-layout";
import { PasswordInput } from "@/components/password-input";
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
import Typography from "@/components/ui/typography";

const CreateAccoutWithEmailPage: FC = () => {
  const { isLoaded, signUp, setActive } = useSignUp();

  const [signupData, setSignupData] = useState<{
    username: string;
    email: string;
    password: string;
    repeatedPassword: string;
  }>({ username: "", email: "", password: "", repeatedPassword: "" });

  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  const handleChangeSignUpData =
    (field: "username" | "email" | "password" | "repeatedPassword") => (e: NativeSyntheticEvent<TextInputChangeEventData>) => {
      setSignupData({ ...signupData, [field]: e.nativeEvent.text });
    };

  const [isLoading, setIsLoading] = useState(false);
  const handleCreateAccount = async () => {
    if (!isLoaded) return;

    if (signupData.password !== signupData.repeatedPassword) {
      createToast({
        type: "error",
        message: "The passwords do not match",
      });
      return;
    }

    if (!/^[a-z0-9_-]+$/.test(signupData.username)) {
      createToast({
        type: "error",
        message: "Username can only contain lowercase (a-z) letters, numbers, underscores (_) and hyphens (-)",
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

      setIsLoading(false);
      setPendingVerification(true);
    } catch (err) {
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

      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!isLoaded) {
      return;
    }

    setIsLoading(true);
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      await setActive({ session: completeSignUp.createdSessionId });

      setTimeout(() => setIsLoading(false), 2000);
    } catch (err) {
      console.error(err);
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
      setIsLoading(false);
    }
  };

  return (
    <MainLayout
      title={pendingVerification ? "Enter your verification code" : "Create account with email"}
      description={
        pendingVerification
          ? `Enter the verification code that we've sent to ${signupData.email}.`
          : "Fill in the fields below to create your account. The password must be more than eight characters long. Username can only contain the letters a-z, numbers and '_' or '-'."
      }
      showBackButton
      contentType="scrollable"
    >
      <View className="h-4" />
      <AnimatePresence exitBeforeEnter initial={true}>
        {!pendingVerification && (
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex w-full flex-col" key="signup">
            <Input
              placeholder="Enter your username"
              autoCorrect={false}
              classes={{ root: "mt-4" }}
              onChange={handleChangeSignUpData("username")}
              autoCapitalize="none"
              value={signupData.username}
            />

            <View className="mt-2 flex flex-row items-center rounded-2xl border border-yellow-300 bg-black/20 p-4">
              <Icon color="rgb(253 224 71)" name="info" size={32} />
              <View className="ml-4 flex-1">
                <Typography cls="text-sm" variant="p">
                  Please use your actual name so users can find you easier.
                </Typography>
              </View>
            </View>

            <Input
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCorrect={false}
              autoCapitalize="none"
              classes={{ root: "mt-4" }}
              onChange={handleChangeSignUpData("email")}
              value={signupData.email}
            />
            <PasswordInput
              placeholder="Create a password"
              secureTextEntry={true}
              classes={{ root: "mt-4" }}
              autoCapitalize="none"
              onChange={handleChangeSignUpData("password")}
              value={signupData.password}
            />
            <PasswordInput
              placeholder="Repeat the password"
              secureTextEntry={true}
              classes={{ root: "mt-4" }}
              autoCapitalize="none"
              onChange={handleChangeSignUpData("repeatedPassword")}
              value={signupData.repeatedPassword}
            />

            <Button
              cls="mt-4"
              variant="gradient"
              disabled={isLoading || !signupData.email || !signupData.username || !signupData.password || !signupData.repeatedPassword}
              onPress={handleCreateAccount}
              isLoading={isLoading}
            >
              Create account
            </Button>
          </MotiView>
        )}
        {pendingVerification && (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4 flex flex-col items-center justify-center"
            key="verification"
          >
            <Input
              placeholder="Enter verification code"
              value={verificationCode}
              onChangeText={setVerificationCode}
              keyboardType="number-pad"
              autoFocus
              classes={{ root: "w-full", input: "text-center" }}
            />
            <Button cls="mt-6" variant="gradient" disabled={isLoading || !verificationCode} onPress={handleVerify} isLoading={isLoading}>
              Verify account
            </Button>
          </MotiView>
        )}
      </AnimatePresence>
    </MainLayout>
  );
};

export default CreateAccoutWithEmailPage;
