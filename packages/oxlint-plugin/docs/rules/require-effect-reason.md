# require-effect-reason

Require a `// effect: <reason>` comment before calls to React's `useEffect`, `useLayoutEffect`, and `useInsertionEffect`.

## Rule details

An Effect synchronizes a component with a system outside React. The comment names that system and says what the Effect keeps in sync. The rule checks direct imports from `react`, including aliases and calls on a default or namespace import. It also checks Effects inside custom hooks.

The comment belongs directly before the statement containing the call. A line or block comment works if its text starts with `effect:` followed by a nonblank reason. The comment does not disable React's dependency or other Effect checks. This rule has no options or autofix.

Examples of code that this rule reports:

```ts
import { useEffect } from 'react';

function useChatRoom(roomId: string) {
  useEffect(() => connectToChat(roomId), [roomId]);
}
```

```ts
import { useInsertionEffect } from 'react';

function useChatTheme() {
  // effect:
  useInsertionEffect(insertChatTheme, []);
}
```

Examples of code that this rule allows:

```ts
import { useEffect } from 'react';

function useChatRoom(roomId: string) {
  // effect: Subscribe to the current chat room and disconnect when it changes.
  useEffect(() => connectToChat(roomId), [roomId]);
}
```

```ts
import * as React from 'react';

function useChatRoom(roomId: string) {
  /* effect: Subscribe to the current chat room and disconnect when it changes. */
  return React.useEffect(() => connectToChat(roomId), [roomId]);
}
```

## What the rule cannot see

- Whether the stated reason is true or the Effect is necessary.
- React hooks re-exported by another module or read through a computed member such as `React['useEffect']`.
- Hooks extracted by destructuring the React object, such as `const { useEffect } = React`.

For examples of when an Effect is unnecessary, see [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect).
