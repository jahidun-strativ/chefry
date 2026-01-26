/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import "@/utils/firebase";

import { registerRootComponent } from "expo";
import { ExpoRoot } from "expo-router";
import { cssInterop } from 'nativewind';
import "react-native-url-polyfill/auto";

import { View } from "react-native";

// import "expo-router/entry";

export function App() {
  const ctx = require.context("./src/app");
  return <ExpoRoot context={ctx as any} />;
}

registerRootComponent(App);
