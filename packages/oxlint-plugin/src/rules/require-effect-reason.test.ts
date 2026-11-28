import { RuleTester } from 'oxlint/plugins-dev';
import { describe, it } from 'vitest';

import { requireEffectReason } from './require-effect-reason.ts';

RuleTester.describe = describe;
RuleTester.it = it;

new RuleTester().run('require-effect-reason', requireEffectReason, {
  valid: [
    {
      name: 'accepts a line comment explaining the chat subscription',
      code: `import { useEffect } from 'react';
function useChatRoom(roomId) {
  // effect: Subscribe to the current chat room and disconnect when it changes.
  useEffect(() => connectToChat(roomId), [roomId]);
}`,
    },
    {
      name: 'accepts a block comment above a statement containing the call',
      code: `import * as React from 'react';
function useChatRoom(roomId) {
  /* effect: Subscribe to the current chat room and disconnect when it changes. */
  return React.useEffect(() => connectToChat(roomId), [roomId]);
}`,
    },
    "import { useEffect } from './chat-runtime.js'; useEffect(connectToChat, []);",
    'function useEffect(connect) { return connect(); } useEffect(connectToChat);',
    {
      name: 'allows a local parameter that shadows a React alias',
      code: `import { useEffect as useSync } from 'react';
function attachChat(useSync) {
  useSync(connectToChat);
}`,
    },
    {
      name: 'allows a local parameter that shadows a string-literal React alias',
      code: `import { 'useEffect' as useSync } from 'react';
function attachChat(useSync) {
  useSync(connectToChat);
}`,
    },
    `import { useSyncExternalStore } from 'react';
function useOnlineStatus() {
  return useSyncExternalStore(subscribeToNetwork, getOnlineStatus);
}`,
  ],
  invalid: [
    {
      name: 'reports an Effect inside a custom hook without a reason',
      code: `import { useEffect } from 'react';
function useChatRoom(roomId) {
  useEffect(() => connectToChat(roomId), [roomId]);
}`,
      errors: [{ messageId: 'missingReason', line: 3, column: 2, endColumn: 11 }],
    },
    {
      name: 'reports a named alias even when the call precedes its import',
      code: `function useChatRoom(roomId) {
  useSync(() => connectToChat(roomId), [roomId]);
}
import { useEffect as useSync } from 'react';`,
      errors: [{ messageId: 'missingReason' }],
    },
    {
      name: 'reports a string-literal named import aliased to a different local name',
      code: `import { 'useEffect' as useSync } from 'react';
function useChatRoom(roomId) {
  useSync(() => connectToChat(roomId), [roomId]);
}`,
      errors: [{ messageId: 'missingReason', line: 3 }],
    },
    {
      name: 'reports a layout Effect on a React default import',
      code: `import React from 'react';
function useChatFocus() {
  React.useLayoutEffect(focusComposer, []);
}`,
      errors: [{ messageId: 'missingReason' }],
    },
    {
      name: 'reports an insertion Effect with an empty reason',
      code: `import { useInsertionEffect } from 'react';
function useChatTheme() {
  // effect:
  useInsertionEffect(insertChatTheme, []);
}`,
      errors: [{ messageId: 'missingReason' }],
    },
    {
      name: 'does not apply a reason to the next Effect after another statement',
      code: `import * as React from 'react';
function useChatRoom(roomId) {
  // effect: Subscribe to the current chat room and disconnect when it changes.
  React.useEffect(() => connectToChat(roomId), [roomId]);
  React.useEffect(updatePageTitle, []);
}`,
      errors: [{ messageId: 'missingReason', line: 5 }],
    },
  ],
});
