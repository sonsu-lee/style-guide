import { fromPromise, setup } from 'xstate';

async function sendReceipt(): Promise<void> {
  const response = await fetch('/api/receipt', { method: 'POST' });
  if (!response.ok) throw new Error('The receipt could not be sent');
}

export const untrackedReceipt = setup({
  actions: {
    // expect: error typescript(strict-void-return) -- the machine does not await the action's Promise
    notify: async () => {
      await sendReceipt();
    },
  },
}).createMachine({ entry: 'notify' });

export const trackedReceipt = setup({
  actors: { sendReceipt: fromPromise(sendReceipt) },
}).createMachine({
  initial: 'sending',
  states: {
    sending: { invoke: { src: 'sendReceipt', onDone: 'sent', onError: 'failed' } },
    sent: { type: 'final' },
    failed: { type: 'final' },
  },
});
