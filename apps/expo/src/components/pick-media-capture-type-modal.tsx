import type { FC } from "react";
import { View } from "react-native";
import Icon from "@expo/vector-icons/Feather";
import { Portal } from "@gorhom/portal";
import { AnimatePresence, MotiView } from "moti";

import BlurView from "./ui/blur-view";
import { Button } from "./ui/button";
import Typography from "./ui/typography";

interface Props {
  isOpen: boolean;
  postType: "STORY" | "POST";
  onCancel: () => void;
  onSelectType: (type: "LIBRARY" | "CAMERA_IMAGE" | "CAMERA_VIDEO") => void;
}

const PickMediaCaptureTypeModal: FC<Props> = ({ isOpen, onCancel, onSelectType, postType }) => {
  return (
    <Portal>
      <AnimatePresence>
        {isOpen && (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 300,
            }}
            className="absolute inset-0 z-50 flex h-full w-full items-center justify-center bg-black/80 p-6"
          >
            <MotiView
              from={{ opacity: 0, translateY: 100 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0, translateY: 100 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 30,
              }}
              className="relative w-full overflow-hidden rounded-2xl border border-white/40 shadow"
            >
              <BlurView cls="absolute inset-0 h-full w-full" />
              {/* <View className="flex flex-row items-center justify-between">
                <Typography cls="text-xl" fontWeight="bold" variant="h2">
                  Select capture type
                </Typography>
                <IconButton iconName="x" />
              </View> */}
              <View className="p-4">
                <Typography fontWeight="bold" cls="text-center mb-6 text-2xl">
                  New {postType === "POST" ? "post" : "story"}
                </Typography>
                <Button variant="outline" onPress={() => onSelectType("LIBRARY")}>
                  <Icon name="image" size={20} color="white" />
                  <Typography cls="ml-3">Pick from library</Typography>
                </Button>
                <Button cls="mt-2" variant="outline" onPress={() => onSelectType("CAMERA_IMAGE")}>
                  <Icon name="camera" size={20} color="white" />
                  <Typography cls="ml-3">Capture image from camera</Typography>
                </Button>
                <Button cls="mt-2" variant="outline" onPress={() => onSelectType("CAMERA_VIDEO")}>
                  <Icon name="video" size={20} color="white" />
                  <Typography cls="ml-3">Capture video from camera</Typography>
                </Button>
                <Button size="sm" cls="mt-4 border-red-600/50" variant="outline" onPress={onCancel}>
                  <Typography className="text-red-500">Cancel</Typography>
                </Button>
              </View>
            </MotiView>
          </MotiView>
        )}
      </AnimatePresence>
    </Portal>
  );
};

export default PickMediaCaptureTypeModal;
