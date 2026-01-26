"use client";

import type { FC } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const TabMenu: FC = () => {
  const pathname = usePathname();

  return (
    <div className="mx-auto mt-6 w-full max-w-screen-xl px-12">
      <div className=" w-full border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <Link
            href="/admin"
            className={cn(
              "whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium",
              pathname === "/admin" && "border-[#9A82EE] text-[#9A82EE]",
              pathname !== "/admin" && "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
            )}
          >
            Users
          </Link>

          <Link
            href="/admin/reported-content"
            className={cn(
              "whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium",
              pathname === "/admin/reported-content" && "border-[#9A82EE] text-[#9A82EE]",
              pathname !== "/admin/reported-content" && "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
            )}
          >
            Reported content
          </Link>
        </nav>
      </div>
    </div>
  );
};

export default TabMenu;
