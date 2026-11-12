import {NativeModules, NativeEventEmitter} from 'react-native';
import {logger} from '../utils/logger';

const {NetworkMonitor} = NativeModules;

type NetworkListener = (isConnected: boolean) => void;

let connected = true;
let listening = false;
const listeners = new Set<NetworkListener>();

function update(next: boolean): void {
  if (next === connected) {
    return;
  }
  connected = next;
  logger.info('Network status changed:', connected ? 'online' : 'offline');
  for (const fn of listeners) {
    fn(connected);
  }
}

export const networkStore = {
  get isConnected(): boolean {
    return connected;
  },

  subscribe(fn: NetworkListener): () => void {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },

  start(): void {
    if (listening) {
      return;
    }
    listening = true;

    const emitter = new NativeEventEmitter(NetworkMonitor);
    emitter.addListener('networkStatusChanged', (isConnected: boolean) => {
      update(isConnected);
    });

    NetworkMonitor.startListening().catch((e: unknown) => {
      logger.warn('NetworkMonitor.startListening failed', e);
    });

    NetworkMonitor.isConnected()
      .then((val: boolean) => update(val))
      .catch(() => {});
  },

  async refresh(): Promise<boolean> {
    try {
      const val: boolean = await NetworkMonitor.isConnected();
      update(val);
    } catch (e) {
      logger.warn('Network refresh failed', e);
    }
    return connected;
  },
};
