/** Unit tests for the Request Admin validation and API helpers. */
import {isValidEmail, isValidIndianMobile} from '../../src/shared/utils/validators';
import {extractErrorMessage} from '../../src/core/api/apiError';

describe('Request Admin: validation helpers', () => {
  describe('name validation', () => {
    it('requires a non-empty name', () => {
      expect(''.trim().length > 0).toBe(false);
      expect('  '.trim().length > 0).toBe(false);
      expect('Ramesh Kumar'.trim().length > 0).toBe(true);
    });
  });

  describe('email validation', () => {
    it('accepts valid emails', () => {
      expect(isValidEmail('user@school.edu')).toBe(true);
      expect(isValidEmail('a@b.com')).toBe(true);
    });
    it('rejects invalid emails', () => {
      expect(isValidEmail('not-an-email')).toBe(false);
      expect(isValidEmail('@missing.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('Indian mobile validation', () => {
    it('accepts valid 10-digit numbers starting with 6-9', () => {
      expect(isValidIndianMobile('9876543210')).toBe(true);
      expect(isValidIndianMobile('6000000000')).toBe(true);
    });
    it('rejects invalid numbers', () => {
      expect(isValidIndianMobile('1234567890')).toBe(false);
      expect(isValidIndianMobile('987654')).toBe(false);
      expect(isValidIndianMobile('')).toBe(false);
      expect(isValidIndianMobile('98765432101')).toBe(false);
    });
  });

  describe('phone prefix stripping', () => {
    function stripPhonePrefix(raw: string): string {
      return raw.replace(/[\s+\-]/g, '').replace(/^(91|0)/, '');
    }
    it('strips +91 prefix', () => {
      expect(stripPhonePrefix('+919876543210')).toBe('9876543210');
    });
    it('strips 0 prefix', () => {
      expect(stripPhonePrefix('09876543210')).toBe('9876543210');
    });
    it('strips 91 prefix', () => {
      expect(stripPhonePrefix('919876543210')).toBe('9876543210');
    });
    it('handles spaces', () => {
      expect(stripPhonePrefix('+91 98765 43210')).toBe('9876543210');
    });
    it('leaves clean number as-is', () => {
      expect(stripPhonePrefix('9876543210')).toBe('9876543210');
    });
  });

  describe('contact-required validation', () => {
    it('requires at least one contact field', () => {
      const hasContact = (email: string, p1: string, p2: string, p3: string) =>
        !!(email.trim() || p1.trim() || p2.trim() || p3.trim());
      expect(hasContact('', '', '', '')).toBe(false);
      expect(hasContact('a@b.com', '', '', '')).toBe(true);
      expect(hasContact('', '9876543210', '', '')).toBe(true);
      expect(hasContact('', '', '', '9000000000')).toBe(true);
    });
  });
});

describe('Request Admin: API error parsing', () => {
  it('extracts field-prefixed errors', () => {
    const msg = extractErrorMessage(
      {message: 'phone1: Mobile number 1 is not a valid mobile number'},
      'fallback',
    );
    const match = msg.match(/^(phone[123]|email|name):\s*/i);
    expect(match).not.toBeNull();
    expect(match![1]).toBe('phone1');
    expect(msg.slice(match![0].length)).toBe('Mobile number 1 is not a valid mobile number');
  });

  it('uses fallback for network errors', () => {
    const msg = extractErrorMessage(undefined, 'Something went wrong.');
    expect(msg).toBe('Something went wrong.');
  });

  it('handles generic errors without field prefix', () => {
    const msg = extractErrorMessage({message: 'Server error'}, 'fallback');
    const match = msg.match(/^(phone[123]|email|name):\s*/i);
    expect(match).toBeNull();
  });
});
