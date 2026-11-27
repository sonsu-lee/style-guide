export function quotedFee(member: boolean, subtotal: number): number {
  // expect: error eslint(no-ternary) -- Membership and the order minimum select different fees.
  // expect: error eslint(no-ternary) -- The minimum is buried in the nonmember branch.
  return member ? 0 : subtotal >= 50 ? 0 : 5;
}
export function shippingFee(member: boolean, subtotal: number): number {
  if (member || subtotal >= 50) return 0;
  return 5;
}
