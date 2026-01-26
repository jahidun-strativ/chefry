import { useCallback, useState } from "react";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { usePathname } from "expo-router";

const useScrollTracker = (currentPath?: string) => {
  const [isScrolled, setIsScrolled] = useState(false);

  const pathname = usePathname();

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (currentPath && pathname !== currentPath) return;

      const offsetY = e.nativeEvent.contentOffset.y;
      if (offsetY > 10 && !isScrolled) {
        setIsScrolled(true);
      } else if (offsetY <= 10 && isScrolled) {
        setIsScrolled(false);
      }
    },
    [setIsScrolled, isScrolled, pathname, currentPath],
  );

  return [isScrolled, onScroll] as const;
};

export default useScrollTracker;
