import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';

type OrderStatus = 'pending' | 'shipped';

export const orderKeys = {
  detail: (id: string) => ['order', id] as const,
};

async function fetchSummary(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Order request failed: ${response.status}`);
  }
  return response.text();
}

export function fetchOrder(id: string): Promise<string> {
  return fetchSummary(`/api/orders/${encodeURIComponent(id)}`);
}

function fetchOrders(status: OrderStatus): Promise<string> {
  return fetchSummary(`/api/orders?status=${status}`);
}

export function filteredOrderOptions(status: OrderStatus) {
  // expect: error @tanstack/query(exhaustive-deps) -- Pending and shipped orders overwrite the same cache entry.
  return queryOptions({
    queryKey: ['orders'],
    queryFn: () => fetchOrders(status),
  });
}

export function useFilteredOrders(status: OrderStatus) {
  // expect: error @tanstack/query(exhaustive-deps) -- Changing the filter can keep showing the previous results.
  return useSuspenseQuery({
    queryKey: ['orders'],
    queryFn: () => fetchOrders(status),
  });
}

export function orderDetailOptions(id: string) {
  return queryOptions({
    queryKey: orderKeys.detail(id),
    queryFn: () => fetchOrder(id),
  });
}
