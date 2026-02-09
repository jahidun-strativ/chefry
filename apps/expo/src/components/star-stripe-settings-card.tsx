import type { FC } from "react";
import { useMemo, useState } from "react";
import { Platform, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { WebBrowserPresentationStyle } from "expo-web-browser";
import Icon from "@expo/vector-icons/Feather";

import { api } from "@/utils/api";
import { cn } from "@/utils/cn";
import createToast from "@/utils/createToast";
import useOpenState from "@/hooks/useOpenState";
import SetSubscriptionPriceModal from "./set-subscription-price-modal";
import { Button } from "./ui/button";
import Spinner from "./ui/spinner";
import Typography from "./ui/typography";

const StarStripeSettingsCard: FC = () => {
  const { data: me, refetch: refetchMe } = api.auth.user.me.useQuery();
  const {
    data: connectedStripeAccount,
    refetch: refetchConnectedStripeAccount,
    isLoading: isLoadingConnectedAccount,
  } = api.auth.stripe.connectedAccount.useQuery();
  const { data: stripePrice, isLoading: isLoadingStripePrice } = api.auth.stripe.mySubscriptionPrice.useQuery();

  const connectedStripeAccountActive =
    connectedStripeAccount?.capabilities?.card_payments === "active" && connectedStripeAccount?.capabilities?.transfers === "active";

  const monthlyPrice = useMemo(() => {
    if (stripePrice && stripePrice.unit_amount && stripePrice.unit_amount_decimal) {
      return stripePrice.unit_amount / 100;
    }

    return null;
  }, [stripePrice]);

  const [setPriceModalOpen, openSetPriceModal, closeSetPriceModal] = useOpenState();

  const { mutateAsync: updateConnectedAccount } = api.auth.stripe.updateConnectedAccount.useMutation();
  const { mutateAsync: createConnectedAccount } = api.auth.stripe.createConnectedAccount.useMutation({
    onSettled: () => refetchMe(),
  });

  const [isCreatingConnectedAccount, setIsCreatingConnectedAccount] = useState(false);
  const handleCreateConnectedStripeAccount = async () => {
    if (isLoadingConnectedAccount) {
      return;
    }

    if (connectedStripeAccount?.capabilities?.card_payments === "active" && connectedStripeAccount?.capabilities.transfers === "active") {
      return;
    }

    setIsCreatingConnectedAccount(true);
    try {
      const { url } = await createConnectedAccount();
      if (!url) throw new Error("Something went wrong.");

      if (Platform.OS === "ios") {
        await WebBrowser.openBrowserAsync(url, { presentationStyle: WebBrowserPresentationStyle.PAGE_SHEET });
      } else {
        await WebBrowser.openAuthSessionAsync(url);
      }

      await refetchConnectedStripeAccount();

      setIsCreatingConnectedAccount(false);
    } catch (e) {
      setIsCreatingConnectedAccount(false);
      createToast({
        type: "error",
        message: e instanceof Error ? e.message : "Something went wrong.",
      });
    }
  };

  const [isUpdatingConnectedAccount, setIsUpdatingConnectedAccount] = useState(false);
  const handleUpdateConnectedAccount = async () => {
    setIsUpdatingConnectedAccount(true);
    try {
      const { url } = await updateConnectedAccount();

      if (!url) throw new Error("Something went wrong.");

      if (Platform.OS === "ios") {
        await WebBrowser.openBrowserAsync(url, { presentationStyle: WebBrowserPresentationStyle.PAGE_SHEET });
      } else {
        await WebBrowser.openAuthSessionAsync(url);
      }

      await refetchConnectedStripeAccount();

      setIsUpdatingConnectedAccount(false);
    } catch (e) {
      setIsUpdatingConnectedAccount(false);
      createToast({
        type: "error",
        message: e instanceof Error ? e.message : "Something went wrong.",
      });
    }
  };

  const cardClass = "mt-4 md:mt-5 lg:mt-6 flex w-full flex-col items-center justify-center rounded-2xl border border-white p-6 md:p-8 lg:p-10 pb-4 md:pb-5 lg:pb-6 pt-6 md:pt-8 lg:pt-10 max-w-md lg:max-w-lg mx-auto";

  if (isLoadingConnectedAccount || isLoadingStripePrice) {
    return (
      <View className={cn(cardClass, "h-32 p-12")}>
        <Spinner size={32} />
      </View>
    );
  }

  if (!connectedStripeAccount || (connectedStripeAccount && !connectedStripeAccountActive)) {
    return (
      <View className={cardClass}>
        <Icon name="alert-circle" size={50} color="white" />
        <Typography fontWeight="medium" cls="mb-3 md:mb-4 lg:mb-5 mt-4 md:mt-5 lg:mt-6 text-center text-xl md:text-2xl lg:text-3xl">
          {connectedStripeAccount ? "Finish account creation" : "No account connected"}
        </Typography>
        <Typography variant="p" cls="mb-6 md:mb-8 lg:mb-10 text-center text-base md:text-lg lg:text-xl">
          {connectedStripeAccount && (
            <>
              You&apos;ve started the process of connecting your account. Please finish the process to allow followers to become Star
              Trackers.
            </>
          )}
          {!connectedStripeAccount && (
            <>
              Connect yourself via Stripe to allow followers to become Star Trackers. You&apos;ll then receive weekly payouts based on your
              Star Tracker earnings.
            </>
          )}
        </Typography>
        <Button
          onPress={handleCreateConnectedStripeAccount}
          isLoading={isCreatingConnectedAccount}
          cls="w-full bg-black/20"
          size="sm"
          variant="outline"
        >
          {connectedStripeAccount ? "Connect your account" : "Finish account creation"}
        </Button>
      </View>
    );
  }

  return (
    <>
      <View className={cardClass}>
        <Typography cls="mb-6 md:mb-8 lg:mb-10 text-center text-2xl md:text-3xl lg:text-4xl" fontWeight="medium">
          General subscription
        </Typography>

        {monthlyPrice != null && (
          <>
            <Typography cls="text-center text-base md:text-lg lg:text-xl mb-1.5 md:mb-2 lg:mb-3" fontWeight="medium">
              Price per month
            </Typography>
            <Typography cls="text-center text-3xl md:text-4xl lg:text-5xl mb-3 md:mb-4 lg:mb-5" fontWeight="medium">
              {monthlyPrice}€
            </Typography>
            <Button cls="mt-4 md:mt-5 lg:mt-6 w-full bg-black/20" size="sm" variant="outline" onPress={openSetPriceModal}>
              Update price
            </Button>
          </>
        )}

        {monthlyPrice == null && (
          <>
            <Typography cls="text-center text-xl md:text-2xl lg:text-3xl mb-1.5 md:mb-2 lg:mb-3" fontWeight="medium">
              No price set
            </Typography>
            <Typography cls="text-center text-base md:text-lg lg:text-xl mb-3 md:mb-4 lg:mb-5" fontWeight="medium">
              Set a price to start accepting subscriptions and earning money from your followers.
            </Typography>
            <Button cls="mt-4 md:mt-5 lg:mt-6 w-full bg-black/20" size="sm" variant="outline" onPress={openSetPriceModal}>
              Set price
            </Button>
          </>
        )}

        <Button
          cls="mt-2 md:mt-3 lg:mt-4 w-full bg-black/20"
          size="sm"
          variant="outline"
          onPress={handleUpdateConnectedAccount}
          isLoading={isUpdatingConnectedAccount}
        >
          Account settings
        </Button>
      </View>
      <SetSubscriptionPriceModal isOpen={setPriceModalOpen} onClose={closeSetPriceModal} />
    </>
  );
};

export default StarStripeSettingsCard;
