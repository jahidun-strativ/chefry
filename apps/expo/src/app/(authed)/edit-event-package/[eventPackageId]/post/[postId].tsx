import { useCallback, useState } from "react";
import { useLocalSearchParams } from "expo-router";

import { api } from "@/utils/api";
import { ImageViewer } from "@/components/image-viewer";
import MainLayout from "@/components/main-layout";
import PostListItem from "@/components/post-list-item";
import { VideoViewer } from "@/components/video-viewer";

export default function ViewEventPackagePostPage() {
  const { postId } = useLocalSearchParams() as { postId: string };
  const { data: post } = api.auth.post.get.useQuery({ id: postId });

  const [selectedImageUrl, setSelectedImageUrl] = useState<string>();
  const handleSelectImageUrl = useCallback((imageUrl: string) => setSelectedImageUrl(imageUrl), []);
  const handleCloseImageViewer = useCallback(() => setSelectedImageUrl(undefined), []);

  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string>();
  const handleSelectVideoUrl = useCallback((VideoUrl: string) => setSelectedVideoUrl(VideoUrl), []);
  const handleCloseVideoViewer = useCallback(() => setSelectedVideoUrl(undefined), []);

  return (
    <>
      <MainLayout showBackButton contentType="scrollable" isLoading={!post}>
        {post && (
          <PostListItem
            post={post}
            isStartracker
            isVisible
            linkPrefix="/feed"
            onOpenImageViewer={handleSelectImageUrl}
            onOpenVideoViewer={handleSelectVideoUrl}
          />
        )}
      </MainLayout>
      <ImageViewer mediaUrl={selectedImageUrl} onClose={handleCloseImageViewer} />
      <VideoViewer mediaUrl={selectedVideoUrl} onClose={handleCloseVideoViewer} />
    </>
  );
}
