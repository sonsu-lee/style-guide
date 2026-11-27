import { startTransition, useEffect } from 'react';

declare function saveOrder(id: string): Promise<void>;
declare function loadDraft(id: string): Promise<void>;
declare function showSaved(): void;
declare function showSaveError(error: unknown): void;

export function UnhandledSaveButton({ id }: { id: string }) {
  async function handleSave() {
    await saveOrder(id);
  }

  // effect: Load the draft for this order when the selected order changes.
  useEffect(() => {
    // expect: error typescript(no-floating-promises) -- Loading a draft can fail without notifying the customer.
    loadDraft(id);
  }, [id]);

  return (
    <>
      {/* expect: error typescript(strict-void-return) -- React does not await the save handler. */}
      <button type="button" onClick={handleSave}>
        Save
      </button>
      <button
        type="button"
        onClick={
          // expect: error typescript(strict-void-return) -- An inline async click handler also loses its rejection.
          async () => {
            await saveOrder(id);
          }
        }
      >
        Save and continue
      </button>
    </>
  );
}

export function SaveOrderForm({ id }: { id: string }) {
  return (
    <form
      action={async (formData) => {
        const orderId = formData.get('orderId');
        if (typeof orderId === 'string') {
          await saveOrder(orderId);
        }
      }}
    >
      <input type="hidden" name="orderId" value={id} />
      <button type="submit">Save order</button>
      <button
        type="button"
        onClick={() => {
          saveOrder(id).then(showSaved, showSaveError);
        }}
      >
        Save draft
      </button>
      <button
        type="button"
        onClick={() => {
          startTransition(async () => {
            await saveOrder(id);
          });
        }}
      >
        Save in transition
      </button>
    </form>
  );
}
