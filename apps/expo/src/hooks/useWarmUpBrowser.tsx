import { useEffect } from "react";
import * as WebBrowser from "expo-web-browser";

const useWarmUpBrowser = () => {
  useEffect(() => {
    void WebBrowser.warmUpAsync().catch(() => null);
    return () => {
      void WebBrowser.coolDownAsync().catch(() => null);
    };
  }, []);
};

export default useWarmUpBrowser;
