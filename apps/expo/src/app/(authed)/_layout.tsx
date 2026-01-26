import type { FC } from "react";
import { useEffect } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { Slot, Stack } from "expo-router";

import { api } from "@/utils/api";
import ConnectBankAccountBottomSheet from "@/components/connect-bank-account-bottom-sheet";
import OnboardingWizard from "@/components/onboarding-wizard";
import SetPriceBottomSheet from "@/components/set-price-bottom-sheet";
import useOpenState from "@/hooks/useOpenState";

const Layout: FC = () => {
  const [onboardingWizardOpen, openOnboardingWizard, closeOnboardingWizard] = useOpenState();

  const { data: me } = api.auth.user.me.useQuery();

  useEffect(() => {
    if (me && !me.wizardCompleted) {
      openOnboardingWizard();
    }

    if (me && Platform.OS !== "web") {
      void Notifications.setBadgeCountAsync(0);
    }
  }, [me, openOnboardingWizard]);

  const [setPriceBottomSheetOpen, openSetPriceBottomSheet, closeSetPriceBottomSheet] = useOpenState();
  const [connectBankAccountBottomSheetOpen, openConnectBankAccountBottomSheet, closeConnectBankAccountBottomSheet] = useOpenState();

  const utils = api.useContext();
  useEffect(() => {
    let isMounted = true;

    const fetch = async () => {
      try {
        const me = await utils.auth.user.me.fetch();
        if (!isMounted) return;

        const connectedAccount = await utils.auth.stripe.connectedAccount.fetch();
        if (!isMounted) return;

        if (me?.verified && !connectedAccount) {
          openConnectBankAccountBottomSheet();
          return;
        }

        const stripePrice = await utils.auth.stripe.mySubscriptionPrice.fetch();
        if (!isMounted) return;

        if (me?.verified && !stripePrice) {
          openSetPriceBottomSheet();
        }
      } catch (error: unknown) {
        // Ignore CancelledError - it's normal when component unmounts or query is cancelled
        if (error && typeof error === "object" && "name" in error && error.name === "CancelledError") {
          return;
        }
        // Log other errors but don't throw
        console.warn("Error fetching user data:", error);
      }
    };
    void fetch();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {Platform.OS === "ios" && (
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      )}
      {Platform.OS === "android" && <Slot />}

      <OnboardingWizard open={onboardingWizardOpen} onClose={closeOnboardingWizard} />
      <SetPriceBottomSheet isOpen={setPriceBottomSheetOpen} onClose={closeSetPriceBottomSheet} />
      <ConnectBankAccountBottomSheet isOpen={connectBankAccountBottomSheetOpen} onClose={closeConnectBankAccountBottomSheet} />
    </>
  );
};

export default Layout;
