import type { ExpoConfig } from "@expo/config";

const defineConfig = (): ExpoConfig => ({
  name: "Star Tracker",
  slug: "startracker",
  scheme: "startracker",
  version: "1.2.8",
  orientation: "portrait",
  icon: "./assets/main-logo.png",
  userInterfaceStyle: "light",
  newArchEnabled: true,
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#1F104A",
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: false,
    bundleIdentifier: "app.startracker.one",
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  androidNavigationBar: {
    // backgroundColor: "#000000",
    barStyle: "dark-content",
  },
  androidStatusBar: {
    backgroundColor: "#00000000",
    barStyle: "dark-content",
    translucent: true,
  },
  android: {
    package: "app.startracker.one",
    versionCode: 29,
    googleServicesFile: "./google-services.json",
    adaptiveIcon: {
      foregroundImage: "./assets/main-logo.png",
    },
  },
  web: {
    bundler: "metro",
    output: "single",
    favicon: "./public/favicon.png",
    manifest: "./public/manifest.json",
  },
  runtimeVersion: {
    policy: "sdkVersion",
  },
  extra: {
    eas: {
      projectId: "32e1894f-aaf3-425f-9eae-b594cb452fb6",
    },
    // Clerk redirect URLs
    CLERK_SIGN_IN_FALLBACK_REDIRECT_URL: "/",
    CLERK_SIGN_UP_FALLBACK_REDIRECT_URL: "/",
    CLERK_SIGN_IN_FORCE_REDIRECT_URL: "/",
    CLERK_SIGN_UP_FORCE_REDIRECT_URL: "/",
  },
  plugins: [
    "expo-router",
    "expo-apple-authentication",
    "expo-secure-store",
    "expo-web-browser",
    "./expo-plugins/with-modify-gradle.js",
    // [
    //   "@stripe/stripe-react-native",
    //   {
    //     "merchantIdentifier": "",
    //     "enableGooglePay": true
    //   },
    // ],
    [
      "expo-image-picker",
      {
        photosPermission: "The app accesses your photos and videos to let you share them with your followers.",
        cameraPermission: "The app accesses your camera to let you take photos and videos to share with your followers.",
        microphonePermission: "The app accesses your microphone to let you record audio to share with your followers.",
      },
    ],
    [
      "expo-screen-orientation",
      {
        initialOrientation: "PORTRAIT_UP",
      },
    ],
    // [
    //   "@stripe/stripe-react-native",
    //   {
    //     merchantIdentifier: "merchant.com.startracker",
    //     enableGooglePay: true,
    //   },
    // ],
  ],
  experiments: {
    tsconfigPaths: true,
    // typedRoutes: true,
  },
});

export default defineConfig;
