import "@/styles/globals.css";

import Image from "next/image";

export const metadata = {
  title: "Star Tracker | Privacy Policy",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <header className="sticky top-0 backdrop-blur-md">
        <div className="mx-auto w-full max-w-6xl p-6">
          <Image priority src="/main-logo.png" alt="Logo" width={124} height={52} />
        </div>
      </header>

      {children}
    </div>
  );
}
