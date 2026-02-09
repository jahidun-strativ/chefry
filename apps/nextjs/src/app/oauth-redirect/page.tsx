"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OAuthRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Get the current URL with all query parameters
    const currentUrl = window.location.href;
    
    // Extract the redirect URL from query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const redirectTo = urlParams.get('redirect_to');
    
    console.log("OAuth redirect page loaded");
    console.log("Current URL:", currentUrl);
    console.log("Redirect to:", redirectTo);
    
    // If we have a redirect_to parameter, redirect to that Expo app
    if (redirectTo) {
      const finalRedirectUrl = `${redirectTo}/oauth-native-callback${window.location.search}`;
      console.log("Redirecting to Expo app:", finalRedirectUrl);
      window.location.href = finalRedirectUrl;
      return;
    }
    
    // For other cases, redirect to home
    router.push('/');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="text-center">
        <div className="mb-4">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
        </div>
        <h1 className="text-xl font-semibold text-white">
          Completing authentication...
        </h1>
        <p className="mt-2 text-gray-300">
          You will be redirected shortly.
        </p>
      </div>
    </div>
  );
}