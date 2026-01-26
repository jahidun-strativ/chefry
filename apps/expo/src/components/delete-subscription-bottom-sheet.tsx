import type { FC } from "react";
import { useEffect } from "react";
import { View } from "react-native";

import { api } from "@/utils/api";
import createToast from "@/utils/createToast";
import BottomSheet from "./ui/bottom-sheet";
import { Button } from "./ui/button";
import Typography from "./ui/typography";

interface Props {
  isOpen: boolean;
  username: string;
  unfollowType: "UNFOLLOW" | "CANCEL_SUBSCRIPTION" | null;
  onClose: () => void;
}

const DeleteSubscriptionBottomSheet: FC<Props> = ({ isOpen, onClose, unfollowType, username }) => {
  const { data: user } = api.auth.user.byUsername.useQuery({ username }, { enabled: isOpen });
  const { data: userFollow, isLoading: isLoadingUserFollow } = api.auth.userFollow.get.useQuery(
    { username },
    { enabled: isOpen && !!username },
  );
  const { data: subscription, isLoading: isLoadingSubscription } = api.auth.stripe.subscription.useQuery({ username }, { enabled: isOpen });

  useEffect(() => {
    if (!isLoadingUserFollow && !userFollow?.subscriptionId) onClose();
    if (!!userFollow && isLoadingSubscription && !subscription) onClose();
  }, [userFollow, isLoadingUserFollow, isLoadingSubscription, subscription, onClose]);

  const subscriptionIsCancelled = Boolean(subscription?.cancel_at_period_end);

  const utils = api.useContext();
  const { mutate: deleteSubscription, isLoading: isDeletingSubscription } = api.auth.stripe.deleteSubscription.useMutation({
    onSuccess: async () => {
      const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
      await sleep(2000);
      await Promise.all([
        utils.auth.userFollow.invalidate(),
        utils.auth.stripe.subscription.invalidate(),
        utils.auth.post.invalidate(),
        utils.auth.user.invalidate(),
      ]);
      createToast({
        type: "success",
        message: "Subscription deleted.",
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

  const { mutate: cancelSubscription, isLoading: isCancelingSubscription } = api.auth.stripe.cancelSubscription.useMutation({
    onSuccess: async () => {
      const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
      await sleep(1000);
      await Promise.all([utils.auth.userFollow.invalidate(), utils.auth.stripe.subscription.invalidate(), utils.auth.post.invalidate()]);

      createToast({
        type: "success",
        message: "Subscription cancelled.",
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
    <BottomSheet open={isOpen} onClose={onClose} isLoading={isLoadingUserFollow || isLoadingSubscription}>
      <View className="flex flex-col pb-6">
        {subscription && !subscriptionIsCancelled && unfollowType === "UNFOLLOW" && (
          <>
            <Typography cls="text-center text-xl" fontWeight="bold">
              Unfollow and delete subscription to {user?.username}?
            </Typography>

            <Typography variant="p" cls="mt-2 text-center">
              Are your sure you want to unfollow and delete your subscription to {user?.username}? You can pick between to unfollow the user
              or cacnel the subscription and keep access to star content until{" "}
              {new Intl.DateTimeFormat("sv-SE", { timeStyle: "short", dateStyle: "short" }).format(
                new Date(subscription.current_period_end * 1000),
              )}
              .
            </Typography>
          </>
        )}

        {subscription && subscriptionIsCancelled && unfollowType === "UNFOLLOW" && (
          <>
            <Typography cls="text-center text-xl" fontWeight="bold">
              Delete subscription to {user?.username}?
            </Typography>

            <Typography variant="p" cls="mt-2 text-center">
              Are you sure you want to unfollow and delete your subscription to {user?.username}? You have already cancelled your
              subscription and will have access to star content until{" "}
              {new Intl.DateTimeFormat("sv-SE", { timeStyle: "short", dateStyle: "short" }).format(
                new Date(subscription.current_period_end * 1000),
              )}
              .
            </Typography>
          </>
        )}

        {subscription && !subscriptionIsCancelled && unfollowType === "CANCEL_SUBSCRIPTION" && (
          <>
            <Typography cls="text-center text-xl" fontWeight="bold">
              Cancel subscription to {user?.username}?
            </Typography>

            <Typography variant="p" cls="mt-2 text-center">
              Are your sure you want to cancel your subscription to {user?.username}? You can pick between cancelling your subscription and
              keep aaccess to star content until{" "}
              {new Intl.DateTimeFormat("sv-SE", { timeStyle: "short", dateStyle: "short" }).format(
                new Date(subscription.current_period_end * 1000),
              )}{" "}
              or deleting your subscription and lose access immediately.
            </Typography>
          </>
        )}

        {subscription && subscriptionIsCancelled && unfollowType === "CANCEL_SUBSCRIPTION" && (
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
            isLoading={isCancelingSubscription}
            onPress={() => cancelSubscription({ username })}
          >
            Cancel subscription
          </Button>
        )}

        <Button
          variant="outline"
          cls="mt-2 border border-red-500 bg-black/20"
          textCls="text-red-400"
          size="sm"
          isLoading={isDeletingSubscription}
          onPress={() => deleteSubscription({ username, deleteFollow: unfollowType === "UNFOLLOW" })}
        >
          {unfollowType === "UNFOLLOW" ? "Unfollow and delete subscription" : "Delete subscription"}
        </Button>
      </View>
    </BottomSheet>
  );
};

export default DeleteSubscriptionBottomSheet;
