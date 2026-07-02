/** Tiny logger that respects the ENABLE_LOGGING flag. */
import {ENV} from '../config/env';

type LogArgs = unknown[];

export const logger = {
  info: (...args: LogArgs) => {
    if (ENV.ENABLE_LOGGING) {
      // eslint-disable-next-line no-console
      console.log('[INFO]', ...args);
    }
  },
  warn: (...args: LogArgs) => {
    if (ENV.ENABLE_LOGGING) {
      // eslint-disable-next-line no-console
      console.warn('[WARN]', ...args);
    }
  },
  error: (...args: LogArgs) => {
    // Always surface errors.
    // eslint-disable-next-line no-console
    console.error('[ERROR]', ...args);
  },
};
