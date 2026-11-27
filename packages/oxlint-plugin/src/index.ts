import { eslintCompatPlugin, type Plugin } from '@oxlint/plugins';

import { noDoubleAssertion } from './rules/no-double-assertion.ts';
import { noMachineContextMutation } from './rules/no-machine-context-mutation.ts';
import { noMachineInRender } from './rules/no-machine-in-render.ts';
import { noUnstableActorSelector } from './rules/no-unstable-actor-selector.ts';
import { preferMachineSetup } from './rules/prefer-machine-setup.ts';
import { preferNamedConditions } from './rules/prefer-named-conditions.ts';
import { requireEffectReason } from './rules/require-effect-reason.ts';
import { requireInvokeOnError } from './rules/require-invoke-on-error.ts';

// Put each rule in src/rules/<rule-id>.ts and register it here.
const plugin: Plugin = eslintCompatPlugin({
  meta: { name: '@sonsu-lee/oxlint-plugin' },
  rules: {
    'no-double-assertion': noDoubleAssertion,
    'no-machine-context-mutation': noMachineContextMutation,
    'no-machine-in-render': noMachineInRender,
    'no-unstable-actor-selector': noUnstableActorSelector,
    'prefer-machine-setup': preferMachineSetup,
    'require-invoke-on-error': requireInvokeOnError,
    'prefer-named-conditions': preferNamedConditions,
    'require-effect-reason': requireEffectReason,
  },
});

export default plugin;
