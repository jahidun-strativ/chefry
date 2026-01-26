import type { FC } from "react";
import type { ImageSourcePropType } from "react-native";
import { ImageBackground, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import StartPageCarousel from "@/components/ui/start-page-carousel";
import start_bg from "@/assets/start_bg.jpg";

const StartPage: FC = () => {
  return (
    <ImageBackground source={start_bg as ImageSourcePropType} className="h-full w-full" resizeMode="cover">
      <SafeAreaView>
        <View className="flex h-full w-full flex-col">
          <View className="flex items-center justify-center px-12">
            <Logo width={320} height={110} />
          </View>

          <View className="mb-6 mt-1 w-full py-8">
            <StartPageCarousel />
          </View>

          <View className="-mt-24 flex w-full flex-col px-4">
            <Button variant="gradient" href="/create-account">
              Join Star Tracker
            </Button>
            <Button href="/sign-in" cls="mt-2">
              Log in
            </Button>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default StartPage;
