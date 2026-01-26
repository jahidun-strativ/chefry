"use client";

import type { FC } from "react";
import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { z } from "zod";

import type { RouterOutputs } from "@startracker/api";

import { api } from "@/utils/api";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { DataTable } from "./ui/data-table";
import { Spinner } from "./ui/spinner";
import { Switch } from "./ui/switch";
import TablePaginator from "./ui/table-paginator";
import { useToast } from "./ui/use-toast";
import ViewReportedContentButton from "./view-reported-content-button";

const contentFlagsFilterSchema = z.object({
  page: z.number().optional(),
});

type TableContentFlag = RouterOutputs["admin"]["contentFlag"]["list"]["contentFlags"][number];

const ContentFlagsTable: FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo<z.infer<typeof contentFlagsFilterSchema>>(() => {
    const page = searchParams.get("page");
    const filterParse = contentFlagsFilterSchema.safeParse({
      page: page != null ? parseInt(page) : undefined,
    });

    if (filterParse.success) {
      return filterParse.data;
    }

    return {
      page: 1,
    };
  }, [searchParams]);

  const { page: page_ } = filters;
  const page = page_ ?? 1;
  const pageSize = 10;

  const { data, isLoading, refetch } = api.admin.contentFlag.list.useQuery({
    page: page - 1,
    pageSize,
  });

  const contentFlags = data?.contentFlags ?? [];
  const count = data?.count ?? 0;

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
  const [loadingContentFlagId, setLoadingContentFlagId] = useState<string | null>(null);
  const { mutate: toggleRemove } = api.admin.contentFlag.toggleRemove.useMutation({
    onMutate: ({ contentFlagId }) => {
      setLoadingContentFlagId(contentFlagId);
    },
    onSuccess: async () => {
      await refetch();
      toast({
        description: "Post visibility updated!",
        variant: "default",
      });
      setLoadingContentFlagId(null);
    },
    onError: (e) => {
      toast({
        description: "Error updating post visibility",
        variant: "destructive",
      });
      setLoadingContentFlagId(null);
    },
  });

  const columns = useMemo<ColumnDef<TableContentFlag>[]>(
    () => [
      {
        accessorKey: "caseId",
        header: "Case ID",
        cell: ({ getValue }) => {
          const id = getValue() as string;
          return id.toUpperCase();
        },
      },
      {
        accessorKey: "id",
        header: "Uploaded by",
        cell: ({ row }) => {
          const post = row.original?.post;
          const story = row.original?.story;
          const createdBy = post?.createdBy ?? story?.createdBy;

          return createdBy?.username ?? "Unknown";
        },
      },
      {
        accessorKey: "createdBy",
        header: "Reported by",
        cell: ({ row }) => {
          const createdBy = row.original?.createdBy;

          return createdBy?.username ?? "Unknown";
        },
      },
      {
        accessorKey: "createdAt",
        header: "Date reported",
        cell: ({ row }) => {
          const createdAt = row.original.createdAt;
          return new Intl.DateTimeFormat("sv-SE", { dateStyle: "short", timeStyle: "short" }).format(new Date(createdAt));
        },
      },
      {
        accessorKey: "type",
        header: "Reason",
        cell: (row) => {
          const value = row.getValue();
          if (value === "SPAM") {
            return "Spam";
          } else if (value === "NUDE_CONTENT") {
            return "Nude content";
          } else if (value === "HATE_SPEECH") {
            return "Hate speech";
          } else if (value === "DISINFORMATION") {
            return "Disinformation";
          } else if (value === "VIOLENCE") {
            return "Violence";
          }
        },
      },
      {
        accessorKey: "actions",
        maxSize: 50,
        header: "",
        cell: ({ row }) => {
          const contentFlagId = row.original.id;
          const post = row.original?.post;
          const story = row.original?.story;

          const isRemoved = post?.removed || story?.removed || false;

          if (loadingContentFlagId === contentFlagId) {
            return (
              <div className="flex w-full items-center justify-center">
                <Spinner className="h-6 w-6" />
              </div>
            );
          }

          return (
            <div className="flex w-full items-center justify-end gap-2">
              <ViewReportedContentButton contentFlagId={contentFlagId} />

              <Switch checked={!isRemoved} onClick={() => toggleRemove({ contentFlagId })} />

              <Badge
                variant="default"
                className={cn("py-1", !isRemoved && "bg-green-200 text-green-800", isRemoved && "bg-red-200 text-red-800")}
              >
                {isRemoved ? "Removed" : "Uploaded"}
              </Badge>
            </div>
          );
        },
      },
    ],
    [toggleRemove, loadingContentFlagId],
  );

  return (
    <div className="w-full rounded-lg border border-gray-100 p-6">
      <div className="mb-4 flex items-center gap-4">
        <h3 className="text-xl text-black">Reported content</h3>
      </div>

      {/* <UsersFilterPanel filter={filters} /> */}

      {isLoading && (
        <div className="flex items-center justify-center rounded border p-12">
          <Spinner className="h-10 w-10" />
        </div>
      )}

      {!isLoading && (
        <>
          <DataTable columns={columns} data={contentFlags} />
          <TablePaginator pageSize={pageSize} onChangePage={handleChangePage} page={page} totalCount={count} />
        </>
      )}
    </div>
  );
};

export default ContentFlagsTable;
