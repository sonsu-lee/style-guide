import { RuleTester } from 'oxlint/plugins-dev';
import { describe, it } from 'vitest';

import { requireInvokeOnError } from './require-invoke-on-error.ts';

RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({ languageOptions: { parserOptions: { lang: 'ts' } } });

ruleTester.run('require-invoke-on-error', requireInvokeOnError, {
  valid: [
    {
      name: 'can leave the submitting state when submission fails',
      code: `
import { setup } from 'xstate';

setup({}).createMachine({
  invoke: { src: 'submitOrder', onDone: 'submitted', onError: 'failed' },
});
      `,
    },
    {
      name: 'only handles failure for a callback actor that does not finish on its own',
      code: `
import { fromCallback, setup } from 'xstate';

const subscribeToOrders = fromCallback(() => orders.subscribe());
setup({ actors: { subscribeToOrders } }).createMachine({
  invoke: { src: 'subscribeToOrders', onError: 'failed' },
});
      `,
    },
    {
      name: 'does not report metadata objects returned by an action',
      code: `
import { setup } from 'xstate';

setup({}).createMachine({
  entry: () => ({ invoke: { src: 'reserveStock', onDone: 'reserved' } }),
});
      `,
    },
    {
      name: 'ignores the same configuration shape when a file does not import XState',
      code: `
import { setup } from './fixtures';

setup({}).createMachine({
  invoke: { src: 'reserveStock', onDone: 'reserved' },
});
      `,
    },
  ],
  invalid: [
    {
      name: 'has a success transition but no failure transition',
      code: `
import { setup } from 'xstate';

setup({}).createMachine({
  invoke: { src: 'reserveStock', onDone: 'reserved' },
});
      `,
      errors: [{ messageId: 'missingOnError' }],
    },
    {
      name: 'checks each entry of an invoke array and matches quoted keys',
      code: `
import { createMachine as buildMachine } from 'xstate';

buildMachine({
  invoke: [
    { src: 'subscribeToOrders', onError: 'failed' },
    { 'src': 'reserveStock', 'onDone': 'reserved' },
  ],
});
      `,
      errors: [{ messageId: 'missingOnError' }],
    },
  ],
});
