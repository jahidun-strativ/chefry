import type { FC } from "react";
import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

import { Logo } from "@/components/logo";
import { useResponsive } from "@/hooks/useResponsive";
import { Button } from "@/components/ui/button";
import StartPageCarousel from "@/components/ui/start-page-carousel";

const StartPage: FC = () => {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const logoSize = isMobile ? { width: 240, height: 82 } : isTablet ? { width: 280, height: 96 } : { width: 320, height: 110 };

  return (
    <LinearGradient
      colors={["#1a0a2e", "#3d1142", "#16213e"]}
      start={[0.0, 0.0]}
      end={[1.0, 1.0]}
      className="h-full w-full"
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View className="flex flex-1 w-full flex-col">
          <View className="flex items-center justify-center px-12 md:px-16 lg:px-20">
            <Logo width={logoSize.width} height={logoSize.height} />
          </View>

          <View className="mb-6 md:mb-8 lg:mb-10 mt-1 md:mt-2 lg:mt-3 w-full py-8 md:py-10 lg:py-12">
            <StartPageCarousel />
          </View>

          <View className="-mt-24 md:-mt-28 lg:-mt-32 flex w-full flex-col px-4 md:px-6 lg:px-8 max-w-md lg:max-w-lg mx-auto">
            <Button variant="gradient" href="/create-account">
              Join Star Tracker
            </Button>
            <Button href="/sign-in" cls="mt-2 md:mt-3 lg:mt-4">
              Log in
            </Button>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default StartPage;
