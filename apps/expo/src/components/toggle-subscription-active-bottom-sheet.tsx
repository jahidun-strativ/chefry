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
  onClose: () => void;
}

const ToggleSubscriptionActiveBottomSheet: FC<Props> = ({ isOpen, onClose, username }) => {
  const { data: user } = api.auth.user.byUsername.useQuery({ username }, { enabled: isOpen });
  const { data: userFollow, isLoading: isLoadingUserFollow } = api.auth.userFollow.get.useQuery({ username });
  const { data: subscription, isLoading: isLoadingSubscription } = api.auth.stripe.subscription.useQuery({ username }, { enabled: isOpen });

  useEffect(() => {
    if (!isLoadingUserFollow && !userFollow?.subscriptionId) onClose();
    if (!!userFollow && isLoadingSubscription && !subscription) onClose();
  }, [userFollow, isLoadingUserFollow, isLoadingSubscription, subscription, onClose]);

  const utils = api.useContext();
  const { mutate: cancelSubscription, isLoading: isCancelingSubscription } = api.auth.stripe.cancelSubscription.useMutation({
    onSuccess: async () => {
      const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
      await sleep(1000);
      await Promise.all([
        utils.auth.userFollow.invalidate(),
        utils.auth.stripe.subscription.invalidate(),
        utils.auth.story.invalidate(),
        utils.auth.user.invalidate(),
        utils.auth.post.invalidate(),
      ]);
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

  const { mutate: resumeSubscription, isLoading: isResumingSubscription } = api.auth.stripe.resumeSubscription.useMutation({
    onSuccess: async () => {
      const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
      await sleep(1000);
      await Promise.all([
        utils.auth.userFollow.invalidate(),
        utils.auth.stripe.subscription.invalidate(),
        utils.auth.user.invalidate(),
        utils.auth.story.invalidate(),
        utils.auth.post.invalidate(),
      ]);
      createToast({
        type: "success",
        message: "Subscription resumed.",
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
        {/* <View className="mb-4 flex items-center justify-center">
          <Icon size={40} name="x" color="white" />
        </View> */}
        {subscription && !subscription.cancel_at_period_end && (
          <>
            <Typography cls="text-center text-2xl" fontWeight="bold">
              Cancel subscription to {user?.username}
            </Typography>

            <Typography variant="p" cls="mt-2 text-center">
              Do you want to cancel your subscription to {user?.username}? You will still have access to their content until{" "}
              {new Intl.DateTimeFormat("sv-SE").format(new Date(subscription.current_period_end * 1000))}.
            </Typography>
            <Button
              variant="outline"
              cls="mt-6 border border-red-500 bg-black/20"
              textCls="text-red-400"
              isLoading={isCancelingSubscription}
              onPress={() => cancelSubscription({ username })}
            >
              Cancel subscription
            </Button>
          </>
        )}

        {subscription && subscription.cancel_at_period_end && (
          <>
            <Typography cls="text-center text-2xl" fontWeight="bold">
              Resume subscription to {user?.username}
            </Typography>

            <Typography variant="p" cls="mt-2 text-center">
              Do you want to resume your subscription to {user?.username}?
            </Typography>
            <Button variant="gradient" cls="mt-6" isLoading={isResumingSubscription} onPress={() => resumeSubscription({ username })}>
              Resume subscription
            </Button>
          </>
        )}
      </View>
    </BottomSheet>
  );
};

export default ToggleSubscriptionActiveBottomSheet;
