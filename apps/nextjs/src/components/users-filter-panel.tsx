"use client";

import type { ChangeEvent, FC } from "react";
import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useDebounce } from "usehooks-ts";
import { z } from "zod";

import { cn } from "@/lib/utils";
import { Input } from "./ui/input";

export const usersFilterSchema = z.object({
  userType: z.enum(["ALL", "VERIFIED", "NON_VERIFIED"]).nullish(),
  searchText: z.string().nullish(),
  page: z.number().int().positive().nullish(),
});

interface Props {
  filter: z.infer<typeof usersFilterSchema>;
}

const UsersFilterPanel: FC<Props> = ({ filter }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      params.set(name, value);
      params.set("page", "1");
      return params.toString();
    },
    [searchParams],
  );

  const setUserType = (userType: "ALL" | "VERIFIED" | "NON_VERIFIED") =>
    router.push(`${pathname}?${createQueryString("userType", userType)}`);

  const [searchText, setSearchText] = useState(filter.searchText || "");
  const handleChangeSearchText = (e: ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value);
  const debouncedSearchText = useDebounce<string>(searchText, 500);

  useEffect(() => {
    if (debouncedSearchText === "" && filter.searchText == null) {
      return;
    }

    router.push(`${pathname}?${createQueryString("searchText", debouncedSearchText)}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchText]);

  return (
    <div className="mb-4 flex flex-row justify-between">
      <div className="flex flex-row divide-x divide-gray-200 overflow-hidden rounded-lg border border-gray-200 shadow-sm">
        <button
          onClick={() => setUserType("ALL")}
          className={cn(
            "px-4 py-3 text-sm text-gray-800 transition-colors hover:bg-gray-50",
            (filter.userType == null || filter.userType === "ALL") && "bg-gray-100",
          )}
        >
          All users
        </button>
        <button
          onClick={() => setUserType("VERIFIED")}
          className={cn(
            "px-4 py-3 text-sm text-gray-800 transition-colors hover:bg-gray-50",
            filter.userType === "VERIFIED" && "bg-gray-100",
          )}
        >
          Verified
        </button>
        <button
          onClick={() => setUserType("NON_VERIFIED")}
          className={cn(
            "px-4 py-3 text-sm text-gray-800 transition-colors hover:bg-gray-50",
            filter.userType === "NON_VERIFIED" && "bg-gray-100",
          )}
        >
          Non verified
        </button>
      </div>
      <div className="relative">
        <div className="pointer-events-none absolute left-0 flex h-10 items-center justify-center pl-3">
          <Search className="w-4" />
        </div>
        <Input value={searchText} className="pl-10" onChange={handleChangeSearchText} placeholder="Search..." />
      </div>
    </div>
  );
};

export default UsersFilterPanel;
