import { default as React, useEffect, useState } from "react";

import "react-native-gesture-handler";
import "../styles.css";

// import "react-native-reanimated";

// export default function RootLayout() {
//   return (
//     <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }} className="bg-red-500">
//       <Text>Hello</Text>
//     </View>
//   );
// }

import { Platform } from "react-native";
import { ClickOutsideProvider } from "react-native-click-outside";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { RootSiblingParent } from "react-native-root-siblings";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as NavigationBar from "expo-navigation-bar";
import { Slot, SplashScreen, usePathname, useRouter, useSegments } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { setStatusBarStyle, StatusBar } from "expo-status-bar";
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import type { TokenCache } from "@clerk/clerk-expo/dist/cache";
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, useFonts } from "@expo-google-fonts/inter";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { PortalProvider } from "@gorhom/portal";

import { RegisterPushNotifications } from "@/components/register-push-notifications";
import { StripeWrapper } from "@/components/stripe-wrapper";
import PWAInstallPrompt from "@/components/pwa-install-prompt";
// import OAuthDebug from "@/components/oauth-debug";
import { api, TRPCProvider } from "../utils/api";

void SplashScreen.preventAutoHideAsync();

const tokenCache: TokenCache = {
  getToken(key) {
    return new Promise<string | null>((resolve, reject) => {
      SecureStore.getItemAsync(key)
        .then((value) => {
          resolve(value);
        })
        .catch(() => {
          reject();
        });
    });
  },
  saveToken(key, value) {
    return new Promise<void>((resolve, reject) => {
      SecureStore.setItemAsync(key, value)
        .then(() => {
          resolve();
        })
        .catch(() => {
          reject();
        });
    });
  },
};

const RootLayout = () => {
  const { isLoaded: authIsLoaded, isSignedIn, userId } = useAuth();
  const { replace } = useRouter();
  const segments = useSegments();

  // useEffect(() => {
  //   void signOut();
  // }, [signOut]);

  const { data: user, error: networkError, isLoading } = api.auth.user.me.useQuery(undefined, { enabled: !!userId && isSignedIn });
  const userIsLoading = isLoading && !!userId;

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    void setStatusBarStyle("light");
    if (Platform.OS === "android") {
      void NavigationBar.setBackgroundColorAsync("#000000");
      void NavigationBar.setButtonStyleAsync("dark");
      // void NavigationBar.setPositionAsync("absolute");
    }

    // TODO add this again
    // void SystemUI.setBackgroundColorAsync("black");

    if (fontsLoaded && authIsLoaded && (!userIsLoading || !!networkError)) {
      void SplashScreen.hideAsync();
      setInitialized(true);
    }
  }, [fontsLoaded, authIsLoaded, userIsLoading, networkError]);

  const utils = api.useContext();

  // useEffect(() => {
  //   if (isSignedIn) {
  //     utils
  //       .invalidate(undefined, undefined, { cancelRefetch: true })
  //       .then(() => null)
  //       .catch(() => null);
  //   }
  // }, [isSignedIn, utils]);

  const pathname = usePathname();

  useEffect(() => {
    if (!initialized) {
      return;
    }

    const error = isSignedIn && userId ? networkError : undefined;
    if (error && segments[0] !== "network-error") {
      replace("/network-error");
      return;
    } else if (segments[0] === "network-error" && !error) {
      replace("/");
      return;
    }

    if (!authIsLoaded || userIsLoading || !!networkError) return;

    const group = segments[0];
    const inAuthGroup = segments[0] === "(authed)" || segments[0] === "(account-setup)";

    // const inUnauthGroup = segments[0] === "(unauthed)";
    if (isSignedIn) {
      if (!user) {
        if (!segments.includes("accept-terms")) replace("/accept-terms");
      } else if (!user.interestsSet) {
        if (!segments.includes("select-interests")) replace("/select-interests");
      } else if (group !== "(authed)") {
        if (!segments.includes("feed")) {
          replace("/feed");
        }
      }
      // else if (user.type === "STAR" && group !== "(authed)") {
      //   if (!segments.includes("my-profile")) replace("/my-profile");
      // }
    } else if (!isSignedIn && (inAuthGroup || group == null)) {
      replace("/start");
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, userId, authIsLoaded, user, replace, networkError, userIsLoading, utils, pathname, fontsLoaded, initialized]);

  // if (!fontsLoaded) {
  //   return null;
  // }
// console.log({checking:'handled'});

  return (
    <ClickOutsideProvider>
      <GestureHandlerRootView>
        <SafeAreaProvider>
          <RootSiblingParent>
            <PortalProvider>
              <BottomSheetModalProvider>
                <RegisterPushNotifications />
                <PWAInstallPrompt />
                {/* <OAuthDebug /> */}
                <Slot />
              </BottomSheetModalProvider>
            </PortalProvider>
          </RootSiblingParent>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ClickOutsideProvider>
  );
};

const RootLayoutWrapper = () => {
  // console.log({keyyyyyy: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY as string});
  
  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      tokenCache={tokenCache}
      signInFallbackRedirectUrl={process.env.EXPO_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL || "/"}
      signUpFallbackRedirectUrl={process.env.EXPO_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL || "/"}
      signInForceRedirectUrl={process.env.EXPO_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL || "/"}
      signUpForceRedirectUrl={process.env.EXPO_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL || "/"}
    >
      <TRPCProvider>
        <StripeWrapper>
          <RootLayout />
          <StatusBar style="light" translucent />
        </StripeWrapper>
      </TRPCProvider>
    </ClerkProvider>
  );
};

export default RootLayoutWrapper;
