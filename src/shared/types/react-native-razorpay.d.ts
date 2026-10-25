/** Minimal typings for `react-native-razorpay` (its package.json points at plain JS, so TS sees none). */
declare module 'react-native-razorpay' {
  export interface RazorpayCheckoutOptions {
    key: string;
    amount: number | string;
    currency?: string;
    name?: string;
    description?: string;
    image?: string;
    order_id?: string;
    prefill?: {name?: string; email?: string; contact?: string};
    notes?: Record<string, string>;
    theme?: {color?: string};
  }

  export interface RazorpaySuccessResponse {
    razorpay_payment_id: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
  }

  /** Rejection payload. `description` is sometimes a JSON string. Cancel = code 0 (Android) / 2 (iOS). */
  export interface RazorpayErrorResponse {
    code: number;
    description: string;
  }

  const RazorpayCheckout: {
    open(options: RazorpayCheckoutOptions): Promise<RazorpaySuccessResponse>;
  };
  export default RazorpayCheckout;
}
