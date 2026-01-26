import { useCallback, useState } from "react";
import { useLocalSearchParams } from "expo-router";

import { api } from "@/utils/api";
import { ImageViewer } from "@/components/image-viewer";
import MainLayout from "@/components/main-layout";
import PostListItem from "@/components/post-list-item";
import { VideoViewer } from "@/components/video-viewer";

export default function EventPackagePage() {
  const { eventPackageId } = useLocalSearchParams() as { eventPackageId: string };
  const { data: eventPackage } = api.auth.eventPackage.getWithPosts.useQuery({ id: eventPackageId });

  const [selectedImageUrl, setSelectedImageUrl] = useState<string>();
  const handleSelectImageUrl = useCallback((imageUrl: string) => setSelectedImageUrl(imageUrl), []);
  const handleCloseImageViewer = useCallback(() => setSelectedImageUrl(undefined), []);

  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string>();
  const handleSelectVideoUrl = useCallback((VideoUrl: string) => setSelectedVideoUrl(VideoUrl), []);
  const handleCloseVideoViewer = useCallback(() => setSelectedVideoUrl(undefined), []);

  return (
    <>
      <MainLayout
        title={eventPackage?.name}
        description={eventPackage?.description}
        contentType="scrollable"
        showBackButton
        isLoading={!eventPackage}
      >
        {eventPackage?.posts.map((post) => (
          <PostListItem
            key={post.id}
            post={post}
            isStartracker
            isVisible
            onOpenImageViewer={handleSelectImageUrl}
            onOpenVideoViewer={handleSelectVideoUrl}
          />
        ))}
      </MainLayout>
      <ImageViewer mediaUrl={selectedImageUrl} onClose={handleCloseImageViewer} />
      <VideoViewer mediaUrl={selectedVideoUrl} onClose={handleCloseVideoViewer} />
    </>
  );
}
