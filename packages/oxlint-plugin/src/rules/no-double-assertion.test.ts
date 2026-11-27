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
    // `!` and `satisfies` break a chain. The rule docs list these as known gaps.
    '(value as unknown)! as Foo;',
    '(value as unknown satisfies unknown) as Foo;',
  ],
  invalid: [
    { code: 'value as unknown as Foo;', errors: [{ messageId: 'doubleAssertion' }] },
    // oxfmt adds parentheses to `<Foo><unknown>value` and removes them from
    // `(value as unknown) as Foo`, so these two forms are not in the docs.
    { code: '<Foo><unknown>value;', errors: [{ messageId: 'doubleAssertion' }] },
    { code: '<Foo>(value as unknown);', errors: [{ messageId: 'doubleAssertion' }] },
    { code: '(value as unknown) as Foo;', errors: [{ messageId: 'doubleAssertion' }] },
    {
      name: 'reports a chain once, on its outermost assertion',
      code: 'value as unknown as Foo as Bar;',
      errors: [{ messageId: 'doubleAssertion', line: 1, column: 0, endLine: 1, endColumn: 30 }],
    },
    {
      name: 'counts the rest of a chain that starts with `as const`',
      code: '[1] as const as unknown as Foo;',
      errors: [{ messageId: 'doubleAssertion' }],
    },
    {
      name: 'reports each chain in an expression',
      code: '(a as unknown as A).b as unknown as B;',
      errors: [
        { messageId: 'doubleAssertion', line: 1, column: 0, endLine: 1, endColumn: 37 },
        { messageId: 'doubleAssertion', line: 1, column: 1, endLine: 1, endColumn: 18 },
      ],
    },
  ],
});
