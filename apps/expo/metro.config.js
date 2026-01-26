// // Learn more: https://docs.expo.dev/guides/monorepos/
// const { getDefaultConfig } = require("@expo/metro-config");
// const path = require("path");

// const projectRoot = __dirname;
// const workspaceRoot = path.resolve(projectRoot, "../..");

// // Create the default Metro config
// const config = getDefaultConfig(projectRoot);

// const { transformer, resolver } = config;

// config.transformer = {
//   ...transformer,
//   babelTransformerPath: require.resolve("react-native-svg-transformer"),
// };

// config.resolver = {
//   ...resolver,
//   assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
//   sourceExts: [...resolver.sourceExts, "svg"],
// };

// // Add import aliases
// config.resolver.alias = {
//   "~": path.resolve(projectRoot, "src"),
// };

// // Add the additional `cjs` extension to the resolver
// config.resolver.sourceExts.push("cjs");

// // 1. Watch all files within the monorepo
// config.watchFolders = [workspaceRoot];
// // 2. Let Metro know where to resolve packages and in what order
// config.resolver.nodeModulesPaths = [path.resolve(projectRoot, "node_modules"), path.resolve(workspaceRoot, "node_modules")];
// // 3. Force Metro to resolve (sub)dependencies only from the `nodeModulesPaths`
// // config.resolver.disableHierarchicalLookup = true;

// module.exports = config;

// Learn more: https://docs.expo.dev/guides/monorepos/
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

module.exports = () => {
  const config = getDefaultConfig(__dirname);

  const { transformer, resolver } = config;

  config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve("react-native-svg-transformer/expo"),
  };

  config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
    sourceExts: [...resolver.sourceExts, "svg"],
    // Platform-specific module resolution
    resolveRequest: (context, moduleName, platform) => {
      // Mock @stripe/stripe-react-native on web
      if (platform === "web" && moduleName === "@stripe/stripe-react-native") {
        return {
          filePath: path.resolve(__dirname, "stripe-mock.web.js"),
          type: "sourceFile",
        };
      }
      // Use default resolution
      return context.resolveRequest(context, moduleName, platform);
    },
  };

  return withNativeWind(config, {
    input: "./src/styles.css",
    configPath: "./tailwind.config.ts",
  });
};
