import { useMutation } from '@tanstack/react-query';

async function cancelOrder(orderId: string): Promise<void> {
  const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}/cancellation`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error(`Cancellation failed: ${response.status}`);
  }
}

export function UnhandledCancelButton({ orderId }: { orderId: string }) {
  const mutation = useMutation({ mutationFn: cancelOrder });
  return (
    <button
      type="button"
      onClick={() => {
        // expect: error typescript(no-floating-promises) -- A failed cancellation can reject without a handler.
        mutation.mutateAsync(orderId);
      }}
    >
      Cancel order
    </button>
  );
}

export function CancelButton({ orderId }: { orderId: string }) {
  const mutation = useMutation({ mutationFn: cancelOrder });
  return (
    <>
      <button
        type="button"
        disabled={mutation.isPending}
        onClick={() => {
          mutation.mutate(orderId);
        }}
      >
        Cancel order
      </button>
      {mutation.isError && <p role="alert">{mutation.error.message}</p>}
    </>
  );
}
