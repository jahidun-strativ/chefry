import { Inter } from "next/font/google";

import "@/styles/globals.css";

import { cn } from "@/lib/utils";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Star Tracker",
  icons: {
    icon: [
      { url: "/icon.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export default function Layout(props: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={cn("flex flex-col font-sans", fontSans.variable)}>{props.children}</body>
    </html>
  );
}
