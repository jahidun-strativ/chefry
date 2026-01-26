import type { ComponentProps, FC } from "react";
import { Pressable } from "react-native";
import Icon from "@expo/vector-icons/Feather";
import { MotiView, Text } from "moti";
import { MotiPressable } from "moti/interactions";

import { cn } from "@/utils/cn";
import { POST_REACTION_TYPE } from "@/utils/models";
import heartAnimation from "@/assets/animations/heart.json";
import smileAnimation from "@/assets/animations/smile.json";
import starAnimation from "@/assets/animations/star.json";
import { AnimatedPressable } from "./animated-pressable";
import { LinearGradient } from "./linear-gradient";
import ButtonBase from "./ui/button-base";

type Animation = typeof heartAnimation | typeof smileAnimation | typeof starAnimation;

const animations: Record<POST_REACTION_TYPE, Animation> = {
  HEART: heartAnimation,
  SMILE: smileAnimation,
  STAR: starAnimation,
};

interface PostInteraction {
  type: POST_REACTION_TYPE;
  icon: ComponentProps<typeof Icon>["name"];
  animation: Animation;
  gradientColors: string[];
}

export const postInteractions: PostInteraction[] = [
  {
    type: "STAR",
    icon: "star",
    animation: animations.STAR,
    gradientColors: ["#A56ED5", "#B457B8", "#C73993"],
  },
  {
    type: "SMILE",
    icon: "smile",
    animation: animations.SMILE,
    gradientColors: ["#C73993", "#DD1465", "#EB004C"],
  },
  {
    type: "HEART",
    icon: "heart",
    animation: animations.HEART,
    gradientColors: ["#938DFB", "#9589F6", "#9B7FEA", "#A56ED5"],
  },
];

interface Props {
  interaction: PostInteraction;
  index: number;
  myReaction: POST_REACTION_TYPE | null;
  onReact: () => void;
}

export const AnimatedPostInteractionButton: FC<Props> = ({ interaction, index, myReaction, onReact }) => {
  // const animationRef = useRef<LottieView>(null);

  // const handleReact = () => {
  //   animationRef.current?.reset();
  //   animationRef.current?.play();
  // };

  return (
    <AnimatedPressable
      key={interaction.type}
      style={{
        transform: [{ translateY: -(index + 1) * 70 }],
      }}
      className="absolute right-0 z-10 h-16 w-16 rounded-full"
      // from={{ transform: [{ translateY: 0 }] }}
      // animate={{ transform: [{ translateY: -(index + 1) * 70 }] }}
      // exit={{ transform: [{ translateY: 0 }] }}
      // animate={{ translateY: -(index + 1) * 70 }}
      // exit={{ translateY: 0 }}
      // transition={{
      //   stiffness: 250,
      //   damping: 28,
      // }}
    >
      <LinearGradient
        colors={interaction.gradientColors as [string, string, ...string[]]}
        className="h-16 w-16 rounded-full p-[2px]"
        start={[0.0, 0.0]}
        end={[1.0, 1.0]}
      >
        <Pressable
          onPress={onReact}
          className={cn(
            "flex h-full w-full items-center justify-center rounded-full",
            myReaction === interaction.type ? "bg-transparent" : "bg-[#222222]",
          )}
        >
          <Icon name={interaction.icon} size={24} color="white" />
          {/* <LottieView
            autoPlay
            autoSize
            cacheStrategy="none"
            ref={animationRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              width: "100%",
              height: "100%",
            }}
            source={interaction.animation}
          /> */}
        </Pressable>
      </LinearGradient>
    </AnimatedPressable>
  );
};
