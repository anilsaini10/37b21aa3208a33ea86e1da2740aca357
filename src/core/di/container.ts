/**
 * Minimal dependency-injection container (service locator).
 *
 * Keeps construction of services in one place and lets tests swap
 * implementations. Services are registered lazily via factory functions and
 * memoised on first resolve.
 */
type Factory<T> = () => T;

class Container {
  private factories = new Map<string, Factory<unknown>>();
  private instances = new Map<string, unknown>();

  register<T>(token: string, factory: Factory<T>): void {
    this.factories.set(token, factory);
    // Invalidate any previously-resolved instance so re-registration takes effect.
    this.instances.delete(token);
  }

  resolve<T>(token: string): T {
    if (this.instances.has(token)) {
      return this.instances.get(token) as T;
    }
    const factory = this.factories.get(token);
    if (!factory) {
      throw new Error(`No provider registered for token "${token}"`);
    }
    const instance = factory();
    this.instances.set(token, instance);
    return instance as T;
  }

  has(token: string): boolean {
    return this.factories.has(token);
  }

  reset(): void {
    this.factories.clear();
    this.instances.clear();
  }
}

export const container = new Container();

export const Tokens = {
  ApiClient: 'ApiClient',
  SyncQueue: 'SyncQueue',
} as const;
