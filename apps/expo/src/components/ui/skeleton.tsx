import type { FC } from "react";
import { View } from "react-native";
import type { MotiSkeletonProps } from "moti/build/skeleton/types";
import { Skeleton as MotiSkeleton } from "moti/skeleton";

import { cn } from "@/utils/cn";

interface Props extends Partial<MotiSkeletonProps> {
  cls?: string;
}

const Skeleton: FC<Props> = ({ cls, ...props }) => {
  return (
    <View className={cn("opacity-30", cls)}>
      <MotiSkeleton colorMode="light" radius={4} height={20} {...props} />
    </View>
  );
};

export default Skeleton;
