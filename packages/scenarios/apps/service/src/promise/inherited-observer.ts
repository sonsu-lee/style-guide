interface OrderObserver {
  update(id: string): void;
}
export interface RemoteObserver extends OrderObserver {
  // expect: error typescript(no-misused-promises) -- Callers of the inherited signature discard the upload.
  update(id: string): Promise<void>;
}
