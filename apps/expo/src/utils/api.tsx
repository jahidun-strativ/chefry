import React, { useEffect } from "react";
import Constants from "expo-constants";
import { useAuth } from "@clerk/clerk-expo";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import superjson from "superjson";

import type { AppRouter } from "@startracker/api";

/**
 * A set of typesafe hooks for consuming your API.
 */
export const api = createTRPCReact<AppRouter>();
export { type RouterInputs, type RouterOutputs } from "@startracker/api";

/**
 * Extend this function when going to production by
 * setting the baseUrl to your production API URL.
 */
export const getBaseUrl = (): string => {
  /**
   * Gets the IP address of your host-machine. If it cannot automatically find it,
   * you'll have to manually set it. NOTE: Port 3000 should work for most but confirm
   * you don't have anything else running on it, or you'd have to change it.
   *
   * **NOTE**: This is only for development. In production, you'll want to set the
   * baseUrl to your production API URL.
   */
  
  // Check environment variable first (highest priority)
  const envUrl = process.env.EXPO_PUBLIC_API_URL as string | undefined;
  if (envUrl) {
    console.log("[getBaseUrl] Using EXPO_PUBLIC_API_URL:", envUrl);
    return envUrl;
  }

  // Check if we're in development mode
  const isDev = typeof __DEV__ !== "undefined" ? (__DEV__ as boolean) : false;
  const isDevelopment = process.env.EXPO_PUBLIC_ENV === "development" || isDev;
  
  if (!isDevelopment) {
    console.log("[getBaseUrl] Production mode, using production URL");
    return "https://chefry-nextjs-rust.vercel.app";
  }

  try {
    // Try to get localhost from Expo constants
    const debuggerHost1 = (Constants.manifest2?.extra as { expoGo?: { debuggerHost?: string } } | undefined)?.expoGo?.debuggerHost;
    const debuggerHost2 = (Constants.expoConfig?.extra as { expoGo?: { debuggerHost?: string } } | undefined)?.expoGo?.debuggerHost;
    const debuggerHost = debuggerHost1 || debuggerHost2;
    
    const localhost = debuggerHost?.split(":")?.[0];

    if (localhost) {
      const url = `http://${localhost}:3000`;
      console.log("[getBaseUrl] Detected localhost:", url);
      return url;
    }

    // Fallback to localhost if we can't detect it but we're in dev mode
    console.log("[getBaseUrl] Could not detect localhost, using localhost:3000");
    return "http://localhost:3000";
  } catch (e) {
    console.warn("[getBaseUrl] Error detecting localhost:", e);
    // In development, default to localhost
    return "http://localhost:3000";
  }
};

/**
 * A wrapper for your app that provides the TRPC context.
 * Use only in _app.tsx
 */

export function TRPCProvider(props: { children: React.ReactNode }) {
  const { getToken, isSignedIn } = useAuth();
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Suppress CancelledError - it's normal when queries are cancelled on unmount
            retry: (failureCount, error: unknown) => {
              if (error && typeof error === "object" && "name" in error && error.name === "CancelledError") {
                return false;
              }
              return failureCount < 3;
            },
          },
        },
      }),
  );
  const [trpcClient] = React.useState(() =>
    api.createClient({
      transformer: superjson,
      links: [
        httpBatchLink({
          async headers() {
            const authToken = await getToken();
            return {
              Authorization: authToken ?? undefined,
            };
          },
          url: `${getBaseUrl()}/api/trpc`,
        }),
      ],
    }),
  );

  useEffect(() => {
    if (!isSignedIn) {
      queryClient.clear();
    }
  }, [isSignedIn, queryClient]);

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{props.children}</QueryClientProvider>
    </api.Provider>
  );
}
