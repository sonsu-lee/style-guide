import { eslintCompatPlugin, type Plugin } from '@oxlint/plugins';

import { noDoubleAssertion } from './rules/no-double-assertion.ts';

// Put each rule in src/rules/<rule-id>.ts and register it here.
const plugin: Plugin = eslintCompatPlugin({
  meta: { name: '@sonsu-lee/oxlint-plugin' },
  rules: { 'no-double-assertion': noDoubleAssertion },
});

export default plugin;
