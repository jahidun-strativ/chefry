import { useEffect } from "react";
import { Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";

const useWarmUpBrowser = () => {
  useEffect(() => {
    // Only warm up browser on native platforms
    // On web, especially iOS, this can interfere with OAuth flows
    if (Platform.OS !== "web") {
      void WebBrowser.warmUpAsync().catch(() => null);
      return () => {
        void WebBrowser.coolDownAsync().catch(() => null);
      };
    }
  }, []);
};

export default useWarmUpBrowser;
