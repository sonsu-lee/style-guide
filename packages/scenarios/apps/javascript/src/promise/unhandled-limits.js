export function refreshShipmentTracking(shipmentId) {
  // A JavaScript-only preset has no type information to report this ignored promise.
  fetch(`/shipments/${shipmentId}/tracking`);
}
