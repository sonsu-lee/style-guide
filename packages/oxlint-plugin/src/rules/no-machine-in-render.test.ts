import { RuleTester } from 'oxlint/plugins-dev';
import { describe, it } from 'vitest';

import { noMachineInRender } from './no-machine-in-render.ts';

RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({ languageOptions: { parserOptions: { lang: 'ts' } } });

ruleTester.run('no-machine-in-render', noMachineInRender, {
  valid: [
    {
      name: 'passes changing values as input to a module-level machine',
      code: `
import { setup } from 'xstate';

const checkoutMachine = setup({}).createMachine({});

function CheckoutPanel({ input }) {
  const [snapshot] = useMachine(checkoutMachine, { input });
  return snapshot.value;
}
      `,
    },
    {
      name: 'creates an actor in a lazy state initializer',
      code: `
import { createActor } from 'xstate';

function CheckoutPanel() {
  const [actor] = useState(() => createActor(checkoutMachine));
  return actor.getSnapshot().value;
}
      `,
    },
    {
      name: 'ignores a homonym when a file does not import XState',
      code: `
import { createActor } from './fixtures';

function CheckoutPanel() {
  return createActor(checkoutMachine);
}
      `,
    },
    {
      name: 'ignores a parameter that shadows an XState import',
      code: `
import { createActor } from 'xstate';

function CheckoutPanel({ createActor }) {
  return createActor(checkoutMachine);
}
      `,
    },
    {
      name: 'allows unrelated factories and XState helpers that do not create machines or actors',
      code: `
import { createActor, assign as updateCart } from 'xstate';

function CheckoutPanel({ workflow }) {
  return workflow.createActor(updateCart({}), createOrder());
}
      `,
    },
  ],
  invalid: [
    {
      name: 'creates a machine as an argument to useMachine',
      code: `
import { createMachine } from 'xstate';

function CheckoutPanel() {
  const [snapshot] = useMachine(createMachine({ initial: 'idle', states: { idle: {} } }));
  return snapshot.value;
}
      `,
      errors: [{ messageId: 'machineInRender' }],
    },
    {
      name: 'creates an actor before the component returns',
      code: `
import { createActor } from 'xstate';

function CheckoutPanel() {
  const actor = createActor(checkoutMachine);
  return actor.getSnapshot().value;
}
      `,
      errors: [{ messageId: 'machineInRender' }],
    },
    {
      name: 'resolves an aliased namespace factory in a hook',
      code: `
import * as XState from 'xstate';

const useCheckout = () => XState.setup({});
      `,
      errors: [{ messageId: 'machineInRender' }],
    },
    {
      name: 'resolves a named import alias in an assigned function',
      code: `
import { createActor as makeActor } from 'xstate';

const CheckoutPanel = function () {
  return makeActor(checkoutMachine).getSnapshot().value;
};
      `,
      errors: [{ messageId: 'machineInRender' }],
    },
    {
      name: 'resolves a factory member of the default import',
      code: `
import XState from 'xstate';

const useCheckout = () => XState.createMachine({});
      `,
      errors: [{ messageId: 'machineInRender' }],
    },
  ],
});
