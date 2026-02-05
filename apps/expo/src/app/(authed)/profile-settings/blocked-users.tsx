import type { FC } from "react";
import { useState } from "react";
import { Platform, View } from "react-native";

import { api } from "@/utils/api";
import { cn } from "@/utils/cn";
import { useResponsive } from "@/hooks/useResponsive";
import createToast from "@/utils/createToast";
import MainLayout from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import Typography from "@/components/ui/typography";
import StartrackerIcon from "@/assets/startracker_icon.svg";

const BlockedUsersPage: FC = () => {
  const { data, isLoading } = api.auth.user.blockList.useQuery();
  const blockedUsers = data ?? [];
  const { isMobile, isTablet } = useResponsive();

  const [unblockingUsername, setUnblockingUsername] = useState<string | null>(null);

  const utils = api.useContext();
  const { mutate: unblock } = api.auth.user.unblock.useMutation({
    onMutate: ({ username }) => {
      setUnblockingUsername(username);
    },
    onSuccess: async () => {
      await Promise.all([utils.auth.user.invalidate(), utils.auth.post.invalidate(), utils.auth.story.invalidate()]);
      setUnblockingUsername(null);
      createToast({
        type: "success",
        message: "User unblocked",
      });
    },
    onError: () => {
      createToast({
        type: "error",
        message: "Failed to unblock user",
      });
    },
  });

  const handleUnblockUser = (username: string) => {
    unblock({ username });
  };

  return (
    <MainLayout
      title="Blocked users"
      description="Here are the users you blocked within the app listed."
      contentType="scrollable"
      showBackButton
      isLoading={isLoading}
    >
      {blockedUsers.length === 0 && (
        <View className={cn("flex flex-col items-center justify-center p-6 md:p-8 lg:p-12 max-w-md lg:max-w-lg mx-auto w-full", Platform.OS === "android" && "py-2")}>
          <StartrackerIcon className="opacity-60" width={isMobile ? 160 : isTablet ? 180 : 200} height={isMobile ? 160 : isTablet ? 180 : 200} />
          <Typography variant="h2" fontWeight="bold" cls="text-center mt-6 md:mt-8 lg:mt-10">
            You have no blocked users
          </Typography>
        </View>
      )}

      {blockedUsers.length > 0 && (
        <View className="max-w-md lg:max-w-lg mx-auto w-full">
          {blockedUsers.map((user) => {
            return (
              <View key={user.id} className="mt-3 md:mt-4 lg:mt-5 flex flex-row items-center justify-between rounded-xl border border-white p-3 md:p-4 lg:p-5">
                <Typography fontWeight="medium" cls="text-lg md:text-xl lg:text-2xl">
                  {user.username}
                </Typography>
                <Button
                  variant="outline"
                  size="xs"
                  cls="px-4 md:px-5 lg:px-6"
                  onPress={() => handleUnblockUser(user.username)}
                  isLoading={unblockingUsername === user.username}
                >
                  Unblock
                </Button>
              </View>
            );
          })}
        </View>
      )}
    </MainLayout>
  );
};

export default BlockedUsersPage;
