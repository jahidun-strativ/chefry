import "@/styles/globals.css";

import type { ReactNode } from "react";
import Image from "next/image";

import bg from "@/assets/bg.webp";

export default function PostLayout({ children }: { children: ReactNode }) {
  return (
    <main className="h-screen w-screen">
      <div className="z-10 mx-auto h-screen w-full max-w-2xl overflow-y-auto p-6">
        <Image priority src="/main-logo.png" alt="Logo" width={200} height={100} className="mx-auto" />
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
