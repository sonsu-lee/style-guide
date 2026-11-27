import { RuleTester } from 'oxlint/plugins-dev';
import { describe, it } from 'vitest';

import { noUnstableActorSelector } from './no-unstable-actor-selector.ts';

RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({ languageOptions: { parserOptions: { lang: 'ts' } } });

ruleTester.run('no-unstable-actor-selector', noUnstableActorSelector, {
  valid: [
    {
      name: 'selects the total and item count separately',
      code: `
import { useSelector } from '@xstate/react';

const total = useSelector(actorRef, (snapshot) => snapshot.context.total);
const count = useSelector(actorRef, (snapshot) => snapshot.context.items.length);
      `,
    },
    {
      name: 'compares fields when selecting an object',
      code: `
import { useSelector } from '@xstate/react';

const sameTotal = (left, right) => left.total === right.total;
const summary = useSelector(
  actorRef,
  (snapshot) => ({ total: snapshot.context.total }),
  sameTotal,
);
      `,
    },
    {
      name: 'passes a comparator to the actor context hook',
      code: `
import { createActorContext } from '@xstate/react';

const Checkout = createActorContext(checkoutMachine);
const summary = Checkout.useSelector(
  (snapshot) => ({ total: snapshot.context.total }),
  (left, right) => left.total === right.total,
);
      `,
    },
    {
      name: 'ignores a nested helper return and uses the existing snapshot field',
      code: `
import { useSelector } from '@xstate/react';

const summary = useSelector(actorRef, (snapshot) => {
  const compute = () => {
    return { total: snapshot.context.total };
  };
  return snapshot.context.summary;
});
      `,
    },
    {
      name: 'ignores a homonym when a file does not import XState React',
      code: `
import { useSelector } from './fixtures';

const summary = useSelector(actorRef, (snapshot) => ({ total: snapshot.context.total }));
      `,
    },
    {
      name: 'ignores an actor context imported from another file',
      code: `
import { useSelector } from '@xstate/react';
import { Checkout } from './checkout-context';

const summary = Checkout.useSelector((snapshot) => ({ total: snapshot.context.total }));
      `,
    },
  ],
  invalid: [
    {
      name: 'allocates an object in the standalone selector',
      code: `
import { useSelector } from '@xstate/react';

const summary = useSelector(actorRef, (snapshot) => ({ total: snapshot.context.total }));
      `,
      errors: [{ messageId: 'unstableSelector' }],
    },
    {
      name: 'returns an array through TypeScript wrappers in an actor context selector',
      code: `
import { createActorContext as createContext } from '@xstate/react';

const Checkout = createContext(checkoutMachine);
const summary = Checkout.useSelector(function (snapshot) {
  return [snapshot.context.total] as const satisfies readonly number[];
});
      `,
      errors: [{ messageId: 'unstableSelector' }],
    },
    {
      name: 'returns a literal from a branch in an aliased standalone selector',
      code: `
import { useSelector as useActorSlice } from '@xstate/react';

const summary = useActorSlice(actorRef, (snapshot) => {
  if (snapshot.matches('submitting')) return [];
  return snapshot.context.items;
});
      `,
      errors: [{ messageId: 'unstableSelector' }],
    },
  ],
});
