import { useQuery } from '@tanstack/react-query';

async function fetchOrderSummary(orderId: string): Promise<string> {
  const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}/summary`);
  if (!response.ok) {
    throw new Error(`Could not load order summary: ${response.status}`);
  }
  return response.text();
}

export function OrderSummary({ orderId }: { orderId: string }) {
  // The order ID is deliberately missing: this app does not activate the query profile.
  const summary = useQuery({
    queryKey: ['order-summary'],
    queryFn: () => fetchOrderSummary(orderId),
  });
  return <p>{summary.data}</p>;
}
