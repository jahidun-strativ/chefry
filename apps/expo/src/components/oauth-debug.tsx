import { useEffect, useState } from "react";
import { Platform, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useAuth, useClerk } from "@clerk/clerk-expo";

const OAuthDebug = () => {
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(false);
  const { isSignedIn, userId } = useAuth();
  const clerk = useClerk();

  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") {
      return;
    }

    const info: string[] = [];
    
    // Environment info
    info.push(`Environment: ${process.env.NODE_ENV || 'unknown'}`);
    info.push(`Origin: ${window.location.origin}`);
    info.push(`Pathname: ${window.location.pathname}`);
    info.push(`Search: ${window.location.search}`);
    
    // Expo hosting detection
    const isExpoHosting = window.location.origin.includes('.expo.app');
    info.push(`Expo Hosting: ${isExpoHosting}`);
    
    if (isExpoHosting) {
      const match = window.location.origin.match(/https:\/\/([^-]+)--([^.]+)\.expo\.app/);
      if (match) {
        info.push(`App Name: ${match[1]}`);
        info.push(`Deployment ID: ${match[2]}`);
      }
    }
    
    // User agent
    info.push(`User Agent: ${window.navigator.userAgent}`);
    
    // Browser detection
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSWeb = /iphone|ipad|ipod/.test(userAgent);
    const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);
    const isChrome = /chrome/.test(userAgent);
    
    info.push(`iOS Web: ${isIOSWeb}`);
    info.push(`Safari: ${isSafari}`);
    info.push(`Chrome: ${isChrome}`);
    
    // Auth state
    info.push(`Signed In: ${isSignedIn}`);
    info.push(`User ID: ${userId || 'none'}`);
    
    // Clerk info
    info.push(`Clerk Loaded: ${clerk.loaded}`);
    info.push(`Clerk Key: ${process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY?.substring(0, 20)}...`);
    
    // URL parameters (for OAuth callback debugging)
    const urlParams = new URLSearchParams(window.location.search);
    const hasOAuthParams = urlParams.has('code') || urlParams.has('state') || urlParams.has('error');
    info.push(`OAuth Params: ${hasOAuthParams}`);
    
    if (hasOAuthParams) {
      info.push(`Code: ${urlParams.get('code') ? 'present' : 'missing'}`);
      info.push(`State: ${urlParams.get('state') || 'missing'}`);
      info.push(`Error: ${urlParams.get('error') || 'none'}`);
      info.push(`Error Description: ${urlParams.get('error_description') || 'none'}`);
    }
    
    // HTTPS check
    info.push(`HTTPS: ${window.location.protocol === 'https:'}`);
    
    // Redirect URL that would be used
    const redirectUrl = `${window.location.origin}/oauth-native-callback`;
    info.push(`Redirect URL: ${redirectUrl}`);
    
    setDebugInfo(info);
  }, [isSignedIn, userId, clerk.loaded]);

  if (Platform.OS !== "web") {
    return null;
  }

  return (
    <>
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => setShowDebug(!showDebug)}
      >
        <Text style={styles.toggleText}>
          {showDebug ? "Hide" : "Show"} OAuth Debug
        </Text>
      </TouchableOpacity>
      
      {showDebug && (
        <View style={styles.container}>
          <Text style={styles.title}>OAuth Debug Info</Text>
          {debugInfo.map((info, index) => (
            <Text key={index} style={styles.info}>
              {info}
            </Text>
          ))}
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  toggleButton: {
    position: "absolute",
    top: 60,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 8,
    borderRadius: 4,
    zIndex: 10001,
  },
  toggleText: {
    color: "#FFFFFF",
    fontSize: 12,
  },
  container: {
    position: "absolute",
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    padding: 16,
    borderRadius: 8,
    zIndex: 10000,
    maxHeight: 400,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  info: {
    color: "#FFFFFF",
    fontSize: 11,
    marginBottom: 2,
    fontFamily: "monospace",
  },
});

export default OAuthDebug;