module.exports = function (api) {
  api.cache(true);

  let moduleResolverPlugin;
  try {
    moduleResolverPlugin = require('babel-plugin-module-resolver');
  } catch (error) {
    moduleResolverPlugin = require('./babel-module-resolver-fallback');
  }

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        moduleResolverPlugin,
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@/components': './src/ui/components',
            '@/engine': './src/engine',
            '@/identity': './src/identity',
            '@/store': './src/store',
            '@/providers': './src/providers',
            '@/config': './src/config',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
