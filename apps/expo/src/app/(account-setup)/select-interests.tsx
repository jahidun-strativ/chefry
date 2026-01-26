/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FC } from "react";
import { useState } from "react";
import { Platform, View } from "react-native";

import type { INTEREST } from "@startracker/db";

import { api } from "@/utils/api";
import { cn } from "@/utils/cn";
import createToast from "@/utils/createToast";
import { INTERESTS } from "@/utils/models";
import InterestCard from "@/components/interest-card";
import MainLayout from "@/components/main-layout";
import BlurView from "@/components/ui/blur-view";
import { Button } from "@/components/ui/button";

const interestPairs = INTERESTS.reduce<INTEREST[][]>((acc, curr, i) => {
  if (i % 2 === 0) {
    acc.push([curr]);
  } else {
    acc[acc.length - 1]?.push(curr);
  }
  return acc;
}, []);

const SelectInterestsPage: FC = () => {
  const { data: user } = api.auth.user.me.useQuery();

  const [selectedInterests, setSelectedInterests] = useState<INTEREST[]>([]);
  const handleToggleSelect = (interest: INTEREST) => {
    setSelectedInterests((prev) => (prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]));
  };

  const utils = api.useContext();
  const { mutateAsync: updateUser, isLoading } = api.auth.user.update.useMutation({
    onSuccess: async () => {
      await utils.auth.user.invalidate();
    },
  });

  const handleConfirm = async () => {
    if (selectedInterests.length === 0) {
      createToast({
        type: "error",
        message: "Please select at least one interest",
      });
      return;
    }

    try {
      await updateUser({ interests: selectedInterests as any, interestsSet: true });
    } catch (e) {
      createToast({
        type: "error",
        message: "Something went wrong",
      });
    }
  };

  return (
    <MainLayout
      contentType="scrollable"
      description={
        user?.type === "STAR"
          ? "Before you get started, tell us what kind of Star you are. We want to make sure that fans can find you and new fans can discover you!"
          : "Before you get started, tell us some of your interests so we can suggest stars that you might like"
      }
      isLoading={!user}
      floatingButton={
        <>
          {Platform.OS === "ios" && <BlurView cls="absolute bottom-0 left-0 right-0 h-20 w-full overflow-hidden rounded-full" />}
          <Button
            cls={cn("py-6 mt-6 w-full h-20", Platform.OS !== "ios" && "bg-black/60")}
            variant="outline"
            isLoading={isLoading}
            onPress={handleConfirm}
          >
            Continue
          </Button>
        </>
      }
    >
      {/* <Button size="sm" onPress={handleSignOut} variant="outline" isLoading={isSigningOut}>
        Logout
      </Button> */}
      <View className="mt-6 flex h-full flex-col gap-3 pb-32">
        {interestPairs.map((pair, i) => (
          <View key={i} className="flex flex-row gap-3">
            {pair.map((interest) => (
              <View className="flex-1 " key={interest}>
                <InterestCard interest={interest} isSelected={selectedInterests.includes(interest)} onToggleSelect={handleToggleSelect} />
              </View>
            ))}
          </View>
        ))}
      </View>
    </MainLayout>
  );
};

export default SelectInterestsPage;
