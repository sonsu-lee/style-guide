export function discountedTotal(cents: number, discount: number): number {
  return Math.max(0, cents - discount);
}
