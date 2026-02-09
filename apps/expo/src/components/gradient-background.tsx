import type { FC, PropsWithChildren } from "react";
import { LinearGradient } from "expo-linear-gradient";

const GradientBackground: FC<PropsWithChildren> = ({ children }) => {
  return (
    <LinearGradient
      colors={["#1a0a2e", "#3d1142", "#16213e"]}
      start={[0.0, 0.0]}
      end={[1.0, 1.0]}
      className="absolute h-full w-full"
    >
      {children}
    </LinearGradient>
  );
};

export default GradientBackground;
