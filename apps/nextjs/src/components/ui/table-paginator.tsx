import type { FC } from "react";
import { ArrowLeft, ArrowRight, MoreHorizontal } from "lucide-react";
import Pagination from "rc-pagination";

import { cn } from "@/lib/utils";
import { Button } from "./button";

interface Props {
  page: number;
  totalCount: number;
  pageSize: number;
  onChangePage: (page: number) => void;
}

const TablePaginator: FC<Props> = ({ page: currentPage, totalCount, pageSize, onChangePage }) => {
  const renderItem = (page: number, type: "page" | "prev" | "next" | "jump-prev" | "jump-next") => {
    const isCurrent = page === currentPage;

    if (type === "prev") {
      return (
        <Button variant="outline" disabled={currentPage === 1} className="">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
      );
    } else if (type === "next") {
      return (
        <Button variant="outline" disabled={currentPage === 1} className="">
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      );
    } else if (type === "page") {
      return (
        <Button variant="ghost" size="icon" disabled={currentPage === 1} className={cn(isCurrent && "bg-[#E9E8FE] text-[#938DFB]")}>
          {page}
        </Button>
      );
    } else if (type === "jump-prev" || type === "jump-next") {
      return (
        <Button variant="ghost" size="icon">
          <MoreHorizontal />
        </Button>
      );
    } else {
      return <div />;
    }
  };
  return (
    <Pagination
      className="mt-4 flex w-full items-center gap-2"
      total={totalCount}
      itemRender={renderItem}
      onChange={onChangePage}
      current={currentPage}
      pageSize={pageSize}
      showLessItems
    />
  );
};

export default TablePaginator;
