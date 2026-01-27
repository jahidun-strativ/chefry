// const fs = require("fs");
// const path = require("path");
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const indexPath = path.join(__dirname, "../dist/index.html");

if (!fs.existsSync(indexPath)) {
  console.error("dist/index.html not found. Run expo export first.");
  process.exit(1);
}

let html = fs.readFileSync(indexPath, "utf8");

// PWA meta tags and links to inject
const pwaHead = `
    <!-- PWA Configuration -->
    <link rel="manifest" href="/manifest.json" />
    <meta name="theme-color" content="#1F104A" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="Star Tracker" />
    <link rel="apple-touch-icon" href="/icon-192.png" />
    <meta name="description" content="Track your favorite stars and connect with them" />
`;

// Update viewport to include viewport-fit=cover for iOS PWA
/**
 * @param {string} html - The HTML string to update
 * @returns {string} The updated HTML string with viewport-fit=cover
 */
const updateViewport = (html) => {
  // Replace existing viewport meta tag with one that includes viewport-fit=cover
  return html.replace(
    /<meta\s+name="viewport"\s+content="[^"]*"\s*\/?>/i,
    '<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover" />',
  );
};

// Service worker registration script
const swScript = `
    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
          navigator.serviceWorker.register('/sw.js').then(function(registration) {
            console.log('ServiceWorker registration successful');
          }, function(err) {
            console.log('ServiceWorker registration failed: ', err);
          });
        });
      }
    </script>
`;

// Check if already injected
if (html.includes('rel="manifest"')) {
  console.log("PWA links already present in index.html");
  process.exit(0);
}

// Update viewport meta tag
html = updateViewport(html);

// Inject PWA head before </head>
html = html.replace("</head>", pwaHead + "</head>");

// Inject SW script before </body>
html = html.replace("</body>", swScript + "</body>");

fs.writeFileSync(indexPath, html);
console.log("✅ PWA configuration injected into dist/index.html");
