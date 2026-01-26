import "@/styles/globals.css";

import type { StaticImageData } from "next/image";
import Image from "next/image";

import logo from "@/assets/logo_gradient.svg";

export const metadata = {
  title: "Star Tracker | Privacy Policy",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="sticky top-0 backdrop-blur-md">
          <div className="mx-auto w-full max-w-6xl p-6">
            <Image priority src={(logo as StaticImageData).src} alt="Logo" width={124} height={52} />
          </div>
        </header>

        {children}
      </body>
    </html>
  );
}
