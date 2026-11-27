import { useMachine, useSelector } from '@xstate/react';
import { useState } from 'react';
import { createActor, createMachine } from 'xstate';

import { checkoutMachine, type CheckoutInput } from './checkout-machine';

export function InlineMachinePanel() {
  const [snapshot] = useMachine(
    // expect: error sonsu-lee(no-machine-in-render) -- every render creates a different machine
    // expect: warning sonsu-lee(prefer-machine-setup) -- the factory has no setup for actor and action types
    createMachine({ initial: 'waiting', states: { waiting: {} } }),
  );
  return <p data-waiting={snapshot.matches('waiting')}>Checkout</p>;
}

export function InlineActorPanel({ input }: { input: CheckoutInput }) {
  // expect: error sonsu-lee(no-machine-in-render) -- renders create additional actors for the order
  const actor = createActor(checkoutMachine, { input });
  return <p>Checkout: {actor.getSnapshot().value}</p>;
}

export function UnstableTotalPanel({ input }: { input: CheckoutInput }) {
  const [, , actorRef] = useMachine(checkoutMachine, { input });
  const summary = useSelector(actorRef, (snapshot) =>
    // expect: warning sonsu-lee(no-unstable-actor-selector) -- reference equality fails on every snapshot
    ({ total: snapshot.context.total, count: snapshot.context.items.length }),
  );
  return (
    <p>
      {summary.count} items: {summary.total}
    </p>
  );
}

export function CheckoutPanel({ input }: { input: CheckoutInput }) {
  const [snapshot, , actorRef] = useMachine(checkoutMachine, { input });
  const total = useSelector(actorRef, (state) => state.context.total);
  const count = useSelector(actorRef, (state) => state.context.items.length);
  return (
    <p data-submitting={snapshot.matches('submitting')}>
      {count} items: {total}
    </p>
  );
}

type OrderSummary = { total: number; count: number };

function sameSummary(previous: OrderSummary, next: OrderSummary): boolean {
  return previous.total === next.total && previous.count === next.count;
}

export function ComparedTotalPanel({ input }: { input: CheckoutInput }) {
  const [, , actorRef] = useMachine(checkoutMachine, { input });
  const summary = useSelector(
    actorRef,
    (snapshot) => ({ total: snapshot.context.total, count: snapshot.context.items.length }),
    sameSummary,
  );
  return (
    <p>
      {summary.count} items: {summary.total}
    </p>
  );
}

export function CheckoutPreview({ input }: { input: CheckoutInput }) {
  const [actor] = useState(() => createActor(checkoutMachine, { input }));
  const total = useSelector(actor, (snapshot) => snapshot.context.total);
  return <p>Initial checkout total: {total}</p>;
}
