/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { FC } from "react";
import { useState } from "react";
import { Alert, View } from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import Icon from "@expo/vector-icons/Feather";

import { api } from "@/utils/api";
import { cn } from "@/utils/cn";
import createToast from "@/utils/createToast";
import { Image } from "@/components/image";
import toPurchaseIcon from "@/assets/to-purchase.png";
import FullPageLoadingOverlay from "@/components/full-page-loading-overlay";
import MainLayout from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import Typography from "@/components/ui/typography";

const ProfileListButton: FC<{ href: string; label: string; cls?: string; showPurchaseIcon?: boolean }> = ({ href, label, cls, showPurchaseIcon }) => (
  <Button variant="outline" cls={cn("mb-2", cls)} href={href}>
      <View className="flex w-full flex-row items-center justify-between pl-4">
        <View className="flex flex-row items-center">
          {showPurchaseIcon && (
            <Image source={toPurchaseIcon} style={{ width: 20, height: 20, marginRight: 8 }} contentFit="contain" />
          )}
          <Typography variant="h2" cls="text-lg">
            {label}
          </Typography>
        </View>
      <Icon name="chevron-right" size={24} color="white" />
    </View>
  </Button>
);

const ProfileSettingsPage: FC = () => {
  const { data: me } = api.auth.user.me.useQuery();
  const { signOut } = useAuth();

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

  return (
    <>
      <MainLayout showBackButton isLoading={!me} title="Your profile" contentType="scrollable">
        <View className="h-3" />

        <ProfileListButton href="/profile-settings/edit" label="Edit profile" />

        <ProfileListButton href="/profile-settings/edit-interests" label="Interests" />

        <ProfileListButton href="/profile-settings/financial-setup" label="Financial setup" />

        <ProfileListButton href="/profile-settings/blocked-users" label="Blocked users" />

        {me?.verified && <ProfileListButton href="/profile-settings/followers-and-subscribers" label="Followers & subscribers" />}
        <ProfileListButton href="/profile-settings/subscriptions-and-purchases" label="Subscriptions & packages" showPurchaseIcon />

        {!me?.verified && (
          <Button variant="gradient" cls="mb-2 border border-white" href="/profile-settings/become-a-star">
            <View className="flex w-full flex-row items-center justify-between pl-4">
              <Typography variant="h2" cls="text-lg">
                Become a Star
              </Typography>
              <Icon name="chevron-right" size={24} color="white" />
            </View>
          </Button>
        )}

        {me?.verified && <ProfileListButton href="/profile-settings/star-settings" label="Star settings" />}

        <View className="flex-colv mt-16 flex w-full">
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

          <View className="h-2" />

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
