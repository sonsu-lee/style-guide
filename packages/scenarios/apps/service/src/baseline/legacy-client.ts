/** @deprecated Use the versioned orders endpoint. */
declare function readLegacyOrder(id: string): string;
export function orderSummary(id: string): string {
  // expect: error typescript(no-deprecated) -- Reads the retired endpoint.
  return readLegacyOrder(id);
}
