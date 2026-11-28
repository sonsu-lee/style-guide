import { orderTotal } from '@/features/orders';
// expect: error eslint(no-restricted-imports) -- The internal index is still a private entry.
import { discountedTotal as internalTotal } from '@/features/orders/internal';
// expect: error eslint(no-restricted-imports) -- Checkout depends on a private pricing module.
import { discountedTotal } from '@/features/orders/internal/pricing';
// expect: error eslint(no-restricted-imports) -- A nested internal module bypasses the entry point.
import { taxRate } from '@/features/orders/internal/tax/rate';
import { track } from '@/logging/track';
// expect: error eslint(no-restricted-imports) -- Direct SDK access bypasses masking.
import { record } from '@/vendor/analytics-sdk';
export function legacySummary(cents: number, customer: string): number {
  record('checkout', customer);
  return discountedTotal(cents, 0) + internalTotal(cents, 0) + cents * taxRate;
}
export function summary(cents: number): number {
  track('checkout');
  return orderTotal(cents, 0);
}
