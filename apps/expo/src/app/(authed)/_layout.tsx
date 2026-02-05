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

  const [setPriceBottomSheetOpen, _openSetPriceBottomSheet, closeSetPriceBottomSheet] = useOpenState();
  const [connectBankAccountBottomSheetOpen, _openConnectBankAccountBottomSheet, closeConnectBankAccountBottomSheet] = useOpenState();

  // COMMENTED OUT: Temporarily disabled to allow new-post page to render
  // const utils = api.useContext();
  // const hasFetchedRef = useRef(false);
  // const userIdRef = useRef<string | null>(null);

  // useEffect(() => {
  //   // Use userId as stable dependency instead of the entire me object
  //   const currentUserId = me?.id ?? null;
    
  //   // Only proceed if we have a user ID and haven't fetched for this user yet
  //   if (!currentUserId || currentUserId === userIdRef.current) {
  //     if (!currentUserId) {
  //       console.log("[AuthedLayout] No user ID available, skipping fetch");
  //     } else {
  //       console.log("[AuthedLayout] Already fetched for this user, skipping");
  //     }
  //     return;
  //   }

  //   // Mark that we're fetching for this user
  //   userIdRef.current = currentUserId;
  //   hasFetchedRef.current = false;
  //   let isMounted = true;
  //   let fetchAborted = false;

  //   const fetch = async () => {
  //     if (!isMounted || fetchAborted) {
  //       console.log("[AuthedLayout] Fetch skipped - component unmounted or aborted");
  //       return;
  //     }

  //     if (hasFetchedRef.current) {
  //       console.log("[AuthedLayout] Fetch already completed for this user, skipping");
  //       return;
  //     }

  //     console.log("[AuthedLayout] Starting data fetch for user:", currentUserId);

  //     try {
  //       console.log("[AuthedLayout] Fetching user data...");
  //       const fetchedMe = await utils.auth.user.me.fetch();
        
  //       if (!isMounted || fetchAborted) {
  //         console.log("[AuthedLayout] Component unmounted after fetching user data");
  //         return;
  //       }

  //       console.log("[AuthedLayout] User data fetched:", { userId: fetchedMe?.id, verified: fetchedMe?.verified });

  //       console.log("[AuthedLayout] Fetching connected account...");
  //       const connectedAccount = await utils.auth.stripe.connectedAccount.fetch();

  //       if (!isMounted || fetchAborted) {
  //         console.log("[AuthedLayout] Component unmounted after fetching connected account");
  //         return;
  //       }

  //       console.log("[AuthedLayout] Connected account fetched:", { hasAccount: !!connectedAccount });

  //       if (fetchedMe?.verified && !connectedAccount) {
  //         console.log("[AuthedLayout] User verified but no connected account - opening bottom sheet");
  //         openConnectBankAccountBottomSheet();
  //         hasFetchedRef.current = true;
  //         return;
  //       }

  //       console.log("[AuthedLayout] Fetching stripe price...");
  //       const stripePrice = await utils.auth.stripe.mySubscriptionPrice.fetch();
        
  //       if (!isMounted || fetchAborted) {
  //         console.log("[AuthedLayout] Component unmounted after fetching stripe price");
  //         return;
  //       }

  //       console.log("[AuthedLayout] Stripe price fetched:", { hasPrice: !!stripePrice });

  //       if (fetchedMe?.verified && !stripePrice) {
  //         console.log("[AuthedLayout] User verified but no stripe price - opening bottom sheet");
  //         openSetPriceBottomSheet();
  //       }

  //       hasFetchedRef.current = true;
  //       console.log("[AuthedLayout] Data fetch completed successfully");
  //     } catch (error: unknown) {
  //       // Ignore CancelledError - it's normal when component unmounts or query is cancelled
  //       if (
  //         error &&
  //         typeof error === "object" &&
  //         "name" in error &&
  //         error.name === "CancelledError"
  //       ) {
  //         console.log("[AuthedLayout] Fetch cancelled (expected on unmount)");
  //         return;
  //       }

  //       // Only log errors if component is still mounted
  //       if (isMounted && !fetchAborted) {
  //         const errorInfo = {
  //           name: error && typeof error === "object" && "name" in error ? String(error.name) : "Unknown",
  //           message: error && typeof error === "object" && "message" in error ? String(error.message) : String(error),
  //           code: error && typeof error === "object" && "code" in error ? String(error.code) : undefined,
  //           stack: error && typeof error === "object" && "stack" in error ? String(error.stack) : undefined,
  //         };

  //         // Check if it's an expected/ignorable error
  //         const isIgnorableError =
  //           errorInfo.name === "AbortError" ||
  //           errorInfo.message.includes("aborted") ||
  //           errorInfo.message.includes("cancelled") ||
  //           errorInfo.message.includes("network") ||
  //           errorInfo.code === "ECONNABORTED";

  //         if (isIgnorableError) {
  //           console.log("[AuthedLayout] Ignoring expected error:", errorInfo.name, errorInfo.message);
  //         } else {
  //           console.error("[AuthedLayout] Error fetching user data:", {
  //             error: errorInfo,
  //             originalError: error,
  //           });
  //         }
  //       }
  //     }
  //   };
    
  //   console.log("[AuthedLayout] User ID available, starting fetch...");
  //   void fetch();

  //   return () => {
  //     console.log("[AuthedLayout] Cleanup - unmounting component");
  //     isMounted = false;
  //     fetchAborted = true;
  //   };
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [me?.id]);

  return (
    <>
      {Platform.OS === "ios" && (
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      )}
      {(Platform.OS === "android" || Platform.OS === "web") && <Slot />}

      <OnboardingWizard open={onboardingWizardOpen} onClose={closeOnboardingWizard} />
      <SetPriceBottomSheet isOpen={setPriceBottomSheetOpen} onClose={closeSetPriceBottomSheet} />
      <ConnectBankAccountBottomSheet isOpen={connectBankAccountBottomSheetOpen} onClose={closeConnectBankAccountBottomSheet} />
    </>
  );
};

export default Layout;
