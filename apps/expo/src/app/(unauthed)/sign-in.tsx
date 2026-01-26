import type { FC } from "react";
import { Platform, View } from "react-native";
import { useAuth } from "@clerk/clerk-expo";

import AppleAuthButton from "@/components/apple-auth-button";
import { ForgotPasswordButton } from "@/components/forgot-password-button";
import FullPageLoadingOverlay from "@/components/full-page-loading-overlay";
import GoogleAuthButton from "@/components/google-auth-button";
import MainLayout from "@/components/main-layout";
import SignInForm from "@/components/sign-in-form";
import Typography from "@/components/ui/typography";

const SignInPage: FC = () => {
  const { isSignedIn } = useAuth();

  return (
    <MainLayout title="Log in" contentType="scrollable" showBackButton>
      <SignInForm />
      <ForgotPasswordButton />

      <View className="my-4 flex flex-row items-center">
        <View className="h-px flex-1 bg-white opacity-50" />
        <Typography variant="h3" cls="px-4 text-lg">
          Or
        </Typography>
        <View className="h-px flex-1 bg-white opacity-50" />
      </View>
      {Platform.OS === "ios" && <AppleAuthButton />}
      <GoogleAuthButton />
      {/* <FacebookAuthButton /> */}

      <FullPageLoadingOverlay isLoading={!!isSignedIn} />
    </MainLayout>
  );
};

export default SignInPage;
