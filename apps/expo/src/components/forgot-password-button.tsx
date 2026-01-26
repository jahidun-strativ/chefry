import type { FC } from "react";
import { useState } from "react";
import { View } from "react-native";
import { isClerkAPIResponseError, useSignIn } from "@clerk/clerk-expo";
import { z } from "zod";

import createToast from "@/utils/createToast";
import useOpenState from "@/hooks/useOpenState";
import { PasswordInput } from "./password-input";
import BottomSheet from "./ui/bottom-sheet";
import { Button } from "./ui/button";
import Input from "./ui/input";
import Typography from "./ui/typography";

export const ForgotPasswordButton: FC = () => {
  const { signIn, setActive } = useSignIn();

  const [email, setEmail] = useState("");
  const [successfulCreation, setSuccessfulCreation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleResetPassword = async () => {
    const emailSchema = z.object({
      email: z.string().email(),
    });

    try {
      emailSchema.parse({ email });
    } catch (e) {
      createToast({ message: "Invalid email", type: "error" });
      return;
    }

    setIsLoading(true);
    await signIn
      ?.create({
        strategy: "reset_password_email_code",
        identifier: email,
      })
      .then((_) => {
        createToast({ message: "Success! Check your email.", type: "success" });
        setIsLoading(false);
        setSuccessfulCreation(true);
      })
      .catch((err) => {
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
      });
  };

  const [bottomSheetOpen, openBottomSheet, closeBottomSheet] = useOpenState();

  const [resetPasswordData, setResetPasswordData] = useState<{
    password: string;
    repeatedPassword: string;
    code: string;
  }>({ password: "", repeatedPassword: "", code: "" });

  const handleChangeResetPasswordData = (field: "code" | "password" | "repeatedPassword") => (value: string) => {
    setResetPasswordData({ ...resetPasswordData, [field]: value });
  };

  const [complete, setComplete] = useState(false);
  const [secondFactor, setSecondFactor] = useState(false);

  const handleCompletePasswordReset = async () => {
    if (resetPasswordData.password !== resetPasswordData.repeatedPassword) {
      createToast({
        type: "error",
        message: "The passwords do not match",
      });
      return;
    }

    setIsLoading(true);
    await signIn
      ?.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: resetPasswordData.code,
        password: resetPasswordData.password,
      })
      .then(async (result) => {
        if (result.status === "needs_second_factor") {
          setSecondFactor(true);
        } else if (result.status === "complete") {
          await setActive({ session: result.createdSessionId });
          setComplete(true);
        } else {
          console.error(result);
        }
        setIsLoading(false);
      })
      .catch((err) => {
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
      });
  };

  return (
    <>
      <Button cls="border-none px-3" size="xs" onPress={openBottomSheet}>
        Forgot password?
      </Button>
      <BottomSheet open={bottomSheetOpen} onClose={closeBottomSheet}>
        {!successfulCreation && (
          <>
            <Typography cls="text-center mb-2 text-lg" fontWeight="bold">
              Forgot password?
            </Typography>

            <Typography cls="text-center mb-3">
              Enter your email address and we will send you a code from which you can reset your password.
            </Typography>

            <Input
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCorrect={false}
              autoCapitalize="none"
              classes={{ root: "mt-4" }}
              onChangeText={setEmail}
              value={email}
              bottomSheetInput
            />

            <Button
              onPress={handleResetPassword}
              disabled={!email || isLoading}
              variant="gradient"
              cls="mt-4"
              size="sm"
              isLoading={isLoading}
            >
              Reset password
            </Button>
          </>
        )}

        {successfulCreation && !complete && !secondFactor && (
          <>
            <Typography cls="text-center mb-2 text-lg" fontWeight="bold">
              Create new password
            </Typography>

            <Typography cls="text-center mb-3">Enter the code you received in your email and create a new password.</Typography>

            <Input
              placeholder="Enter verification code"
              value={resetPasswordData.code}
              onChangeText={handleChangeResetPasswordData("code")}
              keyboardType="number-pad"
              bottomSheetInput
            />

            <PasswordInput
              placeholder="Create a new password"
              classes={{ root: "mt-4" }}
              autoCapitalize="none"
              onChangeText={handleChangeResetPasswordData("password")}
              value={resetPasswordData.password}
              bottomSheetInput
            />

            <PasswordInput
              placeholder="Repeat the password"
              classes={{ root: "mt-4" }}
              autoCapitalize="none"
              onChangeText={handleChangeResetPasswordData("repeatedPassword")}
              value={resetPasswordData.repeatedPassword}
              bottomSheetInput
            />

            <Button
              onPress={handleCompletePasswordReset}
              disabled={!resetPasswordData.code || !resetPasswordData.password || !resetPasswordData.repeatedPassword || isLoading}
              variant="gradient"
              cls="mt-4"
              size="sm"
              isLoading={isLoading}
            >
              Create new password
            </Button>
          </>
        )}

        {complete && (
          <>
            <Typography cls="text-center mb-2 text-lg" fontWeight="bold">
              Success!
            </Typography>

            <Typography cls="text-center mb-3">You have successfully reset your password.</Typography>

            <Button onPress={closeBottomSheet} variant="gradient" cls="mt-4" size="sm">
              Close
            </Button>
          </>
        )}

        {secondFactor && (
          <>
            <Typography cls="text-center mb-2 text-lg" fontWeight="bold">
              2FA required
            </Typography>

            <Typography cls="text-center mb-3">2FA is required, this UI does not handle that.</Typography>

            <Button onPress={closeBottomSheet} variant="gradient" cls="mt-4" size="sm">
              Close
            </Button>
          </>
        )}

        <View className="h-4" />
      </BottomSheet>
    </>
  );
};
