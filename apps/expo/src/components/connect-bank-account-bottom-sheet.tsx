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

const ConnectBankAccountBottomSheet: FC<Props> = ({ isOpen, onClose }) => {
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

        <Typography variant="h2" fontWeight="bold" cls="mb-4 mt-8 text-center">
          Congratulations!
        </Typography>

        <View className="mb-0">
          <Typography variant="p" cls="text-center text-lg">
            You have been verified!
          </Typography>
        </View>

        <Typography variant="h2" fontWeight="bold" cls="mb-4 mt-8 text-center">
          Connect your Bank Account
        </Typography>

        <View className="mb-8">
          <Typography variant="p" cls="text-center text-lg">
            Now that you have been verified as a star, you need to connect your Bank Accoutn via Stripe in order for fans to subscribe to
            your content. Use the simple onboarding in "Star settings".
          </Typography>
        </View>

        <Button size="lg" variant="gradient" onPress={handleGoToStarSettings}>
          Go to Star Settings
        </Button>
      </View>
    </BottomSheet>
  );
};

export default ConnectBankAccountBottomSheet;
