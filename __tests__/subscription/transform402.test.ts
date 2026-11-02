/** Unit tests for the 402 PAYMENT_REQUIRED interceptor. */
import {
  notifyPaymentRequired,
  setPaymentRequiredHandler,
  notifyUnauthorized,
  setUnauthorizedHandler,
} from '../../src/core/api/sessionEvents';

describe('sessionEvents: paymentRequired', () => {
  afterEach(() => setPaymentRequiredHandler(() => {}));

  it('calls handler with feature and reason on 402', () => {
    const handler = jest.fn();
    setPaymentRequiredHandler(handler);
    notifyPaymentRequired({feature: 'exams', reason: 'TRIAL_ENDED'});
    expect(handler).toHaveBeenCalledWith({feature: 'exams', reason: 'TRIAL_ENDED'});
  });

  it('does not crash when no handler is registered', () => {
    // Reset by setting a noop then overriding with nothing
    setPaymentRequiredHandler(() => {});
    expect(() => notifyPaymentRequired({feature: 'exams'})).not.toThrow();
  });

  it('handles undefined feature/reason', () => {
    const handler = jest.fn();
    setPaymentRequiredHandler(handler);
    notifyPaymentRequired({});
    expect(handler).toHaveBeenCalledWith({});
  });
});

describe('sessionEvents: unauthorized (existing 401)', () => {
  afterEach(() => setUnauthorizedHandler(() => {}));

  it('calls handler on 401', () => {
    const handler = jest.fn();
    setUnauthorizedHandler(handler);
    notifyUnauthorized();
    expect(handler).toHaveBeenCalled();
  });
});
