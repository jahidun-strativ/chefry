import { useState } from "react";
import { Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { isClerkAPIResponseError, useSignIn } from "@clerk/clerk-expo";
import type { OAuthStrategy } from "@clerk/types";

import createToast from "@/utils/createToast";

// Configure WebBrowser for OAuth
WebBrowser.maybeCompleteAuthSession();

const useOAuthSignInV2 = (strategy: OAuthStrategy) => {
  const { signIn, isLoaded } = useSignIn();
  const [authActive, setAuthActive] = useState(false);
  
  const handleSignIn = async () => {
    if (!isLoaded || !signIn) {
      console.log("Clerk not loaded yet");
      return;
    }
    
    setAuthActive(true);
    
    try {
      // For web platforms
      if (Platform.OS === "web" && typeof window !== "undefined") {
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIOSWeb = /iphone|ipad|ipod/.test(userAgent);
        const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);
        
        // Get the correct redirect URL for the current environment
        const getRedirectUrl = () => {
          const origin = window.location.origin;
          
          // Handle Expo hosting URLs (startracker--*.expo.app)
          if (origin.includes('.expo.app')) {
            return `${origin}/oauth-native-callback`;
          }
          
          // Handle localhost development
          if (origin.includes('localhost')) {
            return `${origin}/oauth-native-callback`;
          }
          
          // Handle your custom domain (if you have one)
          if (origin.includes('startracker.vercel.app')) {
            return `${origin}/oauth-redirect`;
          }
          
          // For any other domains, use the Next.js redirect service as fallback
          return `https://startracker.vercel.app/oauth-redirect?redirect_to=${encodeURIComponent(origin)}`;
        };

        const redirectUrl = getRedirectUrl();
        console.log(`OAuth Strategy: ${strategy}, Redirect URL: ${redirectUrl}`);
        console.log(`User Agent: ${userAgent}`);
        console.log(`iOS Web: ${isIOSWeb}, Safari: ${isSafari}`);

        try {
          // Use the modern Clerk OAuth flow
          await signIn.authenticateWithRedirect({
            strategy,
            redirectUrl,
            redirectUrlComplete: redirectUrl,
          });

          // For redirect flows, the page will redirect and we won't reach this point
          console.log("OAuth redirect initiated");
          
        } catch (error) {
          console.error("OAuth redirect error:", error);
          
          // Enhanced fallback for Expo hosting
          if (strategy === "oauth_google") {
            // Create a more robust Google OAuth URL
            const params = new URLSearchParams({
              client_id: String(process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY) || '',
              redirect_uri: redirectUrl,
              response_type: 'code',
              scope: 'openid email profile',
              state: 'clerk_oauth_expo',
              access_type: 'offline',
              prompt: 'consent'
            });
            
            const googleAuthUrl = `https://accounts.google.com/oauth/authorize?${params.toString()}`;
            
            console.log("Fallback: Direct Google OAuth redirect");
            console.log("Google OAuth URL:", googleAuthUrl);
            
            // For iOS, use window.location.replace to avoid popup blocking
            if (isIOSWeb || isSafari) {
              window.location.replace(googleAuthUrl);
            } else {
              window.location.href = googleAuthUrl;
            }
            return;
          }
          
          throw error;
        }
      } else {
        // For native platforms
        console.log("Native OAuth flow");
        await signIn.authenticateWithRedirect({
          strategy,
          redirectUrl: "exp://localhost:8081/oauth-native-callback",
          redirectUrlComplete: "exp://localhost:8081/oauth-native-callback",
        });
        
        console.log("Native OAuth initiated");
      }
      
    } catch (error) {
      console.error("OAuth sign-in error:", error);
      
      let errorMessage = "Authentication failed. Please try again.";
      
      if (isClerkAPIResponseError(error)) {
        errorMessage = error.errors[0]?.longMessage || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      createToast({
        message: errorMessage,
        type: "error",
      });
    } finally {
      setAuthActive(false);
    }
  };

  return {
    signIn: handleSignIn,
    isLoading: authActive,
  };
};

export default useOAuthSignInV2;