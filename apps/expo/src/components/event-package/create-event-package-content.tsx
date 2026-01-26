import { Platform, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { cn } from "@/utils/cn";
import { constructMediaUrl } from "@/utils/imagekit";
import { Image } from "@/components/image";
import StartrackerIcon from "@/assets/startracker_icon.svg";
import IconButton from "../ui/icon-button";
import Typography from "../ui/typography";
import type { CreatedEventPackagePost } from "./create-event-package-post-button";
import { CreateEventPackagePostButton } from "./create-event-package-post-button";

interface Props {
  posts: CreatedEventPackagePost[];
  onChange: (posts: CreatedEventPackagePost[]) => void;
}

export function CreateEventPackageContent({ onChange, posts }: Props) {
  const handleCreate = (post: CreatedEventPackagePost) => onChange([...posts, post]);
  const handleDelete = (post: CreatedEventPackagePost) => onChange(posts.filter((p) => p !== post));

  return (
    <>
      <Typography variant="h2" fontWeight="bold" cls="text-left px-3 mb-4 mt-4">
        Posts
      </Typography>
      <View className="flex flex-col">
        {posts.length === 0 && (
          <View className={cn("flex flex-col items-center justify-center p-6", Platform.OS === "android" && "py-0")}>
            <StartrackerIcon className="opacity-60" width={160} height={160} />
            <Typography variant="h2" fontWeight="bold" cls="text-center mt-6">
              No content added
            </Typography>
          </View>
        )}

        <View className="flex flex-row flex-wrap">
          {posts.map((post, index) => (
            <View key={index} className="p-1" style={{ width: "49%" }}>
              <View className="relative mb-4 aspect-square w-full overflow-hidden rounded-xl border border-white bg-black ">
                {post.media.type === "IMAGE" && (
                  <Image source={constructMediaUrl(post.media)} contentFit="cover" className="absolute h-full w-full" />
                )}

                {post.media.type === "VIDEO" && (
                  <Image
                    source={{ uri: post.media.thumbnail ? constructMediaUrl(post.media.thumbnail) : undefined }}
                    className="absolute h-full w-full"
                    contentFit="cover"
                  />
                )}

                <LinearGradient
                  className="absolute z-20 flex h-full w-full flex-col justify-between p-1"
                  colors={["rgba(0,0,0,0)", "rgba(0,0,0,1)"]}
                >
                  <View className="flex flex-row items-center justify-end">
                    <IconButton
                      onPress={() => handleDelete(post)}
                      size="xs"
                      iconName="trash"
                      cls="w-10 h-10 rounded-full  border border-white bg-black/50"
                    />
                  </View>
                  <Typography numberOfLines={3} className="p-2 text-xs text-white">
                    {post.caption}
                  </Typography>
                </LinearGradient>
              </View>
            </View>
          ))}
        </View>

        <View className="h-6" />
        <CreateEventPackagePostButton onCreate={handleCreate} />
      </View>
    </>
  );
}
