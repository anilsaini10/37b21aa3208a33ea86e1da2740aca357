import {useSyncExternalStore} from 'react';
import {networkStore} from './networkStore';

export function useNetwork(): {isConnected: boolean} {
  const isConnected = useSyncExternalStore(
    networkStore.subscribe,
    () => networkStore.isConnected,
  );
  return {isConnected};
}
