import { useState } from "react";
import { View } from "react-native";

import { cn } from "@/utils/cn";
import MainLayout from "@/components/main-layout";
import { MyPackages } from "@/components/my-packages";
import { MySubscriptions } from "@/components/my-subscriptions";
import ButtonBase from "@/components/ui/button-base";
import Typography from "@/components/ui/typography";

export default function SubscriptionsAndPurchasesPage() {
  const [type, setType] = useState<"SUBSCRIPTIONS" | "PACKAGES">("SUBSCRIPTIONS");

  return (
    <>
      <MainLayout title="Subscriptions & purchases" contentType="scrollable" showBackButton>
        <View className="h-3" />

        <View className="flex w-full items-center justify-center pb-6 pt-4">
          <View className="flex flex-row rounded-full border border-white">
            <View className="overflow-hidden rounded-full">
              <ButtonBase
                cls={cn("rounded-full px-3 py-3", type === "SUBSCRIPTIONS" && "bg-white")}
                onPress={() => setType("SUBSCRIPTIONS")}
              >
                <Typography fontWeight="bold" cls={cn("text-white text-sm", type === "SUBSCRIPTIONS" && "!text-black")}>
                  Subscriptions
                </Typography>
              </ButtonBase>
            </View>

            <View className="overflow-hidden rounded-full">
              <ButtonBase cls={cn("rounded-full px-3 py-3", type === "PACKAGES" && "bg-white")} onPress={() => setType("PACKAGES")}>
                <Typography fontWeight="bold" cls={cn("text-white text-sm", type === "PACKAGES" && "!text-black")}>
                  Packages
                </Typography>
              </ButtonBase>
            </View>
          </View>
        </View>

        {type === "SUBSCRIPTIONS" && <MySubscriptions />}
        {type === "PACKAGES" && <MyPackages />}
      </MainLayout>
    </>
  );
}
