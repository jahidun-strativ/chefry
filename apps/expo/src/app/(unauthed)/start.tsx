import type { FC } from "react";
import type { ImageSourcePropType } from "react-native";
import { ImageBackground, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Logo } from "@/components/logo";
import { useResponsive } from "@/hooks/useResponsive";
import { Button } from "@/components/ui/button";
import StartPageCarousel from "@/components/ui/start-page-carousel";
import start_bg from "@/assets/start_bg.jpg";

const StartPage: FC = () => {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const logoSize = isMobile ? { width: 240, height: 82 } : isTablet ? { width: 280, height: 96 } : { width: 320, height: 110 };

  return (
    <ImageBackground source={start_bg as ImageSourcePropType} className="h-full w-full" resizeMode="cover">
      <SafeAreaView>
        <View className="flex h-full w-full flex-col">
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
    </ImageBackground>
  );
};

export default StartPage;
