import { useState } from "react";
import { View } from "react-native";

import { cn } from "@/utils/cn";
import { Image } from "@/components/image";
import toPurchaseIcon from "@/assets/to-purchase.png";
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
        <View className="h-3 md:h-4 lg:h-5" />

        <View className="flex w-full items-center justify-center pb-6 md:pb-8 lg:pb-10 pt-4 md:pt-5 lg:pt-6">
          <View className="flex flex-row rounded-full border border-white">
            <View className="overflow-hidden rounded-full">
              <ButtonBase
                cls={cn("rounded-full px-3 md:px-4 lg:px-5 py-3 md:py-4 lg:py-5", type === "SUBSCRIPTIONS" && "bg-white")}
                onPress={() => setType("SUBSCRIPTIONS")}
              >
                <Typography fontWeight="bold" cls={cn("text-white text-sm md:text-base lg:text-lg", type === "SUBSCRIPTIONS" && "!text-black")}>
                  Subscriptions
                </Typography>
              </ButtonBase>
            </View>

            <View className="overflow-hidden rounded-full">
              <ButtonBase
                cls={cn("rounded-full px-3 md:px-4 lg:px-5 py-3 md:py-4 lg:py-5", type === "PACKAGES" && "bg-white")}
                onPress={() => setType("PACKAGES")}
              >
                <View className="flex flex-row items-center">
                  <Image
                    source={toPurchaseIcon as unknown as number}
                    style={{ width: 16, height: 16, marginRight: 6 }}
                    className="md:w-5 md:h-5 lg:w-6 lg:h-6 md:mr-2 lg:mr-3"
                    contentFit="contain"
                  />
                  <Typography
                    fontWeight="bold"
                    cls={cn("text-white text-sm md:text-base lg:text-lg", type === "PACKAGES" && "!text-black")}
                  >
                    Packages
                  </Typography>
                </View>
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
