/**
 * Storage abstraction.
 *
 * A minimal synchronous key/value contract that both the native MMKV backend
 * and the in-memory test backend implement. Feature code depends only on this
 * interface — never on `react-native-mmkv` directly — which keeps business
 * logic unit-testable in a plain Node environment.
 */
export interface KeyValueStore {
  getString(key: string): string | undefined;
  set(key: string, value: string | number | boolean): void;
  getBoolean(key: string): boolean | undefined;
  getNumber(key: string): number | undefined;
  delete(key: string): void;
  contains(key: string): boolean;
  getAllKeys(): string[];
  clearAll(): void;
}
