import { useCallback, useState } from "react";
import type { LayoutChangeEvent } from "react-native";

const useComponentSize = () => {
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize({ width, height });
  }, []);

  return [size, onLayout] as const;
};

export default useComponentSize;
