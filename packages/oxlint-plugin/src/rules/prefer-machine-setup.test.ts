import { RuleTester } from 'oxlint/plugins-dev';
import { describe, it } from 'vitest';

import { preferMachineSetup } from './prefer-machine-setup.ts';

RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({ languageOptions: { parserOptions: { lang: 'ts' } } });

ruleTester.run('prefer-machine-setup', preferMachineSetup, {
  valid: [
    {
      name: 'creates a machine from its setup and instantiates an actor at module scope',
      code: `
import { createActor, setup } from 'xstate';

const checkoutMachine = setup({}).createMachine({ initial: 'idle', states: { idle: {} } });
const checkoutActor = createActor(checkoutMachine);
      `,
    },
    {
      name: 'ignores a homonym when a file does not import XState',
      code: `
import { createMachine } from './fixtures';

const checkoutMachine = createMachine({});
      `,
    },
    {
      name: 'ignores a local factory in a file with an XState import',
      code: `
import { setup } from 'xstate';

const createMachine = (config) => config;
const checkoutMachine = createMachine({});
      `,
    },
  ],
  invalid: [
    {
      name: 'calls the bare machine factory',
      code: `
import { createMachine } from 'xstate';

const checkoutMachine = createMachine({ initial: 'idle', states: { idle: {} } });
      `,
      errors: [{ messageId: 'bareCreateMachine' }],
    },
    {
      name: 'resolves a named import alias',
      code: `
import { createMachine as buildMachine } from 'xstate';

const checkoutMachine = buildMachine({});
      `,
      errors: [{ messageId: 'bareCreateMachine' }],
    },
    {
      name: 'resolves a namespace member',
      code: `
import * as XState from 'xstate';

const checkoutMachine = XState.createMachine({});
      `,
      errors: [{ messageId: 'bareCreateMachine' }],
    },
  ],
});
