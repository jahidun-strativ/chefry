import type { FC } from "react";
import { useCallback, useState } from "react";
import { Platform, View } from "react-native";
import { useLocalSearchParams } from "expo-router";

import { api } from "@/utils/api";
import { cn } from "@/utils/cn";
import { ImageViewer } from "@/components/image-viewer";
import MainLayout from "@/components/main-layout";
import PostListItem from "@/components/post-list-item";
import { VideoViewer } from "@/components/video-viewer";

const PostPage: FC = () => {
  const { postId } = useLocalSearchParams() as { postId: string };

  const { data: post } = api.auth.post.get.useQuery({ id: postId });
  const { data: myStarFollows } = api.auth.user.myStarFollows.useQuery();
  const { data: me } = api.auth.user.me.useQuery();
  const isStartracker =
    post?.createdBy.id === me?.id || myStarFollows?.some((follow) => follow?.followedUser.id === post?.createdBy.id) || false;

  const [selectedImageUrl, setSelectedImageUrl] = useState<string>();
  const handleSelectImageUrl = useCallback((imageUrl: string) => setSelectedImageUrl(imageUrl), []);
  const handleCloseImageViewer = useCallback(() => setSelectedImageUrl(undefined), []);

  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string>();
  const handleSelectVideoUrl = useCallback((VideoUrl: string) => setSelectedVideoUrl(VideoUrl), []);
  const handleCloseVideoViewer = useCallback(() => setSelectedVideoUrl(undefined), []);

  return (
    <>
      <MainLayout showBackButton contentType="scrollable" isLoading={!post} classes={{ content: "px-2 md:px-4 lg:px-6" }}>
        {post && (
          <View className="max-w-2xl lg:max-w-3xl mx-auto w-full">
            <PostListItem
              isVisible
              isStartracker={isStartracker}
              post={post}
              cls={cn(Platform.OS === "ios" ? "mt-0" : "mt-2 md:mt-3 lg:mt-4")}
              linkPrefix="/discover"
              disableBottomPadding
              onOpenImageViewer={handleSelectImageUrl}
              onOpenVideoViewer={handleSelectVideoUrl}
            />
          </View>
        )}
      </MainLayout>
      <ImageViewer mediaUrl={selectedImageUrl} onClose={handleCloseImageViewer} />
      <VideoViewer mediaUrl={selectedVideoUrl} onClose={handleCloseVideoViewer} />
    </>
  );
};

export default PostPage;
