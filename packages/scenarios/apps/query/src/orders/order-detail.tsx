import { useQuery } from '@tanstack/react-query';

import { fetchOrder, orderKeys } from './order-queries.ts';

export function SharedOrderDetail({ orderId }: { orderId: string }) {
  // expect: error @tanstack/query(exhaustive-deps) -- A second order can display the first order's details.
  const order = useQuery({
    queryKey: ['order'],
    queryFn: () => fetchOrder(orderId),
  });
  return <p>{order.data}</p>;
}

export function OrderDetail({ orderId }: { orderId: string }) {
  const order = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => fetchOrder(orderId),
  });
  return <p>{order.data}</p>;
}

export function OrderDetailWithKeyFactory({ orderId }: { orderId: string }) {
  const order = useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: () => fetchOrder(orderId),
  });
  return <p>{order.data}</p>;
}
