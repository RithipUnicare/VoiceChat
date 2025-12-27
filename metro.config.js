const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const defaultAssetExts =
  require('metro-config/src/defaults/defaults').assetExts;

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    assetExts: [
      ...defaultAssetExts,
      'bin', // whisper.rn: ggml model binary
    ],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
