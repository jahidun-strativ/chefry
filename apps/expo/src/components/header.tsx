import type { ComponentProps, FC } from "react";
import { useEffect, useMemo } from "react";
import { Platform, View } from "react-native";
import Animated, { Easing, useAnimatedProps, useAnimatedStyle, useDerivedValue, useSharedValue, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { useNavigation, usePathname, useRouter } from "expo-router";
import type Icon from "@expo/vector-icons/Feather";

import { api } from "@/utils/api";
import { cn } from "@/utils/cn";
import { Logo } from "./logo";
import IconButton from "./ui/icon-button";

interface Props {
  showBackButton?: boolean;
  showProfileButton?: boolean;
  showProfileSettingsButton?: boolean;
  cls?: string;
  blurred?: boolean;
  customActionIconName?: ComponentProps<typeof Icon>["name"];
  onCustomActionPress?: () => void;
}

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

const Header: FC<Props> = ({
  showBackButton,
  blurred,
  cls,
  showProfileButton,
  showProfileSettingsButton,
  customActionIconName,
  onCustomActionPress,
}) => {
  const { data: me } = api.auth.user.me.useQuery();
  const { back, replace, push } = useRouter();
  const { canGoBack } = useNavigation();
  const handleGoBack = () => {
    if (canGoBack()) {
      back();
    } else {
      replace("/");
    }
  };

  const pathname = usePathname();

  const profilePrefix = useMemo(() => {
    if (pathname.includes("/discover")) {
      return "/discover";
    } else if (pathname.includes("/feed")) {
      return "/feed";
    }

    return "";
  }, [pathname]);

  const handleGoToProfile = () => {
    if (pathname === profilePrefix + "/profile") {
      push("/profile-settings");
    } else {
      push(profilePrefix + "/profile");
    }
  };

  const handleGoToSettings = () => {
    push("/profile-settings");
  };

  const blurIntensity = useSharedValue(0);

  useEffect(() => {
    blurIntensity.value = withTiming(blurred ? 50 : 0, {
      duration: 200,
      easing: Easing.out(Easing.linear),
    });
  }, [blurred, blurIntensity]);

  const { top } = useSafeAreaInsets();

  const opacity = useDerivedValue(() => {
    return blurIntensity.value / 50;
  }, [blurIntensity]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const animatedProps = useAnimatedProps(() => {
    return {
      intensity: blurIntensity.value,
    };
  });

  const showCustomAction = !!customActionIconName && !!onCustomActionPress;

  const isDiscoverProfilePage = pathname.includes("/discover/view-profile/");
  const isFeedProfilePage = pathname === "/feed/profile";
  const logoVariant = isDiscoverProfilePage || isFeedProfilePage ? "secondary" : "main";

  return (
    <View
      className={cn("absolute left-0 right-0 top-0 z-10 w-full", cls)}
      style={{
        height: (top || 20) + 80,
      }}
    >
      {Platform.OS === "ios" && (
        <AnimatedBlurView className="absolute h-full w-full" tint="dark" style={animatedStyle} animatedProps={animatedProps} />
      )}

      {Platform.OS !== "ios" && <View className="absolute h-full w-full bg-black/40" style={{ opacity: blurred ? 1 : 0 }} />}

      <View style={{ paddingTop: top }} className="absolute z-10 flex h-full w-full flex-row items-center justify-between px-4 pb-4 pt-2">
        {showBackButton ? <IconButton onPress={handleGoBack} iconName="arrow-left" size="base" /> : <View className="w-10" />}
        <Logo width={200} height={60} variant={logoVariant} />

        {showCustomAction && <IconButton onPress={onCustomActionPress} iconName={customActionIconName} />}

        {!showCustomAction && (
          <>
            {!showProfileButton && !showProfileSettingsButton ? (
              <View className="w-10" />
            ) : (
              <IconButton
                iconName={me?.verified ? (pathname.includes("/profile") ? "settings" : "user") : "settings"}
                size="base"
                onPress={me?.verified ? handleGoToProfile : handleGoToSettings}
              />
            )}
          </>
        )}
      </View>
    </View>
  );
};

export default Header;
