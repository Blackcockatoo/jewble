module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
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
