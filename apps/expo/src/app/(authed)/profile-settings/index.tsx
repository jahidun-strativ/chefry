/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { FC } from "react";
import { useState } from "react";
import { Alert, View } from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import Icon from "@expo/vector-icons/Feather";

import { api } from "@/utils/api";
import { cn } from "@/utils/cn";
import { useResponsive } from "@/hooks/useResponsive";
import createToast from "@/utils/createToast";
import { Image } from "@/components/image";
import toPurchaseIcon from "@/assets/to-purchase.png";
import FullPageLoadingOverlay from "@/components/full-page-loading-overlay";
import MainLayout from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import Typography from "@/components/ui/typography";

const ProfileListButton: FC<{ href: string; label: string; cls?: string; showPurchaseIcon?: boolean }> = ({ href, label, cls, showPurchaseIcon }) => {
  const { isMobile, isTablet } = useResponsive();
  const iconSize = isMobile ? 18 : isTablet ? 20 : 22;
  const purchaseIconSize = isMobile ? 18 : isTablet ? 20 : 22;
  
  return (
    <Button variant="outline" cls={cn("mb-2 md:mb-3 lg:mb-4 max-w-md lg:max-w-lg mx-auto w-full", cls)} href={href}>
      <View className="flex w-full flex-row items-center justify-between pl-3 md:pl-4 lg:pl-5 pr-3 md:pr-4 lg:pr-5">
        <View className="flex flex-row items-center">
          {showPurchaseIcon && (
            <Image source={toPurchaseIcon} style={{ width: purchaseIconSize, height: purchaseIconSize, marginRight: isMobile ? 8 : isTablet ? 10 : 12 }} contentFit="contain" />
          )}
          <Typography variant="h2" cls="text-base md:text-lg lg:text-xl">
            {label}
          </Typography>
        </View>
        <Icon name="chevron-right" size={iconSize} color="white" />
      </View>
    </Button>
  );
};

const ProfileSettingsPage: FC = () => {
  const { data: me } = api.auth.user.me.useQuery();
  const { signOut } = useAuth();
  const { isMobile, isTablet } = useResponsive();

  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
      setIsSigningOut(false);
    } catch (e) {
      setIsSigningOut(false);
      createToast({
        type: "error",
        message: "Failed to sign out",
      });
    }
  };

  const { mutate: deleteUser, isLoading: isDeletingUser } = api.auth.user.delete.useMutation({
    onSuccess: async () => handleSignOut(),
    onError: (e) => {
      createToast({
        type: "error",
        message: e.message,
      });
    },
  });

  const handleDeleteAccount = () => {
    Alert.alert(
      "Do you want to delete the post?",
      "This will delete all your data within the app and cancel your active subscriptions. This action cannot be undone.",
      [
        {
          text: "Cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteUser();
          },
        },
      ],
    );
  };

  const iconSize = isMobile ? 18 : isTablet ? 20 : 22;

  return (
    <>
      <MainLayout showBackButton isLoading={!me} title="Your profile" contentType="scrollable">
        <View className="h-3 md:h-4 lg:h-5" />

        <View className="max-w-md lg:max-w-lg mx-auto w-full">
          <ProfileListButton href="/profile-settings/edit" label="Edit profile" />

          <ProfileListButton href="/profile-settings/edit-interests" label="Interests" />

          <ProfileListButton href="/profile-settings/financial-setup" label="Financial setup" />

          <ProfileListButton href="/profile-settings/blocked-users" label="Blocked users" />

          {me?.verified && <ProfileListButton href="/profile-settings/followers-and-subscribers" label="Followers & subscribers" />}
          <ProfileListButton href="/profile-settings/subscriptions-and-purchases" label="Subscriptions & packages" showPurchaseIcon />

          {!me?.verified && (
            <Button variant="gradient" cls="mb-2 md:mb-3 lg:mb-4 border border-white max-w-md lg:max-w-lg mx-auto w-full" href="/profile-settings/become-a-star">
              <View className="flex w-full flex-row items-center justify-between pl-3 md:pl-4 lg:pl-5 pr-3 md:pr-4 lg:pr-5">
                <Typography variant="h2" cls="text-base md:text-lg lg:text-xl">
                  Become a Star
                </Typography>
                <Icon name="chevron-right" size={iconSize} color="white" />
              </View>
            </Button>
          )}

          {me?.verified && <ProfileListButton href="/profile-settings/star-settings" label="Star settings" />}
        </View>

        <View className="flex-colv mt-12 md:mt-16 lg:mt-20 flex w-full max-w-md lg:max-w-lg mx-auto">
          <Button
            size="sm"
            onPress={handleSignOut}
            variant="gradient"
            isLoading={isSigningOut}
            cls="border border-white"
            gradient={["#938DFB", "#9589F6", "#9B7FEA", "#A56ED5"]}
          >
            Logout
          </Button>

          <View className="h-2 md:h-3 lg:h-4" />

          <Button
            size="sm"
            variant="gradient"
            cls="border border-white"
            gradient={["#C73993", "#DD1465", "#EB004C"]}
            onPress={handleDeleteAccount}
          >
            Delete Account
          </Button>
        </View>
      </MainLayout>
      {/* <View className="absolute bottom-6 left-0 right-0 flex items-center justify-center">
        <Typography className="text-xs">{process.env.EXPO_PUBLIC_ENV} 1.0.3</Typography>
      </View> */}
      <FullPageLoadingOverlay isLoading={isDeletingUser} />
    </>
  );
};

export default ProfileSettingsPage;
