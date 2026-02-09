import type { FC } from "react";
import { Platform, View } from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import Icon from "@expo/vector-icons/Octicons";

import AppleAuthButton from "@/components/apple-auth-button";
import FullPageLoadingOverlay from "@/components/full-page-loading-overlay";
import GoogleAuthButton from "@/components/google-auth-button";
import MainLayout from "@/components/main-layout";
import { Button } from "@/components/ui/button";

const Signup: FC = () => {
  const { isSignedIn } = useAuth();

  return (
    <MainLayout title="Create account" showBackButton contentType="scrollable">
      <View className="flex h-full w-full flex-col max-w-md lg:max-w-lg mx-auto">
        <Button
          cls="mt-4 md:mt-5 lg:mt-6"
          variant="gradient"
          href="/create-account-with-email"
          icon={<Icon name="mail" size={24} color="white" style={{ marginRight: 10 }} />}
        >
          Continue with email
        </Button>
        {Platform.OS === "ios" && <AppleAuthButton />}
        <GoogleAuthButton />
        {/* <FacebookAuthButton /> */}
      </View>

      <FullPageLoadingOverlay isLoading={!!isSignedIn} />
    </MainLayout>
  );
};

export default Signup;
