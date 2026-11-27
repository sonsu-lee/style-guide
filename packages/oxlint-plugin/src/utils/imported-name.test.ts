import type { Rule } from '@oxlint/plugins';
import { RuleTester } from 'oxlint/plugins-dev';
import { describe, it } from 'vitest';

import { importedName } from './imported-name.ts';
RuleTester.describe = describe;
RuleTester.it = it;
const probe: Rule = {
  meta: { schema: [], messages: { found: 'Found effect import.' } },
  createOnce(context) {
    return {
      CallExpression(node) {
        if (importedName(context, node.callee, 'react') === 'useEffect')
          context.report({ node, messageId: 'found' });
      },
    };
  },
};
new RuleTester().run('imported-name', probe, {
  valid: ["import {useEffect} from 'other'; useEffect();", 'function useEffect() {} useEffect();'],
  invalid: [
    "import {useEffect} from 'react'; useEffect();",
    "import {useEffect as sync} from 'react'; sync();",
    "import React from 'react'; React.useEffect();",
    "import * as React from 'react'; React.useEffect();",
  ].map((code) => ({ code, errors: [{ messageId: 'found' }] })),
});
