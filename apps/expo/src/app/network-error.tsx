import type { FC } from "react";
import { useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import Icon from "@expo/vector-icons/MaterialIcons";

import { api, getBaseUrl } from "@/utils/api";
import createToast from "@/utils/createToast";
import MainLayout from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import Typography from "@/components/ui/typography";

const NetworkErrorPage: FC = () => {
  const { isLoaded: authIsLoaded, userId, signOut } = useAuth();
  const utils = api.useContext();

  const { replace } = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const handleRetry = async () => {
    if (!authIsLoaded || !userId) return;

    setIsLoading(true);
    try {
      await utils?.auth.user.me.fetch();
      replace("/start");
      setIsLoading(false);
    } catch (e) {
      createToast({
        type: "error",
        message: "Failed to get a response from the server.",
      });
      setIsLoading(false);
    }
  };

  return (
    <MainLayout title="Network error" description="Something went wrong. Please check your internet connection.">
      <Button
        cls="mt-6"
        variant="gradient"
        icon={<Icon size={24} name="refresh" color="white" />}
        isLoading={isLoading}
        onPress={handleRetry}
      >
        Try again
      </Button>

      {authIsLoaded && userId && (
        <Button cls="mt-4" variant="outline" icon={<Icon size={24} name="logout" color="white" />} onPress={() => void signOut()}>
          Sign out
        </Button>
      )}

      <Typography cls="mt-6 text-center text-xs">
        Env {process.env.EXPO_PUBLIC_ENV} {getBaseUrl()}
      </Typography>
    </MainLayout>
  );
};

export default NetworkErrorPage;
