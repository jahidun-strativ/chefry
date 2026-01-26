import type { FC } from "react";
import { Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AnimatePresence, MotiView } from "moti";

import { cn } from "@/utils/cn";
import Typography from "@/components/ui/typography";

interface Props {
  message: string;
  id?: string;
  duration?: "short" | "long";
  type: "loading" | "success" | "error";
  onClose: () => void;
}

export const Toast: FC<Props> = ({ message, type, onClose }) => {
  const { top } = useSafeAreaInsets();

  return (
    <AnimatePresence>
      <MotiView
        from={{ opacity: 0, transform: [{ translateY: -20 }] }}
        animate={{ opacity: 1, transform: [{ translateY: 0 }] }}
        exit={{ opacity: 0, transform: [{ translateY: -20 }] }}
        style={{ top }}
        transition={{
          type: "timing",
          duration: 300,
        }}
        className={cn(
          "absolute left-4 right-4 z-[100000] rounded-xl border bg-black p-3",
          type === "success" && "border-green-500",
          type === "error" && "border-red-700",
        )}
      >
        <Pressable className="flex flex-row" onPress={onClose}>
          {/* <View
              className={cn(
                "mr-2 flex h-6 w-6 items-center justify-center rounded-full",
                type === "error" && "bg-red-600",
                type === "success" && "bg-green-500",
              )}
            >
              <Icon name="check" size={16} className="text-white" />
            </View> */}
          <Typography cls="text-white text-sm" variant="p">
            {message}
          </Typography>
        </Pressable>
      </MotiView>
    </AnimatePresence>
  );
};
