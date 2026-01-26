import type { FC } from "react";
import { useState } from "react";
import { Platform, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { WebBrowserPresentationStyle } from "expo-web-browser";
import Icon from "@expo/vector-icons/Feather";

import { api } from "@/utils/api";
import createToast from "@/utils/createToast";
import MainLayout from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import Typography from "@/components/ui/typography";

const FinancialSetupPage: FC = () => {
  const params = useLocalSearchParams() as { allowBack?: string };

  const { data: me, refetch: refetchMe } = api.auth.user.me.useQuery();
  const {
    data: stripeCustomer,
    isLoading: isLoadingStripeCustomer,
    refetch: refetchCustomer,
  } = api.auth.stripe.getCustomer.useQuery(undefined, {
    enabled: !!me,
  });

  const { mutateAsync: updateCustomer } = api.auth.stripe.updateCustomer.useMutation();

  const [isUpdatingCustomer, setIsUpdatingCustomer] = useState(false);

  const handleUpdateCustomer = async () => {
    setIsUpdatingCustomer(true);
    try {
      const { url } = await updateCustomer();

      if (!url) throw new Error("Something went wrong.");

      // On web, open in a new window/tab
      window.open(url, "_blank");

      await Promise.all([refetchCustomer(), refetchMe()]);

      setIsUpdatingCustomer(false);
    } catch (e) {
      setIsUpdatingCustomer(false);
      createToast({
        type: "error",
        message: e instanceof Error ? e.message : "Something went wrong.",
      });
    }
  };

  return (
    <MainLayout
      showBackButton={params.allowBack !== "false"}
      title="Financial setup"
      isLoading={!me || isLoadingStripeCustomer}
      classes={{ content: "px-6" }}
    >
      <View className="mt-8 flex w-full flex-col items-center justify-center rounded-2xl border border-white p-8 pb-4">
        <Icon name="check-circle" size={50} color="white" />
        <Typography fontWeight="bold" cls="mt-3 text-center text-2xl">
          {stripeCustomer?.invoice_settings?.default_payment_method ? "Payment method connected" : "No payment method connected"}
        </Typography>

        <Typography cls="mt-3 text-center text-lg">
          {stripeCustomer?.invoice_settings?.default_payment_method
            ? "Click the button below to manage subscriptions and payment methods."
            : "You can now subscribe to stars in the app. Click the button below to manage subscriptions and payment methods."}
        </Typography>

        <Button isLoading={isUpdatingCustomer} onPress={handleUpdateCustomer} variant="outline" size="sm" cls="mt-8 w-full">
          Manage account
        </Button>
      </View>

      {!stripeCustomer && (
        <View className="mt-8 w-full rounded-2xl border border-white p-8 pb-4">
          <Icon name="alert-triangle" size={50} color="white" />
          <Typography fontWeight="medium" cls="mb-3 text-center text-xl">
            Something went wrong
          </Typography>
          <Typography variant="p" cls="mb-6 text-center">
            Something went wrong when trying to connect your payment method. Please try again.
          </Typography>
          <Button onPress={() => void refetchCustomer()} variant="outline" size="sm">
            Try again
          </Button>
        </View>
      )}
    </MainLayout>
  );
};

export default FinancialSetupPage;
