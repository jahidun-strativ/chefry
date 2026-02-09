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
        <View className="max-w-md lg:max-w-lg mx-auto w-full">
          <ButtonBase onPress={openPaymentInfoBottomSheet} className="mb-4 md:mb-5 lg:mb-6 mt-2 md:mt-3 lg:mt-4">
            <Typography cls="underline text-center" fontWeight="medium">
              How do the payments work?
            </Typography>
          </ButtonBase>

          <StarStripeSettingsCard />

          <View className="mt-4 md:mt-5 lg:mt-6 flex w-full flex-col items-center justify-center rounded-2xl border border-white p-6 md:p-8 lg:p-10 pb-4 md:pb-5 lg:pb-6 pt-8 md:pt-10 lg:pt-12">
            <Icon name="check-circle" color="white" size={46} />

            <Typography cls="mb-8 md:mb-10 lg:mb-12 mt-4 md:mt-5 lg:mt-6 text-center text-2xl md:text-3xl lg:text-4xl" fontWeight="medium">
              Verified
            </Typography>

            <Typography cls="mb-2 md:mb-3 lg:mb-4 text-center text-sm md:text-base lg:text-lg" fontWeight="medium">
              Reference number
            </Typography>

            <Typography cls="mb-3 md:mb-4 lg:mb-5 text-center text-3xl md:text-4xl lg:text-5xl" fontWeight="medium">
              {me?.verificationReferenceNumber?.toUpperCase()}
            </Typography>

            <Button onPress={handleCopyVerificationCodeToClipboard} cls="w-20 md:w-24 lg:w-28 mx-auto mb-12 md:mb-14 lg:mb-16" variant="outline" size="xs">
              Copy
            </Button>

            <Button onPress={() => Linking.openURL("mailto:support@startracker.one")} variant="outline" size="sm" cls="w-full">
              Contact admin
            </Button>
          </View>
        </View>
      </MainLayout>
      <PaymentInfoBottomSheet isOpen={paymentInfoBottomSheetOpen} onClose={closePaymentInfoBottomSheet} />
    </>
  );
};

export default StarSettingsPage;
