import { Platform, View } from "react-native";
import Typography from "@/components/ui/typography";

export default function NewPostPage() {
  // On web, show a message since post creation requires native modules
  if (Platform.OS === "web") {
    return (
      <View className="flex flex-1 items-center justify-center p-4">
        <Typography variant="h2" fontWeight="bold" cls="text-center text-white mb-4">
          Create Post
        </Typography>
        <Typography variant="p" cls="text-center text-white/70">
          Post creation is only available on mobile devices. Please use the iOS or Android app to create posts.
        </Typography>
      </View>
    );
  }

  // On native platforms, this is handled by the CreatePostButton in the tab bar
  return null;
}
