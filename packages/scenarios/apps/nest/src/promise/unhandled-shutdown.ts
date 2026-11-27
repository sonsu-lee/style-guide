export function shutdownOrderService(app: { close(): Promise<void> }): void {
  // expect: error typescript(no-floating-promises) -- The caller cannot tell that closing the service failed.
  void app.close();
}
