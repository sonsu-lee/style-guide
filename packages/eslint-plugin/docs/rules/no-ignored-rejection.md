# no-ignored-rejection

Report inline Promise rejection handlers that turn a failed operation into a success without passing on the failure or returning a recovery value the caller reads.

## Rule details

An empty rejection handler, including one that contains only comments, resolves the resulting promise with `undefined`. An order cache can then be marked ready even though warming it failed. The rule reports an empty handler even if the caller reads the resolved value.

The rule also reports a handler that only returns `undefined`, `null`, or a `void` expression when the result of the chain is discarded. A bare `return;` counts as returning `undefined`. Assigning, returning, or passing on the result can make the fallback part of recovery instead.

Examples of code that this rule reports:

```ts
await saveOrder(id).catch(() => {});
saveOrder(id).then(showDone, () => {});
await saveOrder(id).catch(() => undefined);
void saveOrder(id).catch(() => null);
```

Examples of code that this rule allows:

```ts
const cached = await readCache(key).catch(() => undefined);
cached ?? compute();

function findUser() {
  return fetchUser(id).catch(() => null);
}

saveOrder(id).catch(showSaveError);
saveOrder(id).catch((error: unknown) => {
  throw error;
});
```

The rule has no options or autofix. The caller decides whether to propagate the failure, recover from it, or report it.

## What the rule cannot see

- It checks dot calls to `.catch(handler)` and `.then(onFulfilled, handler)` on types with a callable `then` method that accepts a callback. It does not inspect `try`/`catch`, computed property calls, or receivers typed as `any` or `unknown`.
- It skips `.then(...args, handler)` because the spread can change which argument handles rejection.
- It does not follow references such as `.catch(showSaveError)` or check whether a handler does enough to report a failure. A handler that only logs an error can still leave the caller unaware.
- It treats `void` as an `undefined` result without inspecting the expression for side effects.
- For a constant fallback returned from an arrow expression, the rule does not follow the chain to see whether that arrow's caller reads the result.
