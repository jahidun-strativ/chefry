import { prisma } from "@startracker/db";

import ImageCropper from "@/components/image-cropper";

export default async function ImageEditorPage({
  params,
  searchParams,
}: {
  params: { mediaId: string };
  searchParams: {
    webview: boolean;
    aspect: number;
  };
}) {
  const media = await prisma.media.findUnique({
    where: {
      id: params.mediaId,
    },
  });

  if (!media) {
    return <div>Media not found</div>;
  }

  return (
    <main className="fixed inset-0 flex select-none overflow-hidden bg-black">
      <ImageCropper media={media} aspect={Number(searchParams.aspect)} />
      {/* <div className="absolute left-0 right-0 top-0 h-16 bg-gradient-to-b from-black/50 to-black/0" />
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/50 to-black/0" /> */}
    </main>
  );
}
