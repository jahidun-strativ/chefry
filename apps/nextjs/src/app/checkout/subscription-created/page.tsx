import { notFound } from "next/navigation";
import { Check } from "lucide-react";

import { prisma } from "@startracker/db";

export default async function SubscriptionCreatedPage({ searchParams }: { searchParams: { userId: string } }) {
  const userId = searchParams.userId;

  if (!userId) {
    return notFound();
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    return notFound();
  }

  return (
    <div className="flex flex-col items-center justify-center pt-12">
      <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full border border-white bg-gradient-to-tr from-[#938DFB] to-[#EB004C] shadow">
        <Check size={50} color="white" />
      </div>
      <h2 className="text-center text-2xl font-bold text-white">Subscription created</h2>
      <p className="mt-2 text-center text-gray-300">
        You are now subscribed to <span className="font-bold">{user.username}</span>. You can now close the browser window.
      </p>

      {/* <Button className="mt-6 bg-gradient-to-tr from-[#938DFB] to-[#EB004C]" size="lg">
        <ArrowLeft className="mr-2" size={20} color="white" />
        Back to app
      </Button> */}
    </div>
  );
}
