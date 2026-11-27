import { expect, it } from 'vitest';

import { formatFinding, parseMarkers } from './markers.ts';
it.each([
  [['// expect: error a -- missing', 'save();'], ['cart.ts:2 error a']],
  [
    ['// expect: error a', '// expect: warning b', 'save();'],
    ['cart.ts:3 error a', 'cart.ts:3 warning b'],
  ],
  [['// expect: warning b', '// pending order', '', 'save();'], ['cart.ts:4 warning b']],
  [['{/* expect: error a -- stale key */}', '<Order />'], ['cart.ts:2 error a']],
] as const)('resolves markers in %j', (lines, expected) => {
  expect(parseMarkers('cart.ts', lines.join('\n')).map(formatFinding)).toEqual(expected);
});
