export function stockLabel(
  quantity: number,
  sku: string,
  warehouse: { name: string } | null,
): string {
  // expect: error typescript(strict-boolean-expressions) -- Zero stock falls through to a warehouse label.
  if (quantity) return String(quantity);
  if (sku) return sku;
  if (warehouse) return warehouse.name;
  return 'Unavailable';
}
