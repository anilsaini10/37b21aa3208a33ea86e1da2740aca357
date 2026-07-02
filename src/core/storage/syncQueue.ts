/**
 * Offline-first sync queue.
 *
 * Mutations performed while offline are appended here and flushed (in FIFO
 * order) when connectivity returns. The queue is persisted to storage so it
 * survives app restarts. Pure logic — the network flush handler is injected,
 * which keeps the queue fully unit-testable.
 */
import {storage, StorageKeys} from './storage';

export type SyncMethod = 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface SyncTask {
  id: string;
  endpoint: string;
  method: SyncMethod;
  payload?: unknown;
  /** Epoch millis; supplied by caller (keeps this module deterministic). */
  createdAt: number;
  retries: number;
}

/** Handler that actually performs the network call for a queued task. */
export type FlushHandler = (task: SyncTask) => Promise<void>;

const MAX_RETRIES = 5;

export class SyncQueue {
  private tasks: SyncTask[];

  constructor() {
    this.tasks = storage.getObject<SyncTask[]>(StorageKeys.SYNC_QUEUE) ?? [];
  }

  private persist(): void {
    storage.setObject(StorageKeys.SYNC_QUEUE, this.tasks);
  }

  get size(): number {
    return this.tasks.length;
  }

  list(): readonly SyncTask[] {
    return [...this.tasks];
  }

  enqueue(task: Omit<SyncTask, 'retries'>): SyncTask {
    const full: SyncTask = {...task, retries: 0};
    this.tasks.push(full);
    this.persist();
    return full;
  }

  remove(id: string): void {
    this.tasks = this.tasks.filter(t => t.id !== id);
    this.persist();
  }

  /**
   * Flush the queue FIFO. Successful tasks are removed; failed tasks have their
   * retry counter incremented and are dropped once `MAX_RETRIES` is exceeded.
   * Returns the number of tasks successfully synced.
   */
  async flush(handler: FlushHandler): Promise<number> {
    let synced = 0;
    const remaining: SyncTask[] = [];
    // Snapshot to avoid mutating while iterating.
    for (const task of [...this.tasks]) {
      try {
        await handler(task);
        synced += 1;
      } catch {
        const retried = {...task, retries: task.retries + 1};
        if (retried.retries <= MAX_RETRIES) {
          remaining.push(retried);
        }
        // else: give up on this task (dropped).
      }
    }
    this.tasks = remaining;
    this.persist();
    return synced;
  }

  clear(): void {
    this.tasks = [];
    this.persist();
  }
}
