#!/usr/bin/env node

import { execSync } from "child_process";
import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sourceLogo = join(__dirname, "../assets/main-logo.png");
const outputSplash = join(__dirname, "../assets/splash.png");
const backgroundColor = "#1F104A"; // Using existing theme color

console.log("🎨 Generating splash screen...");

if (!existsSync(sourceLogo)) {
  console.error(`❌ Source logo not found: ${sourceLogo}`);
  process.exit(1);
}

// Check if we have sips (macOS) or convert (ImageMagick)
let resizeCommand = null;
try {
  execSync("which sips", { stdio: "ignore" });
  resizeCommand = "sips";
  console.log("✅ Using sips for image processing");
} catch {
  try {
    execSync("which convert", { stdio: "ignore" });
    resizeCommand = "convert";
    console.log("✅ Using ImageMagick convert for image processing");
  } catch {
    console.error("❌ Neither sips nor ImageMagick convert found. Please install one of them.");
    process.exit(1);
  }
}

// Create splash screen: 1284x2778 (common high-res size that works for both iOS and Android)
// Center the logo with padding
const splashWidth = 1284;
const splashHeight = 2778;
const logoSize = 600; // Logo size on splash screen
const padding = (splashHeight - logoSize) / 2; // Center vertically

try {
  if (resizeCommand === "sips") {
    // For sips, we'll use a simpler approach: resize logo and pad it
    const tempLogo = join(__dirname, "../assets/temp-logo-splash.png");
    // Resize logo first
    execSync(`sips -z ${logoSize} ${logoSize} "${sourceLogo}" --out "${tempLogo}"`, { stdio: "ignore" });
    // Create a temporary script to pad with background color using Python (fallback)
    // Actually, let's use ImageMagick if available, otherwise use a Python script
    try {
      execSync("which convert", { stdio: "ignore" });
      // Use ImageMagick instead
      execSync(
        `convert -size ${splashWidth}x${splashHeight} xc:"${backgroundColor}" \\( "${tempLogo}" \\) -gravity center -composite "${outputSplash}"`,
        { stdio: "ignore" }
      );
    } catch {
      // Fallback: just copy the resized logo (sips doesn't support padding well)
      // We'll create a simple colored background using Python if available
      console.log("⚠️  Using simplified approach - copying resized logo");
      execSync(`cp "${tempLogo}" "${outputSplash}"`, { stdio: "ignore" });
    }
    // Clean up temp file
    if (existsSync(tempLogo)) {
      execSync(`rm "${tempLogo}"`, { stdio: "ignore" });
    }
  } else {
    // Using ImageMagick
    // Create background and composite logo
    execSync(
      `convert -size ${splashWidth}x${splashHeight} xc:"${backgroundColor}" \\( "${sourceLogo}" -resize ${logoSize}x${logoSize} \\) -gravity center -composite "${outputSplash}"`,
      { stdio: "ignore" }
    );
  }
  console.log(`✅ Generated splash screen: ${outputSplash} (${splashWidth}x${splashHeight})`);
  console.log("🎉 Splash screen generated successfully!");
} catch (error) {
  console.error(`❌ Failed to generate splash screen:`, error.message);
  // Fallback: just copy the main logo as splash (Expo will handle sizing)
  console.log("⚠️  Falling back to copying main-logo.png as splash.png");
  try {
    execSync(`cp "${sourceLogo}" "${outputSplash}"`, { stdio: "ignore" });
    console.log("✅ Copied main-logo.png as splash.png (fallback)");
  } catch (fallbackError) {
    console.error(`❌ Fallback also failed:`, fallbackError.message);
    process.exit(1);
  }
}
