import type { ComponentProps, FC, PropsWithChildren, ReactNode } from "react";
import { useEffect, useState } from "react";
import { Keyboard, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type Icon from "@expo/vector-icons/Feather";
import clsx from "clsx";
import { AnimatePresence, MotiView } from "moti";

import useScrollTracker from "@/hooks/useScrollTracker";
import GradientBackground from "./gradient-background";
import Header from "./header";
import LoadingPage from "./ui/loading-page";
import Typography from "./ui/typography";

interface Props extends PropsWithChildren {
  title?: string;
  kicker?: string;
  description?: string | ReactNode;
  isScrolled?: boolean;
  contentType?: "scrollable" | "fixed" | "custom";
  showBackButton?: boolean;
  classes?: { root?: string; content?: string };
  floatingButton?: ReactNode;
  // showProfileSettingsButton?: boolean;
  showProfileButton?: boolean;
  isLoading?: boolean;
  customActionIconName?: ComponentProps<typeof Icon>["name"];
  onCustomActionPress?: () => void;
}

const MainLayout: FC<Props> = ({
  children,
  title,
  isScrolled,
  kicker,
  description,
  contentType = "fixed",
  showBackButton,
  showProfileButton,
  isLoading,
  floatingButton,
  customActionIconName,
  onCustomActionPress,
  classes = {},
}) => {
  const content = (
    <>
      {(!!kicker || !!title || !!description) && (
        <View className="mb-2 mt-3">
          {kicker && (
            <Typography cls="text-center uppercase mb-2 " variant="h3" style={{ letterSpacing: 4 }}>
              {kicker}
            </Typography>
          )}

          {title && (
            <Typography cls="text-center" variant="h2">
              {title}
            </Typography>
          )}

          {description && (
            <Typography variant="p" cls="mt-4 text-base text-center">
              {description}
            </Typography>
          )}
        </View>
      )}
      {children}
    </>
  );

  const { top, bottom } = useSafeAreaInsets();
  const paddingTop = (top || 20) + 80;
  const paddingBottom = bottom || 20;

  const [contentIsScrolled, onScroll] = useScrollTracker();

  const [keyboardStatus, setKeyboardStatus] = useState<"hidden" | "shown">("hidden");

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardStatus("shown");
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardStatus("hidden");
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return (
    <GradientBackground>
      {/* <SafeAreaView className="flex-1"> */}
      {isLoading && (
        <MotiView key="loading" className="absolute inset-0 h-full" animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <LoadingPage />
        </MotiView>
      )}

      <AnimatePresence>
        {!isLoading && (
          <MotiView key="content" className="flex h-full flex-1 flex-col" from={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {contentType === "scrollable" && (
              <KeyboardAwareScrollView
                scrollEventThrottle={16}
                enableOnAndroid
                onScroll={onScroll}
                enableAutomaticScroll
                className={clsx("flex-1 px-4", classes.content)}
                style={{
                  paddingTop,
                }}
              >
                {content}
                <View className="h-64" />
              </KeyboardAwareScrollView>
            )}

            {contentType === "fixed" && (
              <View
                className={clsx("flex-1 px-6", classes.content)}
                style={{
                  paddingTop,
                  paddingBottom,
                }}
              >
                {content}
              </View>
            )}

            {contentType === "custom" && children}

            {floatingButton && keyboardStatus === "hidden" && (
              <View style={{ bottom: paddingBottom }} className="absolute left-4 right-4 z-10 flex flex-row items-center justify-center">
                {floatingButton}
              </View>
            )}
          </MotiView>
        )}
      </AnimatePresence>

      <Header
        showBackButton={showBackButton}
        blurred={isScrolled ?? contentIsScrolled}
        showProfileButton={showProfileButton}
        onCustomActionPress={onCustomActionPress}
        customActionIconName={customActionIconName}
        // cls="absolute top-0 left-0 right-0 pt-14 z-10 bg-red-500"
      />
      {/* </SafeAreaView> */}
    </GradientBackground>
  );
};

export default MainLayout;
