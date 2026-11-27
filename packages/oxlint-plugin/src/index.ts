import { eslintCompatPlugin, type Plugin } from '@oxlint/plugins';

import { noDoubleAssertion } from './rules/no-double-assertion.ts';
import { preferNamedConditions } from './rules/prefer-named-conditions.ts';
import { requireEffectReason } from './rules/require-effect-reason.ts';

// Put each rule in src/rules/<rule-id>.ts and register it here.
const plugin: Plugin = eslintCompatPlugin({
  meta: { name: '@sonsu-lee/oxlint-plugin' },
  rules: {
    'no-double-assertion': noDoubleAssertion,
    'prefer-named-conditions': preferNamedConditions,
    'require-effect-reason': requireEffectReason,
  },
});

export default plugin;
