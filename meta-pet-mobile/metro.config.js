const path = require('path');
const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

config.watchFolders = [...(config.watchFolders || []), path.resolve(__dirname, '../packages')];

config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  '@metapet/core': path.resolve(__dirname, '../packages/core/src'),
};

module.exports = config;
