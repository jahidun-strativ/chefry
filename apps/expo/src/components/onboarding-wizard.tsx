import type { FC } from "react";
import { useState } from "react";
import { Dimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Portal } from "@gorhom/portal";
import { AnimatePresence, MotiView } from "moti";

import { api } from "@/utils/api";
import { Image } from "@/components/image";
import wizard_image_1 from "@/assets/wizard/wizard_1.jpg";
import wizard_image_2 from "@/assets/wizard/wizard_2.jpg";
import { Logo } from "./logo";
import BlurView from "./ui/blur-view";
import { Button } from "./ui/button";
import Typography from "./ui/typography";

interface Props {
  open: boolean;
  onClose: () => void;
}

interface WizardItem {
  image: string;
  title: string;
  description: string;
}

const wizardItems: WizardItem[] = [
  {
    image: wizard_image_1 as string,
    title: "Track your favorite stars",
    description:
      "Find your favorite stars and subscribe to their page to see exclusive content made for the most loyal fans. Keep up to date with all new content and show your love for them!",
  },
  {
    image: wizard_image_2 as string,
    title: "Become a Star and earn for exclusive content",
    description: "Apply to get a Star profile and start providing exclusive content to subscribers. Earn and engage your fans!",
  },
  // {
  //   image: wizard_image_3 as string,
  //   title: "Suitable for work",
  //   description:
  //     "Star Tracker is committed to providing exclusive but appropriate content. Any unsuitable content will be removed from the platform.",
  // },
];

const OnboardingWizard: FC<Props> = ({ open, onClose }) => {
  const handleClose = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const [currentIndex, setCurrentIndex] = useState(0);
  const { bottom, top } = useSafeAreaInsets();

  const utils = api.useContext();
  const { mutate: updateUser } = api.auth.user.update.useMutation({
    onSuccess: async () => {
      await utils.auth.user.invalidate();
    },
  });
  const handleClickContinue = async () => {
    if (currentIndex === wizardItems.length - 1) {
      updateUser({ wizardCompleted: true });
      await handleClose();
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const currentItem = wizardItems[currentIndex];

  const windowWidth = Dimensions.get("window").width;

  return (
    <Portal>
      <AnimatePresence>
        {open && (
          <MotiView
            from={{ opacity: 0, translateY: 100 }}
            animate={{ opacity: 1, translateY: 0 }}
            exit={{ opacity: 0, translateY: 100 }}
            transition={{
              type: "timing",
              duration: 300,
            }}
            className="absolute inset-0 z-50 h-full w-full bg-black"
          >
            <View className="h-full w-full">
              <View className="absolute left-0 right-0 z-10 flex items-center justify-center" style={{ top }}>
                <Logo width={200} height={60} />
              </View>
              <AnimatePresence initial={false}>
                {currentItem && (
                  <MotiView
                    from={{ translateX: windowWidth }}
                    animate={{ translateX: 0 }}
                    exit={{ translateX: -windowWidth }}
                    transition={{
                      type: "timing",
                      duration: 500,
                    }}
                    key={currentItem.title}
                    className="absolute h-full w-full"
                  >
                    <Image className="h-full w-full" source={currentItem.image} contentFit="cover" />
                    <View className="absolute flex h-full w-full flex-col justify-end">
                      <View className="w-full overflow-hidden rounded-t-[50px]">
                        <BlurView cls="px-8 pt-12" style={{ paddingBottom: bottom || 20 }}>
                          <Typography variant="h2" fontWeight="bold">
                            {currentItem.title}
                          </Typography>
                          <Typography variant="p" cls="mt-2 mb-10">
                            {currentItem.description}
                          </Typography>
                          <Button onPress={handleClickContinue} className="bg-black/30" size="lg" variant="outline">
                            Continue
                          </Button>
                        </BlurView>
                      </View>
                    </View>
                  </MotiView>
                )}
              </AnimatePresence>
            </View>
          </MotiView>
        )}
      </AnimatePresence>
    </Portal>
  );
};

export default OnboardingWizard;
