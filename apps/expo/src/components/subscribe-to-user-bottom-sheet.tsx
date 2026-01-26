import type { FC } from "react";
import { useEffect, useState } from "react";
import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { WebViewNavigation } from "react-native-webview";
import WebView from "react-native-webview";
import * as WebBrowser from "expo-web-browser";
import { WebBrowserPresentationStyle } from "expo-web-browser";
import Icon from "@expo/vector-icons/Feather";
import { Portal } from "@gorhom/portal";
import { AnimatePresence, MotiView } from "moti";

import { api } from "@/utils/api";
import createToast from "@/utils/createToast";
import BottomSheet from "./ui/bottom-sheet";
import { Button } from "./ui/button";
import IconButton from "./ui/icon-button";
import Typography from "./ui/typography";

interface Props {
  isOpen: boolean;
  username: string;
  onClose: () => void;
}

const SubscibeToUserBottomSheet: FC<Props> = ({ isOpen, onClose, username }) => {
  const { data: user } = api.auth.user.byUsername.useQuery({ username }, { enabled: isOpen });
  const { data: canSubscribe, isLoading: isLoadingCanSubscribe } = api.auth.stripe.canSubscribe.useQuery({ username }, { enabled: isOpen });
  const { data: subscriptionPrice, isLoading: isLoadingPrice } = api.auth.stripe.subscriptionPrice.useQuery(
    { username },
    { enabled: isOpen },
  );

  useEffect(() => {
    if (!canSubscribe) onClose();
  }, [canSubscribe, onClose]);

  const { mutateAsync: startSubscription } = api.auth.stripe.startSubscription.useMutation();

  const [isStartingSubscription, setIsStartingSubscription] = useState(false);

  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  const handleRefetchData = async () => {
    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    await sleep(2000);

    await Promise.all([
      utils.auth.userFollow.invalidate(),
      utils.auth.stripe.subscription.invalidate(),
      utils.auth.story.invalidate(),
      utils.auth.user.invalidate(),
      utils.auth.post.invalidate(),
    ]);

    const newUserFollow = await utils.auth.userFollow.get.fetch({ username });
    if (newUserFollow?.type === "STAR_TRACKER") {
      createToast({
        type: "success",
        message: `You are now subscribed to ${user?.username}.`,
      });
    }

    setIsStartingSubscription(false);
    onClose();
  };

  const utils = api.useContext();
  const handleStartSubscription = async () => {
    setIsStartingSubscription(true);
    try {
      const { url } = await startSubscription({ username });
      if (!url) {
        throw new Error("Something went wrong.");
      }

      if (Platform.OS === "ios") {
        await WebBrowser.openBrowserAsync(url, { presentationStyle: WebBrowserPresentationStyle.PAGE_SHEET });
      } else {
        setCheckoutUrl(url);
        return;
      }

      await handleRefetchData();
    } catch (e) {
      await Promise.all([
        utils.auth.userFollow.invalidate(),
        utils.auth.stripe.subscription.invalidate(),
        utils.auth.story.invalidate(),
        utils.auth.user.invalidate(),
        utils.auth.post.invalidate(),
      ]);

      setIsStartingSubscription(false);
      createToast({
        type: "error",
        message: e instanceof Error ? e.message : "Something went wrong.",
      });
    }
  };

  const handleWebViewStateChange = async (state: WebViewNavigation) => {
    if (state.url?.includes("subscription-created")) {
      setCheckoutUrl(null);

      await handleRefetchData();
    } else if (state.url?.includes("error")) {
      setCheckoutUrl(null);

      await Promise.all([
        utils.auth.userFollow.invalidate(),
        utils.auth.stripe.subscription.invalidate(),
        utils.auth.story.invalidate(),
        utils.auth.user.invalidate(),
        utils.auth.post.invalidate(),
      ]);

      setIsStartingSubscription(false);
      createToast({
        type: "error",
        message: "Something went wrong.",
      });

      setIsStartingSubscription(false);
      onClose();
    }
  };

  const { top } = useSafeAreaInsets();

  return (
    <>
      <BottomSheet open={isOpen} onClose={onClose} isLoading={!username || isLoadingCanSubscribe || isLoadingPrice}>
        <View className="flex flex-col pb-6">
          <View className="mb-4 flex items-center justify-center">
            <Icon size={40} name="credit-card" color="white" />
          </View>
          <Typography cls="text-center text-2xl" fontWeight="bold">
            Subscribe to {user?.username}
          </Typography>
          <Typography variant="p" cls="mt-2 text-center">
            {user?.username} is charging {subscriptionPrice}€ per month for their content. You will be charged monthly and can cancel your
            subscription at any time. Once you press the button you will be redirected to Stripe to complete the subscription.
          </Typography>
          <Button variant="gradient" cls="mt-6" size="lg" isLoading={isStartingSubscription} onPress={handleStartSubscription}>
            {`Subscribe (${subscriptionPrice}€/month)`}
          </Button>
        </View>
      </BottomSheet>

      <Portal>
        <AnimatePresence>
          {checkoutUrl && (
            <MotiView
              from={{ opacity: 0, translateY: 100 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0, translateY: 100 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 30,
              }}
              className="absolute inset-0 z-[1001] h-full w-full bg-black"
            >
              <View className="flex h-full flex-col bg-black" style={{ paddingTop: top }}>
                <View className="flex justify-end p-4">
                  <View className="absolute right-2 z-50">
                    <IconButton
                      size="base"
                      onPress={() => {
                        setCheckoutUrl(null);
                        setIsStartingSubscription(false);
                        onClose();
                      }}
                      iconName="x"
                      cls="bg-black/30"
                    />
                  </View>
                </View>
                {checkoutUrl && <WebView source={{ uri: checkoutUrl }} onNavigationStateChange={handleWebViewStateChange} />}
              </View>
            </MotiView>
          )}
        </AnimatePresence>
      </Portal>
    </>
  );
};

export default SubscibeToUserBottomSheet;
