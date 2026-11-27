# require-invoke-on-error

Give an invoked actor a failure transition when its invoke handles success.

## Rule details

An actor failure without an `onError` transition propagates out of the invocation. A checkout can then stop in its loading state instead of moving to a state that can show the failure or retry. The rule reports an inline invoke entry with `src` and `onDone` but no `onError`.

Examples of code that this rule reports:

```ts
import { setup } from 'xstate';

setup({}).createMachine({
  invoke: { src: 'reserveStock', onDone: 'reserved' },
});
```

Examples of code that this rule allows:

```ts
import { setup } from 'xstate';

setup({}).createMachine({
  invoke: { src: 'submitOrder', onDone: 'submitted', onError: 'failed' },
});
```

## What the rule cannot see

The rule does not resolve configuration objects passed by variable, spreads, computed properties, or re-exported named factories. It recognizes `.createMachine` by member name in files that import XState.
