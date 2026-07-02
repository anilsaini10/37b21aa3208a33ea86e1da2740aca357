/**
 * In-memory KeyValueStore implementation.
 *
 * Used as the default backend until the native MMKV backend is registered at
 * app bootstrap, and as the backend in unit tests. Pure TypeScript, no native
 * dependency.
 */
import type {KeyValueStore} from './types';

export class MemoryStore implements KeyValueStore {
  private data = new Map<string, string>();

  getString(key: string): string | undefined {
    return this.data.get(key);
  }

  set(key: string, value: string | number | boolean): void {
    this.data.set(key, String(value));
  }

  getBoolean(key: string): boolean | undefined {
    const v = this.data.get(key);
    return v === undefined ? undefined : v === 'true';
  }

  getNumber(key: string): number | undefined {
    const v = this.data.get(key);
    return v === undefined ? undefined : Number(v);
  }

  delete(key: string): void {
    this.data.delete(key);
  }

  contains(key: string): boolean {
    return this.data.has(key);
  }

  getAllKeys(): string[] {
    return Array.from(this.data.keys());
  }

  clearAll(): void {
    this.data.clear();
  }
}
