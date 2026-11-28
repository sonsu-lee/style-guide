interface Flags {
  betaCheckout?: boolean;
}
export function checkoutEnabled(flags: Flags, defaults: { betaCheckout: boolean }): boolean {
  // expect: error typescript(strict-boolean-expressions) -- Missing and disabled take the same path.
  if (flags.betaCheckout) return true;
  return defaults.betaCheckout;
}
export function hasExplicitOptIn(flags: Flags): boolean {
  return flags.betaCheckout === true;
}
export function useCheckoutDefault(flags: Flags, defaults: { betaCheckout: boolean }): boolean {
  return flags.betaCheckout ?? defaults.betaCheckout;
}
export function couponCount(coupon: string, quantityText: string, isReady: boolean): number {
  // expect: error eslint(no-implicit-coercion) -- Conversion is hidden in a double negation.
  const hasCoupon = !!coupon;
  if (isReady) return +quantityText;
  return Number(hasCoupon);
}
export function canRedeem(coupon: string, isReady: boolean): boolean {
  return isReady && Boolean(coupon);
}
