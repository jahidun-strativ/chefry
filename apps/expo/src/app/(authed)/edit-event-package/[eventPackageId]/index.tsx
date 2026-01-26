import { useState } from "react";
import { Alert, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { api } from "@/utils/api";
import { cn } from "@/utils/cn";
import createToast from "@/utils/createToast";
import { EditEventPackageContent } from "@/components/event-package/edit-event-package-content";
import { EditEventPackageDetails } from "@/components/event-package/edit-event-package-details";
import MainLayout from "@/components/main-layout";
import ButtonBase from "@/components/ui/button-base";
import Typography from "@/components/ui/typography";

export default function EditEventPackagePage() {
  const { eventPackageId } = useLocalSearchParams() as { eventPackageId: string };

  const { data: eventPackage } = api.auth.eventPackage.getWithPosts.useQuery({ id: eventPackageId });

  const [type, setType] = useState<"DETAILS" | "POSTS">("DETAILS");

  const { back } = useRouter();
  const utils = api.useUtils();
  const { mutate: deleteEventPackage } = api.auth.eventPackage.delete.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.auth.eventPackage.invalidate()]);
      createToast({
        message: "Event package deleted!",
        type: "success",
      });
      back();
    },
    onError: (e) => {
      createToast({
        message: e.message,
        type: "error",
      });
    },
  });

  const handleRequestDelete = () => {
    Alert.alert(
      "Delete event package",
      "Are you sure you want to delete this event package? This action cannot be undone.",
      [
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteEventPackage({ id: eventPackageId });
          },
        },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: false },
    );
  };

  return (
    <MainLayout
      showBackButton
      title="Edit event package"
      contentType="scrollable"
      isLoading={!eventPackage}
      customActionIconName="trash-2"
      onCustomActionPress={handleRequestDelete}
    >
      <View className="flex w-full items-center justify-center pb-6 pt-4">
        <View className="flex flex-row rounded-full border border-white">
          <View className="overflow-hidden rounded-full">
            <ButtonBase className={cn("rounded-full px-3 py-3", type === "DETAILS" && "bg-white")} onPress={() => setType("DETAILS")}>
              <Typography fontWeight="bold" cls={cn("text-white text-sm", type === "DETAILS" && "text-black")}>
                Details
              </Typography>
            </ButtonBase>
          </View>

          <View className="overflow-hidden rounded-full">
            <ButtonBase className={cn("rounded-full px-3 py-3", type === "POSTS" && "bg-white")} onPress={() => setType("POSTS")}>
              <Typography fontWeight="bold" cls={cn("text-white text-sm", type === "POSTS" && "text-black")}>
                Posts
              </Typography>
            </ButtonBase>
          </View>
        </View>
      </View>

      {type === "DETAILS" && eventPackage && <EditEventPackageDetails eventPackage={eventPackage} />}
      {type === "POSTS" && eventPackage && <EditEventPackageContent eventPackage={eventPackage} />}
    </MainLayout>
  );
}
