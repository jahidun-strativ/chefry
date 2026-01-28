#!/usr/bin/env node

/**
 * OAuth URL Setup Helper
 *
 * This script helps you identify the correct OAuth redirect URLs
 * for your Clerk dashboard configuration.
 */

console.log("🔐 OAuth URL Setup Helper\n");

// Get the current deployment URL if available
const currentUrl = process.env.EXPO_PUBLIC_URL || "https://startracker--[deployment-id].expo.app";

console.log("📋 Add these URLs to your Clerk Dashboard:");
console.log("   Go to: https://dashboard.clerk.com/");
console.log("   Navigate to: Configure > OAuth redirect URLs\n");

console.log("🌐 Production URLs (Expo Hosting):");
console.log(`   ${currentUrl}/oauth-native-callback`);
console.log("   https://startracker--*.expo.app/oauth-native-callback (wildcard)\n");

console.log("🏠 Local Development URLs:");
console.log("   http://localhost:3001/oauth-native-callback");
console.log("   http://localhost:8081/oauth-native-callback\n");

console.log("📱 Expo Development URLs:");
console.log("   exp://localhost:8081/oauth-native-callback\n");

console.log("🔧 Google OAuth Setup:");
console.log("   1. Go to: https://console.cloud.google.com/");
console.log("   2. Select your project");
console.log("   3. Enable Google+ API");
console.log("   4. Create OAuth 2.0 credentials");
console.log("   5. Add the same redirect URLs above\n");

console.log("⚠️  Important Notes:");
console.log("   - Expo generates dynamic URLs for each deployment");
console.log("   - You may need to update URLs after each deployment");
console.log("   - Consider using a custom domain for production");
console.log("   - Ensure HTTPS is enabled for production URLs\n");

console.log("🐛 Debugging:");
console.log("   - Enable OAuth debug component in _layout.tsx");
console.log("   - Check browser console for OAuth logs");
console.log("   - Verify redirect URLs match exactly\n");

console.log("✅ Next Steps:");
console.log("   1. Add URLs to Clerk Dashboard");
console.log("   2. Add URLs to Google OAuth settings");
console.log("   3. Test OAuth flow on different browsers");
console.log("   4. Deploy and test in production");
