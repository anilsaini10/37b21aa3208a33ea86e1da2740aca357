module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./'],
        alias: {
          '@app': './src/app',
          '@core': './src/core',
          '@features': './src/features',
          '@shared': './src/shared',
          '@navigation': './src/navigation',
          '@assets': './src/assets',
        },
      },
    ],
    // react-native-reanimated/plugin must be listed last.
    'react-native-reanimated/plugin',
  ],
};
