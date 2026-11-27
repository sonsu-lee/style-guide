import { orderTotal } from '@/features/orders';
// expect: error eslint(no-restricted-imports) -- Checkout depends on a private pricing module.
import { discountedTotal } from '@/features/orders/internal/pricing';
import { track } from '@/logging/track';
// expect: error eslint(no-restricted-imports) -- Direct SDK access bypasses masking.
import { record } from '@/vendor/analytics-sdk';
export function legacySummary(cents: number, customer: string): number {
  record('checkout', customer);
  return discountedTotal(cents, 0);
}
export function summary(cents: number): number {
  track('checkout');
  return orderTotal(cents, 0);
}
