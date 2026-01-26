import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, UserIcon } from "lucide-react";

import { prisma } from "@startracker/db";

import { getImageUrl } from "@/utils/imagekit";
import { DownloadAppButton } from "@/components/download-app-button";
import { Button } from "@/components/ui/button";

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const user = await prisma.user.findUnique({
    where: {
      username: params.username,
    },
    select: {
      image: true,
      username: true,
      verified: true,
    },
  });

  if (!user) {
    return notFound();
  }

  return (
    <div className="mt-8 w-full">
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="z-20 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-white bg-gray-700">
          {user.image && <Image src={getImageUrl(user.image.url, [{ width: "256" }])} width={128} height={128} alt="Profile Image" />}
          {!user.image && <UserIcon size={40} color="white" />}
        </div>
        <div className="text-center text-2xl font-semibold text-white">{user.username}</div>
        <p className="text-center text-lg text-white/80">
          To view this profile, download the Star Tracker app or if you have it installed you can open it directly using the button below.
        </p>
      </div>

      <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-6">
        <Button size="lg" asChild>
          <Link href={`startracker://view-profile/${params.username}`}>
            <ExternalLink size={22} className="mr-2" />
            Open in app
          </Link>
        </Button>

        <DownloadAppButton />
      </div>
    </div>
  );
}
