import { RuleTester } from 'oxlint/plugins-dev';
import { describe, it } from 'vitest';

import { noMachineContextMutation } from './no-machine-context-mutation.ts';

RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({ languageOptions: { parserOptions: { lang: 'ts' } } });

ruleTester.run('no-machine-context-mutation', noMachineContextMutation, {
  valid: [
    {
      name: 'copies items without mutating the previous snapshot',
      code: `
import { assign } from 'xstate';

const addItem = assign(({ context, event }) => ({ items: [...context.items, event.item] }));
      `,
    },
    {
      name: 'allows inline guards that only read context',
      code: `
import { setup } from 'xstate';

setup({ guards: { canRetry: ({ context }) => context.retries < 3 } });
      `,
    },
    {
      name: 'ignores a local object that shadows the parameter',
      code: `
import { assign } from 'xstate';

assign(({ context }) => {
  if (context.expired) {
    const context = { retries: 0 };
    context.retries++;
    return context;
  }
  return { retries: 0 };
});
      `,
    },
    {
      name: 'does not treat an unrelated context parameter as an XState callback',
      code: `
import { assign } from 'xstate';

const updateCart = ({ context }) => {
  context.retries++;
};
      `,
    },
    {
      name: 'ignores a homonym when a file does not import XState',
      code: `
import { assign } from './fixtures';

assign(({ context }) => {
  context.items.push('sample');
  return context;
});
      `,
    },
    {
      name: 'ignores a helper parameter that shadows the context in an action',
      code: `
import { setup } from 'xstate';

setup({
  actions: {
    updateCart: ({ context }) => {
      function normalize({ context }) {
        context.items.sort();
        return context.items;
      }
      saveCart(normalize({ context: { items: [...context.items] } }));
    },
  },
});
      `,
    },
    {
      name: 'ignores context parameters owned by a non-XState factory callback',
      code: `
import { setup } from 'xstate';

setup({
  actions: {
    updateCart: makeAction(({ context }) => {
      context.items.sort();
      return context.items;
    }),
  },
});
      `,
    },
  ],
  invalid: [
    {
      name: 'pushes into the items read from a destructured context parameter',
      code: `
import { assign } from 'xstate';

const addItem = assign(({ context, event }) => {
  context.items.push(event.item);
  return { items: context.items };
});
      `,
      errors: [{ messageId: 'contextMutation' }],
    },
    {
      name: 'modifies context from an action declared in setup',
      code: `
import { setup } from 'xstate';

const checkout = setup({
  actions: {
    countRetry: ({ context }) => {
      context.retries += 1;
    },
  },
});
      `,
      errors: [{ messageId: 'contextMutation' }],
    },
    {
      name: 'detects an update in an inline guard of a provided machine',
      code: `
import { setup } from 'xstate';

checkoutMachine.provide({
  guards: { canRetry: ({ context }) => ++context.retries < 3 },
});
      `,
      errors: [{ messageId: 'contextMutation' }],
    },
    {
      name: 'detects deletion from context inside a directly imported assign',
      code: `
import { assign } from 'xstate';

assign((context) => {
  delete context.coupon;
  return context;
});
      `,
      errors: [{ messageId: 'contextMutation' }],
    },
    {
      name: 'detects collection mutation through a nested context member',
      code: `
import { assign } from 'xstate';

assign(({ context }) => {
  context.reservations.pending.set('order-42', true);
  return context;
});
      `,
      errors: [{ messageId: 'contextMutation' }],
    },
    {
      name: 'detects mutation of the outer action context captured by a helper',
      code: `
import { setup } from 'xstate';

setup({
  actions: {
    updateCart: ({ context }) => {
      function normalize() {
        context.items.sort();
      }
      normalize();
    },
  },
});
      `,
      errors: [{ messageId: 'contextMutation' }],
    },
  ],
});
