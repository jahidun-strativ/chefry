import { Inter } from "next/font/google";

import "@/styles/globals.css";

import Image from "next/image";

import { cn } from "@/lib/utils";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Star Tracker | Checkout",
};

export default function Layout(props: { children: React.ReactNode }) {
  return (
    <div className={cn("flex min-h-screen flex-col bg-gray-900 font-sans", fontSans.variable)}>
      <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-white/[2%] py-6 backdrop-blur-md">
        <div className="mx-auto flex max-w-screen-xl items-center justify-center px-6">
          <Image priority src="/main-logo.png" alt="Logo" width={124} height={52} />
        </div>
      </header>
      <main className="mx-auto w-full max-w-screen-xl px-6 py-8">{props.children}</main>
    </div>
  );
}
