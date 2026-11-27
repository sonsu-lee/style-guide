# @sonsu-lee/oxlint-config

Oxlint preset. Pick the profiles you need and override anything per project.

## Install

```sh
pnpm add -D oxlint oxlint-tsgolint @sonsu-lee/oxlint-config
```

Type-aware rules are on by default and run through `oxlint-tsgolint`. Your tsconfig must be compatible with TypeScript 7; the installed `typescript` package may be older. For a JavaScript project, pass `typescript: false` and skip `oxlint-tsgolint`.

## Usage

```ts
// oxlint.config.ts
import { preset } from '@sonsu-lee/oxlint-config';
import { defineConfig } from 'oxlint';

export default defineConfig(
  preset({ node: true, vitest: true, ignores: ['gen/**'] }, { rules: { 'no-console': 'off' } }),
);
```

Use `preset()` as the root config. Do not put it inside another config's `extends`: Oxlint does not inherit `ignorePatterns`, `env`, `globals`, or `settings` through `extends`, so those settings would be lost.

The preset includes the rules of [`@sonsu-lee/oxlint-plugin`](../oxlint-plugin) under the `sonsu-lee` namespace. The plugin is installed with the preset, so you do not need to install it separately. To turn a rule off:

```ts
preset({}, { rules: { 'sonsu-lee/no-double-assertion': 'off' } });
```

## API

### `preset(options?, userConfig?)`

Returns a complete Oxlint root config. Oxlint's `correctness`, `suspicious`, `perf`, and `pedantic` categories are on for the plugins of every selected profile; `style`, `restriction`, and `nursery` are off.

| Option | Default | Description |
| --- | --- | --- |
| `ignores` | `[]` | Paths to ignore in addition to `**/dist/**` and `**/coverage/**` |
| `typescript` | `true` | TypeScript plugin |
| `typeAware` | same as `typescript` | Type-aware rules, replacing the core rules they overlap with. Needs `typescript` |
| `node` | `false` | Node.js plugin and globals |
| `browser` | `false` | Browser globals |
| `react` | `false` | React and React Hooks plugin |
| `nextjs` | `false` | Next.js core-web-vitals rules; enables React |
| `vitest` | `false` | Vitest plugin for `*.test.*`, `*.spec.*`, and `*.e2e-spec.*` files |
| `nestjs` | `false` | Allows code the NestJS CLI generates. Needs `typescript` and turns on `node` |

Passing `typescript: false` with `typeAware: true` or `nestjs: true`, or `node: false` with `nestjs: true`, throws an error. Why the preset uses these categories, and when a profile changes a rule, is described in [ADR 0005](../../docs/decisions/0005-profile-rule-sources.md).

`userConfig` is merged as follows:

| Field            | Behavior                                                       |
| ---------------- | -------------------------------------------------------------- |
| `ignorePatterns` | Appended after the defaults and `ignores`                      |
| `extends`        | Applied after the preset, so it takes precedence               |
| `plugins`        | Added to the plugins that the selected profiles enable         |
| `env`            | Merged by key over the profiles' environments; user values win |
| `options`        | Overrides the preset                                           |
| Other fields     | Used as given                                                  |

A config in `extends` that omits `plugins` turns Oxlint's default plugins (`unicorn`, `typescript`, `oxc`) back on, so set `plugins: []` or list the plugins it needs.

## What the preset reports

### Promises nobody waits for

**Failure it prevents.** The warehouse rejects a transfer after the order has already been marked as synced.

**Reported**

```ts
void pushToWarehouse(order);
markSynced(order);
```

**Allowed**

```ts
await pushToWarehouse(order);
markSynced(order);
```

**Profile and severity.** The type-aware profile reports an error. Return the promise, await it, or attach a rejection handler. The NestJS profile allows `void bootstrap()` in `main.ts`.

**What it cannot see.** JavaScript-only presets without type-aware linting and calls on `any` do not provide the promise type this check needs.

### Rejections that are silently dropped

**Failure it prevents.** Cache warmup fails but the caller still marks the region ready.

**Reported**

```ts
await warmCache(region).catch(() => {});
markWarm(region);
```

**Allowed**

```ts
const cached = await readCache(key).catch(() => undefined);
return cached ?? loadFromDatabase(key);
```

**Profile and severity.** `@sonsu-lee/eslint-config`, not Oxlint, reports `sonsu-lee-eslint/no-ignored-rejection` as an error.

**What it cannot see.** The rule does not follow a handler passed by reference or decide whether a log message provides adequate recovery.

### Ternaries

**Failure it prevents.** A second shipping threshold can be added to the wrong arm of a nested fee calculation.

**Reported:** `return member ? 0 : subtotal >= 50 ? 0 : 5;`

**Allowed:** `if (member || subtotal >= 50) return 0; return 5;`

**Profile and severity.** Base, error, including JSX.

**What it cannot see.** The rule detects the operator, not whether the thresholds are correct.

### Implicit boolean checks

**Failure it prevents.** A missing feature flag takes the disabled path instead of using the account default.

**Reported:** `if (flags.betaCheckout)` for an optional boolean; `!!coupon`.

**Allowed:** `flags.betaCheckout === true`, `flags.betaCheckout ?? defaults.betaCheckout`, and `Boolean(coupon)`.

**Profile and severity.** Base reports double negation; the type-aware profile reports nullable booleans in conditions. Both are errors.

**What it cannot see.** `Boolean({ ok: false })` is true. Read `.ok` when the result object carries a success flag. Numeric conversion such as `+quantityText` remains allowed.

### Complex inline conditions

**Failure it prevents.** A reviewer can miss which checks apply to an administrator and which apply only to the owner.

**Reported:** `if (isAdmin || (ownerId === userId && !lockedAt))`.

**Allowed:** `if (isAdmin || canEditOwnOrder)`; a two-sided range check such as `price >= min && price <= max`.

**Profile and severity.** Base, warning. Keep a short-circuit check inline if extracting it would evaluate a costly callback early and a helper would obscure the order.

**What it cannot see.** The rule does not judge names or know what a callback costs. It does not rewrite the expression.

### React Hooks

**Failure it prevents.** A memo or callback keeps the previous search term when its dependency array omits that term.

**Reported:** `useMemo(() => search(term), [])`.

**Allowed:** `useMemo(() => search(term), [term])`.

**Profile and severity.** The React profile follows the [React Hooks recommended config](https://github.com/facebook/react/blob/main/packages/eslint-plugin-react-hooks/src/index.ts) for these rules:

| Rule | Severity |
| --- | --- |
| `rules-of-hooks`, `set-state-in-effect`, `set-state-in-render` | Error |
| `exhaustive-deps`, `incompatible-library` | Warning |
| `exhaustive-effect-dependencies`, `memo-dependencies`, `no-deriving-state-in-effects` | Off; duplicate findings |

**What it cannot see.** A complete dependency list does not establish that a component needs an Effect.

### Effects

**Failure it prevents.** Copying a derived prop to state in an Effect makes the first render show the previous value.

**Reported:** a call to `useEffect`, `useLayoutEffect`, or `useInsertionEffect` without a reason.

**Allowed:**

```tsx
// effect: Keep the chat connection subscribed to the room on screen.
useEffect(() => connect(roomId), [roomId]);
```

**Profile and severity.** React, error. The reason does not suppress dependency or state checks.

**What it cannot see.** Re-exports, destructured namespace members, and whether a stated reason is true. For alternatives, see [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect).

### Next.js

**Failure it prevents.** A synchronous script delays rendering, and a plain image bypasses Next.js image optimization.

**Reported:** `<script src="/checkout.js" />` and `<img src="/hero.png" alt="" />`.

**Allowed:** `next/script` and `next/image`.

**Profile and severity.** `nextjs` follows the supported rules in `@next/eslint-plugin-next`'s `core-web-vitals` config:

| Examples                                                                  | Severity |
| ------------------------------------------------------------------------- | -------- |
| `no-img-element`, `no-head-element`, `no-async-client-component`          | Warning  |
| `no-sync-scripts`, `no-html-link-for-pages`, `no-head-import-in-document` | Error    |

**What it cannot see.** This is not the full `eslint-config-next`: it does not add jsx-a11y or import rules. It sets no global environment because server and client files share a project.

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[MIT](LICENSE) © Sonsu Lee
