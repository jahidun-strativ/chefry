import type { FC } from "react";
import { View } from "react-native";

import type { RouterOutputs } from "@/utils/api";
import { api } from "@/utils/api";
import createToast from "@/utils/createToast";
import BottomSheet from "./ui/bottom-sheet";
import { Button } from "./ui/button";
import Typography from "./ui/typography";

interface Props {
  isOpen: boolean;
  subscription: RouterOutputs["auth"]["user"]["mySubscriptions"][number] | null;
  onClose: () => void;
}

const DeleteSubscriptionBottomSheet: FC<Props> = ({ isOpen, onClose, subscription }) => {
  const subscriptionIsCancelled = Boolean(subscription?.cancel_at_period_end);
  const user = subscription?.userFollow.followedUser;

  const utils = api.useContext();
  const { mutate: cancelSubscription, isLoading: isCancelingSubscription } = api.auth.stripe.cancelSubscriptionById.useMutation({
    onSuccess: async () => {
      const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
      await sleep(2000);
      await Promise.all([
        utils.auth.userFollow.invalidate(),
        utils.auth.stripe.subscription.invalidate(),
        utils.auth.user.mySubscriptions.invalidate(),
        utils.auth.post.invalidate(),
        utils.auth.user.invalidate(),
      ]);
      createToast({
        type: "success",
        message: "Subscription canceled.",
      });
      onClose();
    },
    onError: (e) => {
      createToast({
        type: "error",
        message: "Something went wrong.",
      });
    },
  });

  return (
    <BottomSheet open={isOpen} onClose={onClose} isLoading={!subscription}>
      {subscription && (
        <>
          <View className="flex flex-col pb-6">
            {subscription && !subscriptionIsCancelled && (
              <>
                <Typography cls="text-center text-xl" fontWeight="bold">
                  Cancel subscription to {user?.username}?
                </Typography>

                <Typography variant="p" cls="mt-2 text-center">
                  Are your sure you want to cancel your subscription to {user?.username}? You can pick between cancelling your subscription
                  and keep aaccess to star content until{" "}
                  {new Intl.DateTimeFormat("sv-SE", { timeStyle: "short", dateStyle: "short" }).format(
                    new Date(subscription.current_period_end * 1000),
                  )}{" "}
                  or deleting your subscription and lose access immediately.
                </Typography>
              </>
            )}

            {subscription && subscriptionIsCancelled && (
              <>
                <Typography cls="text-center text-xl" fontWeight="bold">
                  Delete subscription to {user?.username}?
                </Typography>

                <Typography variant="p" cls="mt-2 text-center">
                  You have already cancelled your subscription to {user?.username} but will still have access to star content until{" "}
                  {new Intl.DateTimeFormat("sv-SE", { timeStyle: "short", dateStyle: "short" }).format(
                    new Date(subscription.current_period_end * 1000),
                  )}
                  . Do you want to delete the subscription and lose access to star content immediately?
                </Typography>
              </>
            )}

            <View className="h-4" />

            {subscription && !subscriptionIsCancelled && (
              <Button
                variant="outline"
                cls="mt-2 border border-red-500 bg-black/20"
                textCls="text-red-400"
                size="sm"
                disabled={isCancelingSubscription}
                onPress={() => cancelSubscription({ subscriptionId: subscription.id })}
              >
                Cancel subscription
              </Button>
            )}

            <Button
              variant="outline"
              cls="mt-2 border border-red-500 bg-black/20"
              textCls="text-red-400"
              size="sm"
              disabled={isCancelingSubscription}
              onPress={() => cancelSubscription({ subscriptionId: subscription.id, deleteSubscription: true })}
            >
              Delete subscription
            </Button>
          </View>
        </>
      )}
    </BottomSheet>
  );
};

export default DeleteSubscriptionBottomSheet;
