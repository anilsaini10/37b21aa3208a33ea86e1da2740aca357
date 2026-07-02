/**
 * Native MMKV backend (react-native-mmkv v4, nitro-based API).
 *
 * Imported ONLY from the app bootstrap (`src/app/bootstrap.ts`) so that pure
 * logic + unit tests never pull in the native module. Implements the same
 * `KeyValueStore` contract as `MemoryStore`.
 */
import {createMMKV} from 'react-native-mmkv';
import type {KeyValueStore} from './types';

const mmkv = createMMKV({id: 'schoolms.storage'});

export const mmkvBackend: KeyValueStore = {
  getString: key => mmkv.getString(key),
  set: (key, value) => mmkv.set(key, value),
  getBoolean: key => mmkv.getBoolean(key),
  getNumber: key => mmkv.getNumber(key),
  // v4 renamed `delete` -> `remove` (returns whether a key was removed).
  delete: key => {
    mmkv.remove(key);
  },
  contains: key => mmkv.contains(key),
  getAllKeys: () => mmkv.getAllKeys(),
  clearAll: () => mmkv.clearAll(),
};
