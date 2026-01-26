import "@/styles/globals.css";

import type { ReactNode } from "react";

export const metadata = {
  title: "Star Tracker | Sign in",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <main className="flex h-screen items-center justify-center">{children}</main>;
}
