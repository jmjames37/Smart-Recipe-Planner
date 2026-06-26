// Learn more: https://docs.expo.dev/guides/customizing-metro/
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Expo's web export bundles to a classic <script> (not type="module"). zustand's
// ESM build (chosen by the web bundler's `import` export condition) uses
// `import.meta`, which is a syntax error there and blanks the whole page.
// Resolve zustand's CommonJS build on web instead — it uses process.env.NODE_ENV
// and has no `import.meta`. Native is unaffected (it uses the `react-native`
// export condition, which already maps to the CommonJS build).
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName === 'zustand') {
    return {
      type: 'sourceFile',
      filePath: path.join(__dirname, 'node_modules', 'zustand', 'index.js'),
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
