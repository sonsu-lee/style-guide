'use client';

import { useEffect } from 'react';

import { cancelOrder } from './cancel-order';

// expect: warning next(no-async-client-component) -- A Client Component cannot render asynchronously.
export default async function CancelOrderPanel() {
  const response = await fetch('/api/orders/cancellation-status');
  const status = await response.text();
  return <p>{status}</p>;
}

export function CancelOrderForm({ orderId }: { orderId: string }) {
  // expect: error sonsu-lee(require-effect-reason) -- The Effect does not identify its external system.
  useEffect(() => {
    document.title = `Cancel order ${orderId}`;
  }, [orderId]);

  return (
    <form action={cancelOrder}>
      <input type="hidden" name="orderId" value={orderId} />
      <button type="submit">Cancel order</button>
    </form>
  );
}
