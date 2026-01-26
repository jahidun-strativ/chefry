import type { FC } from "react";
import { useEffect } from "react";
import { View } from "react-native";
import * as Clipboard from "expo-clipboard";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import Icon from "@expo/vector-icons/Feather";

import { api } from "@/utils/api";
import createToast from "@/utils/createToast";
import MainLayout from "@/components/main-layout";
import PaymentInfoBottomSheet from "@/components/payment-info-bottom-sheet";
import StarStripeSettingsCard from "@/components/star-stripe-settings-card";
import { Button } from "@/components/ui/button";
import ButtonBase from "@/components/ui/button-base";
import Typography from "@/components/ui/typography";
import useOpenState from "@/hooks/useOpenState";

const StarSettingsPage: FC = () => {
  const { data: me } = api.auth.user.me.useQuery();

  const handleCopyVerificationCodeToClipboard = () => {
    if (me?.verificationReferenceNumber) {
      void Clipboard.setStringAsync(me?.verificationReferenceNumber);
      createToast({
        type: "success",
        message: "Reference number copied to clipboard!",
      });
    }
  };

  const { replace } = useRouter();
  useEffect(() => {
    if (me && !me.verified) {
      replace("/profile-settings");
    }
  }, [me, replace]);

  const [paymentInfoBottomSheetOpen, openPaymentInfoBottomSheet, closePaymentInfoBottomSheet] = useOpenState();

  return (
    <>
      <MainLayout showBackButton contentType="scrollable" title="Star settings" isLoading={!me} classes={{ content: "px-4" }}>
        <ButtonBase onPress={openPaymentInfoBottomSheet} className="mb-4 mt-2">
          <Typography cls="underline text-center" fontWeight="medium">
            How do the payments work?
          </Typography>
        </ButtonBase>

        <StarStripeSettingsCard />

        <View className="mt-4 flex w-full flex-col items-center justify-center rounded-2xl border border-white p-6 pb-4 pt-8">
          <Icon name="check-circle" color="white" size={46} />

          <Typography cls="mb-8 mt-4 text-center text-2xl" fontWeight="medium">
            Verified
          </Typography>

          <Typography cls="mb-2 text-center text-sm" fontWeight="medium">
            Reference number
          </Typography>

          <Typography cls="mb-3 text-center text-3xl" fontWeight="medium">
            {me?.verificationReferenceNumber?.toUpperCase()}
          </Typography>

          <Button onPress={handleCopyVerificationCodeToClipboard} cls="w-20 mx-auto mb-12" variant="outline" size="xs">
            Copy
          </Button>

          <Button onPress={() => Linking.openURL("mailto:support@startracker.one")} variant="outline" size="sm" cls="w-full">
            Contact admin
          </Button>
        </View>
      </MainLayout>
      <PaymentInfoBottomSheet isOpen={paymentInfoBottomSheetOpen} onClose={closePaymentInfoBottomSheet} />
    </>
  );
};

export default StarSettingsPage;
