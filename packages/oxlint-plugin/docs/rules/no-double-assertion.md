# no-double-assertion

Disallow chaining type assertions, such as `value as unknown as Foo`.

## Rule details

TypeScript rejects an assertion between two types that do not overlap enough, because the conversion is likely a mistake. Asserting through `unknown` or `any` first gets past that check. An assertion has no runtime check, so when the value does not match the asserted type, the error shows up later, far from the assertion.

Narrow the value with a type guard instead, or parse it where it enters the program.

The rule counts assertions that apply directly to one another, in both the `as` and `<T>` syntax, with or without parentheses. It reports a chain once, on its outermost assertion. `as const` does not count, because it only narrows literals.

The rule has no options and no autofix. Removing an assertion changes the type the code depends on.

Examples of code that this rule reports:

```ts
value as unknown as Foo;
<Foo>(<unknown>value);
<Foo>(value as unknown);
value as unknown as Foo;
value as unknown as Foo as Bar; // reported once
```

Examples of code that this rule allows:

```ts
value as Foo;
<Foo>value;
value as Foo as const;
(value as Foo).bar as Baz;
```

## What the rule cannot see

The rule reads the syntax of one expression, so it does not report:

- Assertions split across statements, such as `const raw = value as unknown; raw as Foo;`.
- Chains broken by `!` or `satisfies`, such as `(value as unknown)! as Foo`.
- A single assertion on a value that is already `any`, such as `JSON.parse(text) as Foo`.
- A single assertion to `never` or `any`, such as `{} as never`, which also gets past TypeScript's check.

With type-aware linting enabled, `typescript/no-unsafe-type-assertion` reports assertions that narrow a type, whatever statement they are in. `@sonsu-lee/oxlint-config` turns that rule off in test files, where this rule is the only check.

## Test doubles without a double assertion

- A partial mock of an interface or class: `mock<T>()` from `vitest-mock-extended`, `createMock<T>()` from `@golevelup/ts-vitest`, or a NestJS testing module with `useValue`.
- A wrong argument on purpose: `// @ts-expect-error -- <reason>` on the call.
- A private member: bracket access, such as `service['cache']`.
- A global: `vi.stubGlobal('fetch', vi.fn())`.
- If a single assertion compiles, remove `as unknown`.
