import type { FC } from "react";
import { useEffect, useState } from "react";
import { Dimensions, Pressable, View } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";

import { Image } from "@/components/image";
import carousel_img_1 from "@/assets/start-carousel/1.png";
import carousel_img_2 from "@/assets/start-carousel/2.png";
import carousel_img_3 from "@/assets/start-carousel/3.png";
import carousel_img_4 from "@/assets/start-carousel/4.png";
import carousel_img_5 from "@/assets/start-carousel/5.png";
import carousel_img_6 from "@/assets/start-carousel/6.png";
import carousel_img_7 from "@/assets/start-carousel/7.png";
import carousel_img_8 from "@/assets/start-carousel/8.png";

const carouselImages = [
  carousel_img_1 as string,
  carousel_img_2 as string,
  carousel_img_3 as string,
  carousel_img_4 as string,
  carousel_img_5 as string,
  carousel_img_6 as string,
  carousel_img_7 as string,
  carousel_img_8 as string,
] as string[];

const StartPageCarousel: FC = () => {
  const screenWidth = Dimensions.get("window").width;

  const [itemWidth, setItemWidth] = useState(screenWidth);

  useEffect(() => {
    setItemWidth(screenWidth);
  }, [screenWidth]);

  return (
    <View style={{ width: Dimensions.get("window").width, height: itemWidth }}>
      <Carousel
        width={itemWidth}
        height={itemWidth}
        // style={{ width: Dimensions.get("window").width }}
        // mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.9,
          parallaxAdjacentItemScale: 0.7,
          parallaxScrollingOffset: 80,
        }}
        loop
        autoPlay
        // scrollAnimationDuration={700}
        autoPlayInterval={2000}
        withAnimation={{
          type: "spring",
          config: {
            damping: 16,
            stiffness: 100,
          },
        }}
        data={carouselImages}
        snapEnabled={false}
        renderItem={({ item, index }) => {
          return (
            <Link key={index} asChild={true} href="/create-account">
              <Pressable className="flex w-full items-center justify-center px-0.5" style={{ width: itemWidth, alignSelf: "center" }}>
                <LinearGradient
                  colors={["#938DFB", "#9589F6", "#9B7FEA", "#A56ED5", "#B457B8", "#C73993", "#DD1465", "#EB004C"]}
                  start={[0.0, 0.5]}
                  end={[1.0, 0.5]}
                  className="relative aspect-square w-full rounded-full p-0.5"
                >
                  <View className="w-ful absolute m-0.5 aspect-square">
                    {/* <View className="h-full w-full rounded-full bg-red-500" style={{ width: 200, height: 200 }} /> */}
                    <Image
                      source={item}
                      className="aspect-square rounded-full"
                      contentFit="fill"
                      style={{ width: itemWidth - 6, height: itemWidth - 6 }}
                    />
                  </View>
                </LinearGradient>
              </Pressable>
            </Link>
          );
        }}
      />
    </View>
  );
};

export default StartPageCarousel;
