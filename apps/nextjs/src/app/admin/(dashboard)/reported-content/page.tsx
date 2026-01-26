import ContentFlagsTable from "@/components/content-flags-table";

export default function ReportedContentPage() {
  return (
    <div className="flex w-full flex-col items-center bg-white">
      <ContentFlagsTable />
    </div>
  );
}

export const revalidate = 0;
