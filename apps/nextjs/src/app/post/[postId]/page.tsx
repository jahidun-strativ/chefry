import type { StaticImageData } from "next/image";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, UserIcon } from "lucide-react";

import { prisma } from "@startracker/db";

import { getImageUrl, mediaBaseUrl } from "@/utils/imagekit";
import { DownloadAppButton } from "@/components/download-app-button";
import { Button } from "@/components/ui/button";
import startracker_icon from "@/assets/gradient_icon.svg";
import { cn } from "@/lib/utils";

export default async function PostPage({ params }: { params: { postId: string } }) {
  const post = await prisma.post.findUnique({
    where: {
      id: params.postId,
    },
    include: {
      media: true,
      createdBy: {
        include: {
          image: true,
        },
      },
    },
  });

  const media = post?.media?.[0];
  const createdBy = post?.createdBy;

  if (!media || !post || !createdBy) {
    return <div />;
  }

  return (
    <div className="mt-12 w-full">
      <div className="mb-2 ml-28 text-lg font-semibold text-white">{post.createdBy.username}</div>

      <div
        style={{ aspectRatio: (media?.width || 1) / (media?.height || 1) }}
        className="relative aspect-square w-full rounded-3xl border border-white bg-black"
      >
        <div className="absolute -top-16 left-0 z-20 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-white bg-gray-700">
          {createdBy.image && (
            <Image src={getImageUrl(createdBy.image.url, [{ width: "256" }])} width={128} height={128} alt="Profile Image" />
          )}
          {!createdBy.image && <UserIcon size={40} color="white" />}
        </div>

        <div className={cn("relative h-full w-full overflow-hidden rounded-3xl")}>
          {media.type === "IMAGE" && (
            <Image
              alt="Post"
              src={mediaBaseUrl + "tr:w-1024/" + media.url}
              placeholder="blur"
              quality={100}
              blurDataURL={media.thumbhash || undefined}
              fill
              className={cn("rounded-3xl", post.starPost && "blur-xl")}
              sizes="100vw"
              style={{
                objectFit: "cover",
              }}
            />
          )}

          {media.type === "VIDEO" && (
            <video
              controls
              src={mediaBaseUrl + "tr:w-1024/" + media.url}
              className={cn("h-full w-full rounded-3xl", post.starPost && "blur-xl")}
              muted
            />
          )}

          {post.starPost && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
              <Image alt="Star Tracker icon" src={startracker_icon as StaticImageData} width={100} height={100} />
              <h2 className="mt-6 text-xl font-semibold text-white">Subscribe to see this content</h2>
              {/* <p className="mt-1 text-base text-white">Open the app as a subscriber to view this post.</p> */}
            </div>
          )}
        </div>
      </div>

      <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-6">
        <Button size="lg" asChild>
          <Link href={`startracker://post/${post.id}`}>
            <ExternalLink size={22} className="mr-2" />
            Open in app
          </Link>
        </Button>

        <DownloadAppButton />
      </div>
    </div>
  );
}
