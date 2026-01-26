import type { FC } from "react";
import type { StaticImageData } from "next/image";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";

import logo from "@/assets/logo.svg";

const AppBar: FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-black/[3%] py-8 backdrop-blur-md">
      <div className="mx-auto flex max-w-screen-xl items-center justify-between px-6">
        <div>
          <Image priority src={(logo as StaticImageData).src} alt="Logo" width={124} height={52} />
        </div>

        <div className="flex items-center gap-2">
          <UserButton />
        </div>
      </div>
    </header>
  );
};

export default AppBar;
