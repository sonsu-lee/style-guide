# no-unstable-actor-selector

Keep XState selector results stable when the selected data has not changed.

## Rule details

The default comparison is reference equality. A new object or array compares unequal on every snapshot, even when its fields are unchanged. Select fields separately or pass a comparator that checks the fields the component uses.

The rule reads object and array literals returned directly, and from the operands that can become the result: both operands of `??` and `||`, the right operand of `&&`, and both branches of `?:`.

Examples of code that this rule reports:

```ts
import { useSelector } from '@xstate/react';

const summary = useSelector(actorRef, (snapshot) => ({ total: snapshot.context.total }));
```

Examples of code that this rule allows:

```ts
import { useSelector } from '@xstate/react';

const total = useSelector(actorRef, (snapshot) => snapshot.context.total);
const count = useSelector(actorRef, (snapshot) => snapshot.context.items.length);
```

## What the rule cannot see

The rule checks inline selectors passed to the imported `useSelector` or an actor context created in the same file. It does not follow selectors passed by reference, allocations hidden behind calls, actor contexts from another file, or re-exported hooks.
