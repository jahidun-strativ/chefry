import { useState } from "react";
import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { WebViewNavigation } from "react-native-webview";
import WebView from "react-native-webview";
import { LinearGradient } from "expo-linear-gradient";
import * as WebBrowser from "expo-web-browser";
import { Portal } from "@gorhom/portal";
import { AnimatePresence, MotiView } from "moti";

import { api } from "@/utils/api";
import createToast from "@/utils/createToast";
import BottomSheet from "../ui/bottom-sheet";
import { Button } from "../ui/button";
import IconButton from "../ui/icon-button";
import Typography from "../ui/typography";

interface Props {
  open: boolean;
  eventPackageId: string | null;
  onClose: () => void;
}

export function BuyEventPackageBottomSheet({ onClose, open, eventPackageId }: Props) {
  const { data: eventPackage } = api.auth.eventPackage.get.useQuery({ id: eventPackageId || "" }, { enabled: !!eventPackageId && open });

  const { mutateAsync } = api.auth.eventPackage.buy.useMutation();

  const [isBuyingPackage, setIsBuyingPackage] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  const utils = api.useUtils();
  const handleRefetchData = async () => {
    if (!eventPackageId) return;

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    await sleep(2000);

    await utils.auth.eventPackage.invalidate();

    const newEventPackage = await utils.auth.eventPackage.get.fetch({ id: eventPackageId });
    if (newEventPackage && newEventPackage?.boughtBy.length !== 0) {
      createToast({
        type: "success",
        message: `You have now access to the package ${newEventPackage.name}.`,
      });
    }

    setIsBuyingPackage(false);
    onClose();
  };

  const handleBuy = async () => {
    if (!eventPackageId) return;

    setIsBuyingPackage(true);
    try {
      const { url } = await mutateAsync({ id: eventPackageId });
      if (!url) {
        throw new Error("Something went wrong.");
      }

      if (Platform.OS === "ios") {
        await WebBrowser.openBrowserAsync(url, { presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET });
      } else {
        setCheckoutUrl(url);
        return;
      }

      await handleRefetchData();
    } catch (e) {
      await utils.auth.eventPackage.invalidate(), setIsBuyingPackage(false);
      createToast({
        type: "error",
        message: e instanceof Error ? e.message : "Something went wrong.",
      });
    }
  };

  const handleWebViewStateChange = async (state: WebViewNavigation) => {
    if (state.url?.includes("subscription-created")) {
      setCheckoutUrl(null);

      // await handleRefetchData();
    } else if (state.url?.includes("error")) {
      setCheckoutUrl(null);

      await utils.auth.eventPackage.invalidate();

      createToast({
        type: "error",
        message: "Something went wrong.",
      });

      setIsBuyingPackage(false);
      onClose();
    }
  };

  const { top } = useSafeAreaInsets();

  return (
    <>
      <BottomSheet
        open={open}
        onClose={onClose}
        classes={{ content: "flex flex-col items-center justify-center" }}
        isLoading={!eventPackage}
      >
        {eventPackage && (
          <>
            <LinearGradient
              className="h-32 w-32 rounded-[40px] p-0.5"
              colors={["#938DFB", "#9589F6", "#9B7FEA", "#A56ED5", "#B457B8", "#C73993", "#DD1465", "#EB004C"]}
              start={[0.0, 0.0]}
              end={[1.0, 1.0]}
            >
              <LinearGradient
                className="flex h-full w-full flex-col items-center justify-center rounded-[40px] p-3"
                colors={["#666", "#000"]}
              >
                <Typography variant="h3" numberOfLines={2} className="text-center text-base leading-6">
                  {eventPackage.name}
                </Typography>

                <Typography variant="p" className="text-center text-sm">
                  {eventPackage._count.posts} posts
                </Typography>

                <Typography variant="p" className="text-center text-lg" fontWeight="bold">
                  {eventPackage.price / 100} €
                </Typography>
              </LinearGradient>
            </LinearGradient>

            <Typography className="mt-6 text-center" fontWeight="bold" variant="h2">
              {eventPackage.name}
            </Typography>

            <Typography variant="p" className="mb-6 text-center">
              {eventPackage.description}
            </Typography>

            <Button onPress={handleBuy} size="lg" variant="gradient" isLoading={isBuyingPackage}>
              Buy event package
            </Button>

            <View className="h-4" />
          </>
        )}
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
                        setIsBuyingPackage(false);
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
}
