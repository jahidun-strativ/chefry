import { Platform, View, StyleSheet, Text } from "react-native";
import { useEffect } from "react";

// Log immediately when module loads
console.log("[NewPostPage] MODULE LOADED - Platform.OS:", Platform.OS);

export default function NewPostPage() {
  console.log("[NewPostPage] FUNCTION CALLED - Component rendering, Platform.OS:", Platform.OS);
  
  useEffect(() => {
    console.log("[NewPostPage] useEffect - Component mounted, Platform.OS:", Platform.OS);
    return () => {
      console.log("[NewPostPage] useEffect cleanup - Component unmounting");
    };
  }, []);

  // On web, show a message since post creation requires native modules
  if (Platform.OS === "web") {
    console.log("[NewPostPage] Platform.OS === 'web' is TRUE - Rendering web version");
    return (
      <View style={styles.wrapper}>
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.title}>Create Post</Text>
            <Text style={styles.message}>
              Post creation is only available on mobile devices. Please use the iOS or Android app to create posts.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // On native platforms, this is handled by the CreatePostButton in the tab bar
  console.log("[NewPostPage] Platform.OS !== 'web' - Rendering null for native platform, Platform.OS:", Platform.OS);
  return null;
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "#1F104A",
  },
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  content: {
    maxWidth: 600,
    width: "100%",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    lineHeight: 24,
  },
});
