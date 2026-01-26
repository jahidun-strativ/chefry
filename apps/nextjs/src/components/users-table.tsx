"use client";

import type { FC } from "react";
import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import type { z } from "zod";

import type { RouterOutputs } from "@startracker/api";

import { api } from "@/utils/api";
import { cn } from "@/lib/utils";
import { DeleteUserButton } from "./delete-user-button";
import { Badge } from "./ui/badge";
import { DataTable } from "./ui/data-table";
import { Spinner } from "./ui/spinner";
import { Switch } from "./ui/switch";
import TablePaginator from "./ui/table-paginator";
import { useToast } from "./ui/use-toast";
import UserPrivilegeLevelSelect from "./user-privilege-level-select";
import UsersFilterPanel, { usersFilterSchema } from "./users-filter-panel";

type TableUser = RouterOutputs["admin"]["user"]["list"]["users"][number];

const UsersTable: FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo<z.infer<typeof usersFilterSchema>>(() => {
    const page = searchParams.get("page");
    const filterParse = usersFilterSchema.safeParse({
      userType: searchParams.get("userType"),
      searchText: searchParams.get("searchText"),
      page: page != null ? parseInt(page) : undefined,
    });

    if (filterParse.success) {
      return filterParse.data;
    }

    return {
      userType: "ALL",
      searchText: "",
      page: 1,
    };
  }, [searchParams]);

  const { userType, searchText, page: page_ } = filters;
  const page = page_ ?? 1;
  const pageSize = 10;

  const { data, isLoading, refetch } = api.admin.user.list.useQuery({
    userType: userType === "ALL" ? undefined : userType,
    searchText,
    page: page - 1,
    pageSize,
  });

  const users = data?.users ?? [];
  const usersCount = data?.count ?? 0;

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      params.set(name, value);
      return params.toString();
    },
    [searchParams],
  );

  const handleChangePage = (page: number) => router.push(`${pathname}?${createQueryString("page", page.toString())}`);

  const { toast } = useToast();
  const [verifyingUserId, setVerifyingUserId] = useState<string | null>(null);
  const { mutate: toggleVerify } = api.admin.user.toggleVerify.useMutation({
    onMutate: ({ id }) => {
      setVerifyingUserId(id);
    },
    onSuccess: async () => {
      await refetch();
      toast({
        title: "User verification status updated",
        variant: "default",
      });
      setVerifyingUserId(null);
    },
    onError: () => {
      toast({
        title: "Error updating user verification status",
        variant: "destructive",
      });
      setVerifyingUserId(null);
    },
  });

  const columns = useMemo<ColumnDef<TableUser>[]>(
    () => [
      {
        accessorKey: "username",
        header: "Username",
      },
      {
        accessorKey: "verificationReferenceNumber",
        header: "Verification code",
        cell: ({ row, getValue }) => {
          return (getValue() as string)?.toUpperCase() ?? "N/A";
        },
      },
      {
        accessorKey: "email",
        header: "Email",
      },
      {
        accessorKey: "privilegeLevel",
        header: "Privilege Level",
        cell: ({ row }) => {
          return (
            <UserPrivilegeLevelSelect
              user={row.original}
              refetchUser={async () => {
                await refetch();
              }}
            />
          );
        },
      },
      {
        header: "Verification",
        accessorKey: "verified",
        cell: (row) => {
          const userId = row.row.original.id;
          const isVerified = row.getValue();

          if (verifyingUserId === userId) {
            return (
              <div className="flex w-full items-center justify-center">
                <Spinner className="h-4 w-4" />
              </div>
            );
          }

          return (
            <div className="flex items-center gap-2">
              <Switch checked={!!isVerified} onClick={() => toggleVerify({ id: userId })} />
              <Badge
                className={cn("py-1", !!isVerified && "bg-green-200 text-green-800", !isVerified && "bg-yellow-200 text-yellow-800")}
                variant="default"
              >
                {isVerified ? "Verified" : "Unverfied"}
              </Badge>
            </div>
          );
        },
      },
      {
        accessorKey: "actions",
        maxSize: 50,
        header: "",
        cell: (row) => {
          const userId = row.row.original.id;
          return (
            <div className="flex w-full justify-end">
              <DeleteUserButton id={userId} />
            </div>
          );
        },
      },
    ],
    [toggleVerify, verifyingUserId, refetch],
  );

  return (
    <div className="w-full rounded-lg border border-gray-100 p-6">
      <div className="mb-4 flex items-center gap-4">
        <h3 className="text-xl text-black">Users</h3>
      </div>

      <UsersFilterPanel filter={filters} />

      {isLoading && (
        <div className="flex items-center justify-center rounded border p-12">
          <Spinner className="h-10 w-10" />
        </div>
      )}

      {!isLoading && (
        <>
          <DataTable columns={columns} data={users} />
          <TablePaginator pageSize={pageSize} onChangePage={handleChangePage} page={page} totalCount={usersCount} />
        </>
      )}
    </div>
  );
};

export default UsersTable;
