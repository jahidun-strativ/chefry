const fs = require("fs");
const path = require("path");

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

// Inject PWA head before </head>
html = html.replace("</head>", pwaHead + "</head>");

// Inject SW script before </body>
html = html.replace("</body>", swScript + "</body>");

fs.writeFileSync(indexPath, html);
console.log("✅ PWA configuration injected into dist/index.html");
