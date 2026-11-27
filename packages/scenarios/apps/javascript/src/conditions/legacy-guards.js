export function queueRefunds(payments) {
  return payments.filter(({ amount, isDisputed, isSettled }) => {
    // expect: warning sonsu-lee(prefer-named-conditions) -- The amount check is buried inside the exception for disputed payments.
    return isDisputed || (isSettled && amount > 0);
  });
}

export function queueNamedRefunds(payments) {
  return payments.filter(({ amount, isDisputed, isSettled }) => {
    const hasSettledAmount = isSettled && amount > 0;
    return isDisputed || hasSettledAmount;
  });
}

export function refundLabel(payment) {
  const label = payment.reason ?? payment.memo;
  return label || 'Refund requested';
}
