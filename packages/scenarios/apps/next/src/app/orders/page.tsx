import Image from 'next/image';

async function fetchOrders(): Promise<{ id: string; receiptUrl: string }[]> {
  const response = await fetch('https://orders.example.com/active');
  if (!response.ok) throw new Error('Could not load active orders');
  const orderIds = await response.text();
  return orderIds
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((id) => ({
      id,
      receiptUrl: `/receipts/${encodeURIComponent(id)}.png`,
    }));
}

export default async function OrdersPage() {
  const orders = await fetchOrders();
  return (
    <main>
      {/* expect: warning next(no-img-element) -- The unoptimized banner costs bandwidth on the order list. */}
      <img src="/orders-banner.png" alt="Track your orders" />
      <ul>
        {orders.map((order) => (
          <li key={order.id}>
            <Image src={order.receiptUrl} alt="Order receipt" width={240} height={160} />
          </li>
        ))}
      </ul>
    </main>
  );
}
