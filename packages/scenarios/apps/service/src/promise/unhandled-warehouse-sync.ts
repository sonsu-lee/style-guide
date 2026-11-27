interface Order {
  id: string;
  warehouseId: string;
}

interface SyncEvent {
  orderId: string;
  warehouseId: string;
}

declare function pushToWarehouse(order: Order): Promise<string>;
declare function markSynced(orderId: string): void;
declare function reportSyncFailure(error: unknown): void;
declare const audit: { record(event: SyncEvent): Promise<void> };

export function startWarehouseSync(orders: Order[], event: SyncEvent): void {
  for (const order of orders) {
    // expect: error typescript(no-floating-promises) -- The sync returns before the warehouse accepts the orders.
    pushToWarehouse(order);
  }
  // expect: error typescript(no-floating-promises) -- A failed audit write is discarded instead of recorded or reported.
  void audit.record(event);
}

export function repeatWarehouseSync(orders: Order[]): void {
  // expect: error typescript(strict-void-return) -- forEach cannot wait for the uploads or handle their failures.
  orders.forEach(async (order) => {
    await pushToWarehouse(order);
  });
}

export async function syncWarehouseBatch(orders: Order[]): Promise<string[]> {
  const synced = await Promise.all(orders.map((order) => pushToWarehouse(order)));
  return synced;
}

export function retryOrder(order: Order): Promise<string> {
  return pushToWarehouse(order);
}

export function syncInBackground(order: Order): void {
  pushToWarehouse(order).then(markSynced, reportSyncFailure);
}

export async function auditWarehouseBatch(orders: Order[]): Promise<number> {
  const outcomes = await Promise.allSettled(orders.map((order) => pushToWarehouse(order)));
  let failedCount = 0;
  for (const outcome of outcomes) {
    if (outcome.status === 'rejected') {
      failedCount += 1;
    }
  }
  return failedCount;
}
