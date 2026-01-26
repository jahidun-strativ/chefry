import bg from "@/assets/bg.webp";
import logo from "@/assets/logo_white.svg";

import "@/styles/globals.css";

import type { StaticImageData } from "next/image";
import Image from "next/image";

export const metadata = {
  title: "Star Tracker",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="h-screen w-screen">
      <div className="z-10 mx-auto flex h-screen w-full flex-col items-center justify-center">
        <Image priority src={(logo as StaticImageData).src} alt="Logo" width={500} height={300} className="mx-auto" />
        {children}
      </div>

      <Image
        alt="Background"
        src={bg}
        placeholder="blur"
        quality={100}
        fill
        className="z-[-1]"
        sizes="100vw"
        style={{
          objectFit: "cover",
        }}
      />
    </main>
  );
}
