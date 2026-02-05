import type { FC } from "react";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";

const AppBar: FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-black/[3%] py-8 backdrop-blur-md">
      <div className="mx-auto flex max-w-screen-xl items-center justify-between px-6">
        <div>
          <Image priority src="/main-logo.png" alt="Logo" width={124} height={52} />
        </div>

        <div className="flex items-center gap-2">
          <UserButton />
        </div>
      </div>
    </header>
  );
};

export default AppBar;
