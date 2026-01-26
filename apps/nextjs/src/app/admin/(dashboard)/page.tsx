"use client";

import { Suspense } from "react";

import UsersTable from "@/components/users-table";

export default function HomePage() {
  return (
    <div className="flex w-full flex-col items-center bg-white">
      <Suspense fallback={<div>Loading...</div>}>
        <UsersTable />
      </Suspense>
    </div>
  );
}
