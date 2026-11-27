'use server';

export async function cancelOrder(data: FormData): Promise<void> {
  const orderId = data.get('orderId');
  if (typeof orderId !== 'string') throw new Error('Missing order ID');

  const response = await fetch(`https://orders.example.com/orders/${encodeURIComponent(orderId)}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Could not cancel the order');
}
