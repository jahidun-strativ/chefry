import { notFound } from "next/navigation";
import { Check } from "lucide-react";

import { prisma } from "@startracker/db";

export default async function EventPackagePaymentComplete({ searchParams }: { searchParams: { eventPackageId: string } }) {
  const eventPackageId = searchParams.eventPackageId;

  if (!eventPackageId) {
    return notFound();
  }

  const eventPackage = await prisma.eventPackage.findUnique({ where: { id: eventPackageId }, include: { createdBy: true } });

  if (!eventPackage) {
    return notFound();
  }

  return (
    <div className="flex flex-col items-center justify-center pt-12">
      <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full border border-white bg-gradient-to-tr from-[#938DFB] to-[#EB004C] shadow">
        <Check size={50} color="white" />
      </div>
      <h2 className="text-center text-2xl font-bold text-white">Star Tracker event package payment success</h2>
      <p className="mt-2 text-center text-gray-300">
        You have now access to the Star Tracker event package <span className="font-bold">{eventPackage.name}</span> by{" "}
        <span className="font-bold">{eventPackage.createdBy.username}</span> . You can now close the browser window.
      </p>
    </div>
  );
}
