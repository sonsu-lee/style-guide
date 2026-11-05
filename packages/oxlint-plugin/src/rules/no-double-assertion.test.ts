import { RuleTester } from 'oxlint/plugins-dev';
import { describe, it } from 'vitest';

import { noDoubleAssertion } from './no-double-assertion.ts';

// Without these, RuleTester runs the cases outside vitest's test tree.
RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({ languageOptions: { parserOptions: { lang: 'ts' } } });

ruleTester.run('no-double-assertion', noDoubleAssertion, {
  valid: [
    'value as Foo;',
    '<Foo>value;',
    // `as const` does not count toward a chain.
    'value as Foo as const;',
    // The second assertion applies to a different value.
    '(value as Foo).bar as Baz;',
  ],
  invalid: [
    { code: 'value as unknown as Foo;', errors: [{ messageId: 'doubleAssertion' }] },
    { code: '<Foo><unknown>value;', errors: [{ messageId: 'doubleAssertion' }] },
    { code: '<Foo>(value as unknown);', errors: [{ messageId: 'doubleAssertion' }] },
    { code: '(value as unknown) as Foo;', errors: [{ messageId: 'doubleAssertion' }] },
    {
      name: 'reports a chain once, on its outermost assertion',
      code: 'value as unknown as Foo as Bar;',
      errors: [{ messageId: 'doubleAssertion', line: 1, column: 0, endLine: 1, endColumn: 30 }],
    },
  ],
});
