interface PurchaseRequest {
  age: number;
  balance: number;
  price: number;
  stock: number;
}

export function purchaseNotice({ age, balance, price, stock }: PurchaseRequest): string {
  // expect: warning sonsu-lee(prefer-named-conditions) -- The purchase policy is hidden in three inline comparisons.
  if (age >= 19 && balance >= price && stock > 0) {
    return 'You can place the order.';
  }
  return 'This order is not available.';
}

export function canBuy({ age, balance, price, stock }: PurchaseRequest): boolean {
  return age >= 19 && balance >= price && stock > 0;
}

export function purchaseReviewStatus(
  isAdmin: boolean,
  ownerId: string,
  reviewerId: string,
  lockedAt: Date | null,
): 'available' | 'restricted' {
  // expect: warning sonsu-lee(prefer-named-conditions) -- The owner-and-unlocked exception has no name at the review boundary.
  if (isAdmin || (ownerId === reviewerId && !lockedAt)) return 'available';
  return 'restricted';
}

export function pickupAvailability({ age, balance, price, stock }: PurchaseRequest) {
  const canOfferPickup = age >= 19 && balance >= price && stock > 0;
  return { canOfferPickup, price };
}

export function pickupNotice(isAdult: boolean, canAfford: boolean, isInStock: boolean): string {
  if (isAdult && canAfford && isInStock) return 'Reserve pickup';
  return 'Pickup unavailable';
}

type OrderStatus = 'pending' | 'paid' | 'refunded' | 'cancelled';
interface Order {
  id: string;
  status: OrderStatus;
}

export function settledOrders(orders: readonly Order[]): Order[] {
  return orders.filter(({ status }) => {
    // expect: warning sonsu-lee(prefer-named-conditions) -- The callback spells out three statuses without naming the settled-order check.
    return status === 'paid' || status === 'refunded' || status === 'cancelled';
  });
}
