// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Configure path resolution for @ imports
config.resolver.extraNodeModules = {
  '@': path.resolve(__dirname),
};

module.exports = config;