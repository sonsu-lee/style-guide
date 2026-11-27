export function describePayment(status: 'paid' | 'pending' | 'refunded'): string {
  // expect: error typescript(switch-exhaustiveness-check) -- A refunded payment appears unknown.
  switch (status) {
    case 'paid':
      return 'Payment received';
    case 'pending':
      return 'Awaiting payment';
    default:
      return 'Unknown payment';
  }
}
