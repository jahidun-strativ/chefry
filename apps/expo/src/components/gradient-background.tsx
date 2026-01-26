/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FC, PropsWithChildren } from "react";
import { ImageBackground } from "react-native";

import bg from "@/assets/bg.jpg";

const GradientBackground: FC<PropsWithChildren> = ({ children }) => {
  return (
    <ImageBackground source={bg as any} className="absolute h-full w-full">
      {children}
    </ImageBackground>
  );
};

export default GradientBackground;
