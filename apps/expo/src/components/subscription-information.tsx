import type { FC } from "react";
import { View } from "react-native";

import { api } from "@/utils/api";
import useOpenState from "@/hooks/useOpenState";
import ToggleSubscriptionActiveBottomSheet from "./toggle-subscription-active-bottom-sheet";
import { Button } from "./ui/button";
import Typography from "./ui/typography";

interface Props {
  username: string;
  canSubscribe: boolean;
}

export const SubscriptionInformation: FC<Props> = ({ canSubscribe, username }) => {
  const { data: subscriptionPrice } = api.auth.stripe.subscriptionPrice.useQuery({ username });
  const { data: userFollow } = api.auth.userFollow.get.useQuery({ username });
  const { data: subscription } = api.auth.stripe.subscription.useQuery({ username });

  const [cancelSubscriptionBottomSheetOpen, openCancelSubscriptionBottomSheet, closeCancelSubscriptionBottomSheet] = useOpenState();

  return (
    <>
      {canSubscribe && subscriptionPrice != null && userFollow?.type === "STAR_TRACKER" && subscription && (
        <View className="px-2">
          <View className="flex items-center justify-center rounded-xl border border-white p-4">
            <Typography cls="mb-2 text-lg" fontWeight="medium">
              {!subscription.cancel_at_period_end ? "Active subscription" : "Subscription cancelled"}
            </Typography>
            <Typography cls="mb-5 text-sm text-center">
              {!subscription.cancel_at_period_end && (
                <>
                  You have an active subscription. Your next payment will be on{" "}
                  {new Intl.DateTimeFormat("sv-SE").format(new Date(subscription.current_period_end * 1000))}
                  {/* You will be  {subscriptionPrice}€ on{" "} */}
                </>
              )}

              {subscription.cancel_at_period_end && (
                <>
                  You have cancelled your subscription to {username}. You will be able to access their content until{" "}
                  {new Intl.DateTimeFormat("sv-SE").format(new Date(subscription.current_period_end * 1000))}.
                </>
              )}
            </Typography>

            <Button onPress={openCancelSubscriptionBottomSheet} variant="outline" cls="border px-6 py-2" textCls="text-sm" size="sm">
              {!subscription?.cancel_at_period_end ? "Cancel subscription" : "Resume subscription"}
            </Button>
          </View>
        </View>
      )}

      {/* <SubscibeToUserBottomSheet username={username} isOpen={subscribeBottomSheetOpen} onClose={closeSubscribeBottomSheet} /> */}

      <ToggleSubscriptionActiveBottomSheet
        username={username}
        isOpen={cancelSubscriptionBottomSheetOpen}
        onClose={closeCancelSubscriptionBottomSheet}
      />
    </>
  );
};
