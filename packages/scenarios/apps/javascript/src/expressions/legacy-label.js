export function legacyLabel(paid) {
  // expect: error eslint(no-ternary) -- The receipt label branches inside the expression.
  return paid ? 'Paid' : 'Pending';
}
export function hasReceipt(value) {
  // expect: error eslint(no-implicit-coercion) -- A double negation hides the conversion.
  return !!value;
}
// No type information: a missing flag is indistinguishable from a disabled flag here.
export function legacyCheckout(enabled) {
  if (enabled) return 'Beta';
  return 'Classic';
}
