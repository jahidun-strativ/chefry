import type { FC } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";

import { Logo } from "./logo";
import BottomSheet from "./ui/bottom-sheet";
import { Button } from "./ui/button";
import Typography from "./ui/typography";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const SetPriceBottomSheet: FC<Props> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const handleGoToStarSettings = () => {
    onClose();
    router.push("/profile-settings/star-settings");
  };

  return (
    <BottomSheet open={isOpen} onClose={onClose}>
      <View className="flex flex-col px-2 pb-12">
        <View className="flex items-center justify-center">
          <Logo width={180} height={50} />
        </View>

        <Typography variant="h2" fontWeight="bold" cls="mb-4 mt-4 text-center">
          Set your price
        </Typography>

        <View className="mb-8">
          <Typography variant="p" cls="text-center text-lg">
            Now that your bank account is all set up, the final step to start earning with your content is to set the price of your
            subscription
          </Typography>
        </View>

        <Button size="lg" variant="gradient" onPress={handleGoToStarSettings}>
          Set price
        </Button>
      </View>
    </BottomSheet>
  );
};

export default SetPriceBottomSheet;
