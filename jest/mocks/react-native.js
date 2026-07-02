/**
 * Minimal `react-native` stub for the pure-logic unit-test environment.
 *
 * The guaranteed suite only touches modules that import `Platform` / `StyleSheet`
 * (e.g. the typography/theme layer). Rendering-level tests would use the full
 * `react-native` preset instead; here we only need these primitives so logic
 * modules import cleanly under ts-jest in Node.
 */
module.exports = {
  Platform: {
    OS: 'ios',
    select: obj => (obj.ios !== undefined ? obj.ios : obj.default),
  },
  StyleSheet: {
    create: styles => styles,
    flatten: style => style,
  },
  Dimensions: {
    get: () => ({width: 390, height: 844, scale: 2, fontScale: 1}),
  },
};
