#!/usr/bin/env node

import { execSync } from "child_process";
import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sourceIcon = join(__dirname, "../assets/icon.png");
const publicDir = join(__dirname, "../public");

// Icon sizes needed for PWA
const iconSizes = [
  { size: 72, name: "icon-72.png", purpose: "any" },
  { size: 96, name: "icon-96.png", purpose: "any" },
  { size: 128, name: "icon-128.png", purpose: "any" },
  { size: 144, name: "icon-144.png", purpose: "any" },
  { size: 152, name: "icon-152.png", purpose: "any" },
  { size: 180, name: "icon-180.png", purpose: "any" },
  { size: 192, name: "icon-192.png", purpose: "any" },
  { size: 384, name: "icon-384.png", purpose: "any" },
  { size: 512, name: "icon-512.png", purpose: "any" },
  { size: 192, name: "icon-192-maskable.png", purpose: "maskable" },
  { size: 512, name: "icon-512-maskable.png", purpose: "maskable" },
];

console.log("🎨 Generating PWA icons...");

if (!existsSync(sourceIcon)) {
  console.error(`❌ Source icon not found: ${sourceIcon}`);
  process.exit(1);
}

// Check if we have sips (macOS) or convert (ImageMagick)
let resizeCommand = null;
try {
  execSync("which sips", { stdio: "ignore" });
  resizeCommand = "sips";
  console.log("✅ Using sips for image resizing");
} catch {
  try {
    execSync("which convert", { stdio: "ignore" });
    resizeCommand = "convert";
    console.log("✅ Using ImageMagick convert for image resizing");
  } catch {
    console.error("❌ Neither sips nor ImageMagick convert found. Please install one of them.");
    process.exit(1);
  }
}

// Generate icons
for (const icon of iconSizes) {
  const outputPath = join(publicDir, icon.name);

  try {
    if (resizeCommand === "sips") {
      execSync(`sips -z ${icon.size} ${icon.size} "${sourceIcon}" --out "${outputPath}"`, { stdio: "ignore" });
    } else {
      execSync(`convert "${sourceIcon}" -resize ${icon.size}x${icon.size} "${outputPath}"`, { stdio: "ignore" });
    }
    console.log(`✅ Generated ${icon.name} (${icon.size}x${icon.size})`);
  } catch (error) {
    console.error(`❌ Failed to generate ${icon.name}:`, error.message);
  }
}

console.log("🎉 PWA icons generated successfully!");
console.log("📝 Make sure to run the build process to update the manifest.");
