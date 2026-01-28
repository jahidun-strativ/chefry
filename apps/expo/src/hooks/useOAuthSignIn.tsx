import { useState } from "react";
import { Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { isClerkAPIResponseError, useSignIn } from "@clerk/clerk-expo";
import type { OAuthStrategy } from "@clerk/types";

import createToast from "@/utils/createToast";
import useWarmUpBrowser from "./useWarmUpBrowser";

WebBrowser.maybeCompleteAuthSession();

const useOAuthSignIn = (strategy: OAuthStrategy) => {
  useWarmUpBrowser();

  const { signIn, isLoaded } = useSignIn();
  const [authActive, setAuthActive] = useState(false);
  
  const handleSignIn = async () => {
    if (!isLoaded || !signIn) return;
    
    setAuthActive(true);
    try {
      // For web platforms, we need to handle different browsers and environments
      if (Platform.OS === "web" && typeof window !== "undefined") {
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIOSWeb = /iphone|ipad|ipod/.test(userAgent);
        const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);
        const isChrome = /chrome/.test(userAgent);
        
        // Determine the correct redirect URL based on environment
        const getRedirectUrl = () => {
          const origin = window.location.origin;
          const pathname = "/oauth-native-callback";
          return `${origin}${pathname}`;
        };

        const redirectUrl = getRedirectUrl();
        console.log("OAuth redirect URL:", redirectUrl);

        // For iOS Safari, always use redirect flow
        if (isIOSWeb || isSafari) {
          console.log("Using redirect flow for iOS/Safari");
          await signIn.authenticateWithRedirect({
            strategy,
            redirectUrl,
            redirectUrlComplete: redirectUrl,
          });
          
          // The redirect will handle the rest - this code won't be reached
          return;
        } 
        // For Chrome and other browsers, use redirect flow
        else {
          try {
            console.log("Using redirect flow for Chrome/other browsers");
            await signIn.authenticateWithRedirect({
              strategy,
              redirectUrl,
              redirectUrlComplete: redirectUrl,
            });
            
            // The redirect will handle the rest - this code won't be reached
            return;
          } catch (redirectError) {
            console.warn("Redirect failed, trying alternative approach:", redirectError);
            
            // Alternative approach: direct redirect
            try {
              await signIn.authenticateWithRedirect({
                strategy,
                redirectUrl,
                redirectUrlComplete: redirectUrl,
              });
              return;
            } catch (fallbackError) {
              console.error("All OAuth methods failed:", fallbackError);
              throw fallbackError;
            }
          }
        }
      } else {
        // For native platforms, use the standard flow
        console.log("Using native OAuth flow");
        await signIn.authenticateWithRedirect({
          strategy,
          redirectUrl: "exp://localhost:8081/oauth-native-callback", // Expo development URL
          redirectUrlComplete: "exp://localhost:8081/oauth-native-callback",
        });
        
        // The redirect will handle the rest - this code won't be reached
      }

      setAuthActive(false);
    } catch (e) {
      console.error("OAuth sign-in error:", e);
      if (isClerkAPIResponseError(e)) {
        createToast({
          message: e.errors[0]?.longMessage ?? "Authentication failed. Please try again.",
          type: "error",
        });
      } else {
        createToast({
          message: "Authentication failed. Please try again.",
          type: "error",
        });
      }
      setAuthActive(false);
    }
  };

  return {
    signIn: handleSignIn,
    isLoading: authActive,
  };
};

export default useOAuthSignIn;
