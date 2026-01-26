import { useState } from "react";
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
      const { createdSessionId, setActive } = await startOAuthFlow();

      if (createdSessionId) {
        await setActive?.({ session: createdSessionId });
      } else {
        Sentry.Native.captureMessage("Could not create session");
        createToast({
          message: "Something went wrong",
          type: "error",
        });
        return;
      }

      setAuthActive(false);
    } catch (e) {
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
