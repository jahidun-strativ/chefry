import { useEffect, useState } from "react";
import { Platform, View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Only run on web
    if (Platform.OS !== "web") {
      return;
    }

    // Check if app is already installed
    if (typeof window !== "undefined") {
      // Detect iOS
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
      setIsIOS(isIOSDevice);

      // Check if running in standalone mode (installed)
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
      // iOS Safari standalone mode check
      const nav = window.navigator as { standalone?: boolean };
      const isIOSStandalone = nav.standalone === true;
      
      if (isStandalone || isIOSStandalone) {
        setIsInstalled(true);
        console.log("PWA: App is already installed");
        return;
      }

      // Check if user has dismissed the prompt before (stored in localStorage)
      const dismissed = localStorage.getItem("pwa-install-dismissed");
      if (dismissed) {
        const dismissedTime = parseInt(dismissed, 10);
        const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
        // Show again after 7 days
        if (daysSinceDismissed < 7) {
          console.log("PWA: Install prompt was dismissed recently, not showing");
          return;
        }
      }

      // Listen for the beforeinstallprompt event
      const handleBeforeInstallPrompt = (e: Event) => {
        console.log("PWA: beforeinstallprompt event fired");
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        setShowPrompt(true);
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

      // For debugging: check if service worker is registered
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          console.log("PWA: Service worker registrations:", registrations.length);
        });
      }

      // Show prompt after a delay (5 seconds) if not already shown
      // For iOS, show manual install instructions even without beforeinstallprompt
      const timer = setTimeout(() => {
        if (isIOSDevice && !deferredPrompt) {
          console.log("PWA: Showing iOS install instructions");
          setShowPrompt(true);
        } else if (!isIOSDevice && !deferredPrompt) {
          console.log("PWA: No beforeinstallprompt event received after 5 seconds");
        }
      }, 5000);

      return () => {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        clearTimeout(timer);
      };
    }
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    console.log("PWA: Install button clicked");
    
    // iOS doesn't support beforeinstallprompt, show manual instructions
    if (isIOS) {
      setShowPrompt(false);
      // Store that user saw the instructions
      if (typeof window !== "undefined") {
        localStorage.setItem("pwa-install-dismissed", Date.now().toString());
      }
      return;
    }

    if (!deferredPrompt) {
      console.log("PWA: No deferred prompt available");
      return;
    }

    try {
      // Show the install prompt
      await deferredPrompt.prompt();

      // Wait for the user to respond
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        console.log("PWA: User accepted the install prompt");
        setShowPrompt(false);
        setDeferredPrompt(null);
      } else {
        console.log("PWA: User dismissed the install prompt");
        // Store dismissal in localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("pwa-install-dismissed", Date.now().toString());
        }
        setShowPrompt(false);
      }
    } catch (error) {
      console.error("PWA: Error during install prompt:", error);
    }
  };

  const handleDismiss = () => {
    console.log("PWA: Install prompt dismissed");
    setShowPrompt(false);
    // Store dismissal in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("pwa-install-dismissed", Date.now().toString());
    }
  };

  // Don't show on native platforms or if already installed
  if (Platform.OS !== "web" || isInstalled || !showPrompt) {
    return null;
  }

  // For iOS, show even without deferredPrompt (manual install)
  // For other browsers, need deferredPrompt
  if (!isIOS && !deferredPrompt) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Install Star Tracker</Text>
        <Text style={styles.message}>
          {isIOS
            ? "Tap the Share button and select 'Add to Home Screen' to install the app."
            : "Install our app for a better experience. Get quick access and work offline."}
        </Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.dismissButton} onPress={handleDismiss}>
            <Text style={styles.dismissButtonText}>Not now</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.installButton} onPress={handleInstallClick}>
            <Text style={styles.installButtonText}>{isIOS ? "Got it" : "Install"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    zIndex: 9999,
    backgroundColor: "#1F104A",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  content: {
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  message: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  dismissButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  dismissButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  installButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  installButtonText: {
    color: "#1F104A",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default PWAInstallPrompt;
