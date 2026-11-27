import { createActor, createMachine, interpret } from 'xstate';

// expect: warning sonsu-lee(prefer-machine-setup) -- the machine does not declare its implementations through setup
const legacyCheckout = createMachine({
  id: 'legacy-checkout',
  initial: 'waiting',
  states: { waiting: { on: { 'order.cancel': 'cancelled' } }, cancelled: { type: 'final' } },
});

// expect: error typescript(no-deprecated) -- interpret is the deprecated alias for createActor
export const legacyActor = interpret(legacyCheckout);
export const checkoutActor = createActor(legacyCheckout);
