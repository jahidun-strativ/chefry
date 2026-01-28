import { useState } from "react";
import { Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { isClerkAPIResponseError, useOAuth } from "@clerk/clerk-expo";
import type { OAuthStrategy } from "@clerk/types";

import createToast from "@/utils/createToast";
import useWarmUpBrowser from "./useWarmUpBrowser";

WebBrowser.maybeCompleteAuthSession();

const useOAuthSignIn = (strategy: OAuthStrategy) => {
  useWarmUpBrowser();

  const { startOAuthFlow } = useOAuth({ strategy });

  const [authActive, setAuthActive] = useState(false);
  
  const signIn = async () => {
    setAuthActive(true);
    try {
      let oAuthResult;
      
      // For web platforms, especially iOS, we need special handling
      if (Platform.OS === "web" && typeof window !== "undefined") {
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIOSWeb = /iphone|ipad|ipod/.test(userAgent);
        const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);
        
        if (isIOSWeb || isSafari) {
          // For iOS Safari and other Safari browsers, use redirect flow
          // This avoids popup blocking issues
          oAuthResult = await startOAuthFlow({
            redirectUrl: window.location.origin + "/oauth-native-callback",
          });
        } else {
          // For other web browsers (Chrome, Firefox, etc.), try popup first
          try {
            oAuthResult = await startOAuthFlow();
          } catch (popupError) {
            console.warn("Popup blocked, falling back to redirect:", popupError);
            // Fallback to redirect if popup is blocked
            oAuthResult = await startOAuthFlow({
              redirectUrl: window.location.origin + "/oauth-native-callback",
            });
          }
        }
      } else {
        // For native platforms, use the standard flow
        oAuthResult = await startOAuthFlow();
      }

      const { createdSessionId, setActive } = oAuthResult;

      if (createdSessionId) {
        await setActive?.({ session: createdSessionId });
      } else {
        console.error("Could not create session");
        createToast({
          message: "Something went wrong",
          type: "error",
        });
        return;
      }

      setAuthActive(false);
    } catch (e) {
      console.error("OAuth sign-in error:", e);
      if (isClerkAPIResponseError(e)) {
        createToast({
          message: e.errors[0]?.longMessage ?? "Something went wrong",
          type: "error",
        });
      } else {
        createToast({
          message: "Something went wrong",
          type: "error",
        });
      }
      setAuthActive(false);
    }
  };

  return {
    signIn,
    isLoading: authActive,
  };
};

export default useOAuthSignIn;
