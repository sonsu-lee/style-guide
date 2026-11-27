interface CheckoutPanelProps {
  isValid: boolean;
  isSubmitting: boolean;
  retryCount: number;
  itemCount: number;
  onPay: () => void;
}

export function CheckoutPanel({
  isValid,
  isSubmitting,
  retryCount,
  itemCount,
  onPay,
}: CheckoutPanelProps) {
  return (
    <section>
      {isValid && itemCount > 0 && <p>{itemCount} items ready for checkout</p>}
      <button
        type="button"
        disabled={
          // expect: warning sonsu-lee(prefer-named-conditions) -- The retry cutoff is buried in the button's disabled condition.
          !isValid || (isSubmitting && retryCount >= 3)
        }
        onClick={onPay}
      >
        Pay now
      </button>
    </section>
  );
}

export function CheckoutAction({ isValid, isSubmitting, retryCount, onPay }: CheckoutPanelProps) {
  const isRetryLimitReached = isSubmitting && retryCount >= 3;
  return (
    <button type="button" disabled={!isValid || isRetryLimitReached} onClick={onPay}>
      Pay now
    </button>
  );
}
