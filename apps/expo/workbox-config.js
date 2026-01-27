module.exports = {
  globDirectory: "dist/",
  globPatterns: ["**/*.{js,html,css,png,jpg,jpeg,gif,svg,woff,woff2,ttf,eot,ico,json}"],
  globIgnores: ["**/node_modules/**/*", "sw.js", "workbox-*.js"],
  swDest: "dist/sw.js",
  clientsClaim: true,
  skipWaiting: true,
  maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10 MB (to cache the main JS bundle)
  runtimeCaching: [
    {
      // Cache images
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
      handler: "CacheFirst",
      options: {
        cacheName: "images",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    {
      // Cache fonts
      urlPattern: /\.(?:woff|woff2|ttf|eot)$/,
      handler: "CacheFirst",
      options: {
        cacheName: "fonts",
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        },
      },
    },
    {
      // Cache API requests
      urlPattern: /^https:\/\/startracker\.vercel\.app\/api\//,
      handler: "NetworkFirst",
      options: {
        cacheName: "api-cache",
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 5 * 60, // 5 minutes
        },
      },
    },
    {
      // Cache other requests
      urlPattern: /^https?.*/,
      handler: "NetworkFirst",
      options: {
        cacheName: "general-cache",
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
  ],
};
