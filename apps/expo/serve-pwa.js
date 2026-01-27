#!/usr/bin/env node
import { existsSync, readFileSync } from "fs";
import { createServer } from "http";
import { extname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, "..");

const PORT = process.env.PORT || 3001;
const DIST_DIR = join(__dirname, "dist");

const mimeTypes = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".ttf": "font/ttf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

const server = createServer((req, res) => {
  let filePath = join(DIST_DIR, req.url === "/" ? "index.html" : req.url);

  // Handle client-side routing - serve index.html for non-file requests
  if (!existsSync(filePath) && !extname(req.url)) {
    filePath = join(DIST_DIR, "index.html");
  }

  if (!existsSync(filePath)) {
    res.writeHead(404);
    res.end("Not Found");
    return;
  }

  const ext = extname(filePath);
  const contentType = mimeTypes[ext] || "application/octet-stream";

  // Add PWA headers
  res.setHeader("Content-Type", contentType);
  res.setHeader("Cache-Control", "no-cache");

  // Add HTTPS headers for PWA (required for service workers)
  if (req.url === "/sw.js") {
    res.setHeader("Service-Worker-Allowed", "/");
  }

  try {
    const content = readFileSync(filePath);
    res.writeHead(200);
    res.end(content);
  } catch (error) {
    res.writeHead(500);
    res.end("Internal Server Error");
  }
});

server.listen(PORT, () => {
  console.log(`🚀 PWA server running at http://localhost:${PORT}`);
  console.log(`📱 Test PWA installation by opening in Chrome/Edge`);
  console.log(`🔧 Make sure to build first: pnpm build:web`);
});
