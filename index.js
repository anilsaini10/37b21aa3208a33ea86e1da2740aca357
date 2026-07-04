/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { registerBackgroundHandler } from './src/core/notifications';

// Must run at the top level, outside the React tree — Firebase invokes this
// even while the app process is fully killed (Android) when a push arrives.
// Guarded: on a platform where Firebase hasn't been configured yet (e.g. iOS
// without GoogleService-Info.plist), this must not crash app startup.
try {
  registerBackgroundHandler();
} catch (e) {
  console.warn('Push background handler not registered — Firebase not configured on this platform yet.', e);
}

AppRegistry.registerComponent(appName, () => App);
