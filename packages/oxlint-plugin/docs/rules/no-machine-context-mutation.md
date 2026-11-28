# no-machine-context-mutation

Do not change XState context in place.

## Rule details

Context objects and their fields can be shared by more than one snapshot. Updating them in place can change what an earlier snapshot reads. Return a new value from an `assign` callback instead.

Examples of code that this rule reports:

```ts
import { assign } from 'xstate';

const addItem = assign(({ context, event }) => {
  context.items.push(event.item);
  return { items: context.items };
});
```

Examples of code that this rule allows:

```ts
import { assign } from 'xstate';

const addItem = assign(({ context, event }) => ({ items: [...context.items, event.item] }));
```

## What the rule cannot see

The rule follows a `context` property destructured from the parameter of an inline XState callback. A parameter that receives the whole argument object is not treated as machine context, so `fromPromise((context) => ...)` is ignored. It does not follow aliases, moved configuration objects, re-exported helpers, or callbacks passed by reference. It recognizes `.createMachine` and `.provide` by member name in files that import XState.

Callbacks passed to a setup object's `.assign()` or `.extend()`, and callbacks passed to `enqueue()` or `enqueue.assign()`, are not traced back to the machine.
