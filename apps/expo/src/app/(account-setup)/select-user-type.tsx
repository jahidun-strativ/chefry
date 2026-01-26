import type { FC } from "react";
import { useState } from "react";
import { Pressable, View } from "react-native";
import * as Haptics from "expo-haptics";

import { api } from "@/utils/api";
import { cn } from "@/utils/cn";
import createToast from "@/utils/createToast";
import { Image } from "@/components/image";
import MainLayout from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import Typography from "@/components/ui/typography";
import startracker from "@/assets/startracker.webp";
import zlatan from "@/assets/zlatan2.webp";

const SelectUserTypePage: FC = () => {
  const [selectedType, setSelectedType] = useState<"STAR" | "STAR_TRACKER" | null>(null);

  const handeSelectType = (type: "STAR" | "STAR_TRACKER") => async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedType(type);
  };

  const utils = api.useContext();
  const { mutateAsync: updateUser, isLoading } = api.auth.user.update.useMutation({
    onSuccess: async () => {
      await utils.auth.user.invalidate();
    },
  });

  const handleConfirm = async () => {
    if (!selectedType) return;

    try {
      await updateUser({ type: selectedType });
    } catch (e) {
      createToast({
        type: "error",
        message: "Failed to create user",
      });
    }
  };

  return (
    <>
      <MainLayout
        contentType="scrollable"
        floatingButton={
          <Button
            cls="py-6 mt-6 absolute bottom-0 left-0 right-0"
            variant="outline"
            disabled={!selectedType}
            isLoading={isLoading}
            onPress={handleConfirm}
          >
            Continue
          </Button>
        }
      >
        <Typography variant="p" cls="text-center text-lg mt-4">
          Which of these best describes you?
        </Typography>

        <Pressable
          className={cn(
            "relative mt-8 h-48 w-full overflow-hidden rounded-2xl shadow-lg",
            selectedType === "STAR" && "border border-white",
            selectedType === "STAR_TRACKER" && "opacity-50",
          )}
          onPress={handeSelectType("STAR")}
        >
          <Image source={zlatan as string} className="absolute z-0 h-48 w-full" contentFit="cover" />
          <View className="z-1 absolute flex h-48 w-full flex-col items-center justify-end bg-black/20 p-3">
            <Typography variant="h2" cls="text-2xl text-center">
              Star
            </Typography>
            <Typography cls="text-center" variant="p">
              You&apos;re a star and you want to create content for your biggest fans.
            </Typography>
          </View>
        </Pressable>

        <Pressable
          className={cn(
            "relative mt-8 h-48 w-full overflow-hidden rounded-2xl shadow-lg",
            selectedType === "STAR_TRACKER" && "border border-white",
            selectedType === "STAR" && "opacity-50",
          )}
          onPress={handeSelectType("STAR_TRACKER")}
        >
          <Image source={startracker as string} className="absolute z-0 h-48 w-full" contentFit="cover" />
          <View className="z-1 absolute flex h-48 w-full flex-col items-center justify-end bg-black/30 p-3">
            <Typography variant="h2" cls="text-2xl text-center">
              Star Tracker
            </Typography>
            <Typography cls="text-center" variant="p">
              You&apos;re a fan and you want to access to exclusive content from your favorite stars..
            </Typography>
          </View>
        </Pressable>
      </MainLayout>
    </>
  );
};

export default SelectUserTypePage;
