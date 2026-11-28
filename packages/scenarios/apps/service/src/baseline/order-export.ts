declare function uploadReport(orderId: string): Promise<void>;
export function exportOrders(orders: string[], latest: string): void {
  // expect: error typescript(no-floating-promises) -- The export finishes before the report arrives.
  uploadReport(latest);
  // expect: error typescript(no-misused-promises) -- forEach ignores the pending uploads.
  // expect: error typescript(strict-void-return) -- The callback cannot return its upload to the caller.
  orders.forEach(async (id) => {
    await uploadReport(id);
  });
}
