// @ts-expect-error - no types
import nativewind from "nativewind/preset";
import type { Config } from "tailwindcss";

import baseConfig from "@startracker/tailwind-config";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  presets: [baseConfig, nativewind],
} satisfies Config;
