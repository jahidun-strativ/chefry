import type { FC } from "react";
import { useState } from "react";
import { Platform, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { WebBrowserPresentationStyle } from "expo-web-browser";
import Icon from "@expo/vector-icons/Feather";
import { usePaymentSheet } from "@stripe/stripe-react-native";

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
  // const { mutateAsync: setupCustomer } = api.auth.stripe.setupCustomer.useMutation();

  const [isUpdatingCustomer, setIsUpdatingCustomer] = useState(false);
  const [isUpdatingPaymentMethod, setIsUpdatingPaymentMethod] = useState(false);

  const handleUpdateCustomer = async () => {
    setIsUpdatingCustomer(true);
    try {
      const { url } = await updateCustomer();

      if (!url) throw new Error("Something went wrong.");

      if (Platform.OS === "ios") {
        await WebBrowser.openBrowserAsync(url, { presentationStyle: WebBrowserPresentationStyle.PAGE_SHEET });
      } else {
        await WebBrowser.openAuthSessionAsync(url);
      }

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

  const { initPaymentSheet, presentPaymentSheet } = usePaymentSheet();
  const { mutateAsync: setupDefaultPayment } = api.auth.stripe.setupDefaultPaymentMethod.useMutation();
  const handleSetDefaultPaymentMethod = async () => {
    setIsUpdatingPaymentMethod(true);
    try {
      const { customerId, ephemeralKey, setupIntent } = await setupDefaultPayment();

      const { error: initPaymentError } = await initPaymentSheet({
        merchantDisplayName: "Star Tracker",
        customerId: customerId,
        customerEphemeralKeySecret: ephemeralKey,
        setupIntentClientSecret: setupIntent!,
      });

      if (initPaymentError) {
        throw new Error(initPaymentError?.message ?? "Something went wrong.");
      }

      const { error: setupPaymentError } = await presentPaymentSheet();

      if (setupPaymentError) {
        throw new Error(setupPaymentError?.message ?? "Something went wrong.");
      }

      setIsUpdatingPaymentMethod(false);
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
      {/* {stripeCustomer?.invoice_settings?.default_payment_method && ( */}
      <View className="mt-8 flex w-full flex-col items-center justify-center rounded-2xl border border-white p-8 pb-4">
        <Icon name="check-circle" size={50} color="white" />
        <Typography fontWeight="bold" cls="mt-3 text-center text-2xl">
          {stripeCustomer?.invoice_settings?.default_payment_method ? "Payment method connected" : "No payment method connected"}
        </Typography>

        <Typography cls="mt-3 text-center text-lg">
          {stripeCustomer?.invoice_settings?.default_payment_method
            ? "Click the button below to manage subscriptions and payment methods."
            : "You can now subscribe to stars in the app. Click the button below to manage subscriptions and payment methods."}
          {/* You can now subscribe to stars in the app. Click the button below to manage subscriptions and payment methods. */}
        </Typography>

        <Button isLoading={isUpdatingCustomer} onPress={handleUpdateCustomer} variant="outline" size="sm" cls="mt-8 w-full">
          Manage account
        </Button>
        {/* <Button isLoading={isUpdatingPaymentMethod} onPress={handleSetDefaultPaymentMethod} variant="outline" size="sm" cls="mt-2 w-full">
          Set payment method
        </Button> */}
      </View>
      {/* )} */}

      {/* {stripeCustomer && !stripeCustomer?.invoice_settings?.default_payment_method && (
        <View className="mt-8 flex w-full flex-col items-center justify-center rounded-2xl border border-white p-8 pb-4">
          <Icon name="info" size={50} color="white" />
          <Typography fontWeight="bold" cls="mt-3 text-center text-2xl">
            No payment method connected
          </Typography>
          <Typography cls="mt-3 text-center text-lg">
            You need to connect a payment method to be able to subscribe to stars in the app.
          </Typography>

          <Button onPress={handleAddPaymentMethod} variant="outline" size="sm" cls="mt-8 w-full">
            Add payment method
          </Button>
        </View>
      )} */}

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
