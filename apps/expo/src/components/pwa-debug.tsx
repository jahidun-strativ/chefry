import { useEffect, useState } from "react";
import { Platform, View, Text, StyleSheet } from "react-native";

const PWADebug = () => {
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") {
      return;
    }

    const info: string[] = [];
    
    // Check user agent
    info.push(`User Agent: ${window.navigator.userAgent}`);
    
    // Check if service worker is supported
    info.push(`Service Worker Support: ${'serviceWorker' in navigator}`);
    
    // Check if app is installed
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    const nav = window.navigator as { standalone?: boolean };
    const isIOSStandalone = nav.standalone === true;
    info.push(`Standalone Mode: ${isStandalone || isIOSStandalone}`);
    
    // Check manifest
    const manifestLink = document.querySelector('link[rel="manifest"]');
    info.push(`Manifest Link: ${!!manifestLink}`);
    
    // Check if beforeinstallprompt was fired
    let beforeInstallPromptFired = false;
    const handleBeforeInstallPrompt = () => {
      beforeInstallPromptFired = true;
      info.push("beforeinstallprompt: FIRED");
      setDebugInfo([...info]);
    };
    
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    
    // Check after 3 seconds
    setTimeout(() => {
      if (!beforeInstallPromptFired) {
        info.push("beforeinstallprompt: NOT FIRED");
      }
      
      // Check service worker registration
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          info.push(`SW Registrations: ${registrations.length}`);
          setDebugInfo([...info]);
        });
      }
      
      setDebugInfo([...info]);
    }, 3000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  if (Platform.OS !== "web") {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PWA Debug Info</Text>
      {debugInfo.map((info, index) => (
        <Text key={index} style={styles.info}>
          {info}
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    padding: 16,
    borderRadius: 8,
    zIndex: 10000,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  info: {
    color: "#FFFFFF",
    fontSize: 12,
    marginBottom: 4,
    fontFamily: "monospace",
  },
});

export default PWADebug;