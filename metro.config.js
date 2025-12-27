const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {};

const defaultConfig = getDefaultConfig(__dirname);

// Add .bin extension for whisper.rn model files
defaultConfig.resolver.assetExts.push('bin');

module.exports = mergeConfig(defaultConfig, config);
