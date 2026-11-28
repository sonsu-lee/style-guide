# no-machine-in-render

Do not create machines or actors in a React component or hook body.

## Rule details

A render can run more than once. Creating a machine or actor on every render gives each run a new identity. Define the machine once at module scope and pass changing data as input. A lazy state initializer is outside the direct component body.

Examples of code that this rule reports:

```ts
import { createMachine } from 'xstate';

function CheckoutPanel() {
  const [snapshot] = useMachine(createMachine({ initial: 'idle', states: { idle: {} } }));
  return snapshot.value;
}
```

Examples of code that this rule allows:

```ts
import { setup } from 'xstate';

const checkoutMachine = setup({}).createMachine({});

function CheckoutPanel({ input }) {
  const [snapshot] = useMachine(checkoutMachine, { input });
  return snapshot.value;
}
```

## What the rule cannot see

The rule uses function names to recognize components and hooks. It resolves a same-file `const` holding `setup()` or an extended setup, so `machineSetup.createMachine(...)` in render is reported. It does not follow functions passed by reference, re-exported XState imports, a `createMachine` destructured from a setup result, a setup result imported from another file, or calls hidden in helpers.
