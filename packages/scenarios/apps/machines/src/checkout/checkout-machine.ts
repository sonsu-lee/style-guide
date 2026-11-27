import { assign, fromCallback, fromPromise, setup } from 'xstate';

interface CartItem {
  sku: string;
  price: number;
}

export interface CheckoutInput {
  orderId: string;
  items: CartItem[];
}

interface CheckoutContext extends CheckoutInput {
  retries: number;
  total: number;
}

interface AddItem {
  type: 'item.add';
  item: CartItem;
}

const checkoutTypes: { context: CheckoutContext; input: CheckoutInput; events: AddItem } = {
  context: { orderId: '', items: [], retries: 0, total: 0 },
  input: { orderId: '', items: [] },
  events: { type: 'item.add', item: { sku: '', price: 0 } },
};

const reserveStock = fromPromise<void, number>(({ input }) => {
  if (input === 0) return Promise.reject(new Error('The cart is empty'));
  return Promise.resolve();
});

const submitOrder = fromPromise(async ({ input }: { input: string }) => {
  const response = await fetch('/api/checkout', { method: 'POST', body: input });
  if (!response.ok) throw new Error('The order could not be submitted');
});

const watchOrderStatus = fromCallback(() => {
  const feed = new EventSource('/api/order-status');
  return () => feed.close();
});

export const checkoutMachine = setup({
  types: checkoutTypes,
  actors: { reserveStock, submitOrder, watchOrderStatus },
  actions: {
    legacyAddItem: assign(({ context, event }) => {
      // expect: error sonsu-lee(no-machine-context-mutation) -- changes the previous snapshot's items
      context.items.push(event.item);
      return { items: context.items, total: context.total + event.item.price };
    }),
    addItem: assign(({ context, event }) => ({
      items: [...context.items, event.item],
      total: context.total + event.item.price,
    })),
    countRetry: ({ context }) => {
      // expect: error sonsu-lee(no-machine-context-mutation) -- changes the retry count without a new snapshot context
      context.retries += 1;
    },
  },
  guards: { canRetry: ({ context }) => context.retries < 3 },
}).createMachine({
  id: 'checkout',
  context: ({ input }) => ({
    ...input,
    retries: 0,
    total: input.items.reduce((total, item) => total + item.price, 0),
  }),
  initial: 'reserving',
  states: {
    reserving: {
      // expect: warning sonsu-lee(require-invoke-on-error) -- no transition can recover when the stock request rejects
      invoke: {
        src: 'reserveStock',
        input: ({ context }) => context.items.length,
        onDone: 'submitting',
      },
      on: { 'item.add': { actions: 'legacyAddItem' } },
    },
    submitting: {
      invoke: {
        src: 'submitOrder',
        input: ({ context }) => context.orderId,
        onDone: 'tracking',
        onError: 'failed',
      },
    },
    tracking: {
      invoke: { src: 'watchOrderStatus', onError: 'failed' },
    },
    failed: {
      on: {
        'item.add': { guard: 'canRetry', actions: ['countRetry', 'addItem'], target: 'reserving' },
      },
    },
  },
});
