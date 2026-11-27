# prefer-machine-setup

Use `setup(...).createMachine(...)` to define XState v5 machines.

## Rule details

`setup` groups actor, action, and guard implementations with the types their machine uses. The rule reports a direct call to XState’s imported `createMachine`, including a named alias and a namespace member.

Examples of code that this rule reports:

```ts
import { createMachine } from 'xstate';

const checkoutMachine = createMachine({ initial: 'idle', states: { idle: {} } });
```

Examples of code that this rule allows:

```ts
import { createActor, setup } from 'xstate';

const checkoutMachine = setup({}).createMachine({ initial: 'idle', states: { idle: {} } });
const checkoutActor = createActor(checkoutMachine);
```

## What the rule cannot see

The rule does not follow re-exports, destructured namespace members, or local variables that copy the imported factory.
