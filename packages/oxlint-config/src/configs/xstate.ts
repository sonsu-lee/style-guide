import type { OxlintConfig } from 'oxlint';

// XState v5 rules from @sonsu-lee/oxlint-plugin, which base registers. They follow Stately's
// docs and its xstate-v5 agent skill.
export const xstate: OxlintConfig = {
  plugins: [],
  rules: {
    'sonsu-lee/no-machine-in-render': 'error',
    'sonsu-lee/no-machine-context-mutation': 'error',
    // Signals to review: a missing `onError` stops the actor on failure, a bare `createMachine`
    // loses typed implementation names, and an object-returning selector re-renders on every
    // snapshot.
    'sonsu-lee/require-invoke-on-error': 'warn',
    'sonsu-lee/prefer-machine-setup': 'warn',
    'sonsu-lee/no-unstable-actor-selector': 'warn',
  },
};
