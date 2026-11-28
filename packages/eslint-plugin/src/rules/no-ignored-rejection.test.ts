import * as parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';

import { noIgnoredRejection } from './no-ignored-rejection.ts';

const tester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
  },
});

const orderService = `
  declare const id: string;
  declare const ids: string[];
  declare const key: string;
  declare function saveOrder(id: string): Promise<void>;
  declare function showDone(): void;
  declare function showSaveError(error: unknown): void;
  declare function readCache(key: string): Promise<string>;
  declare function compute(): string;
  declare function fetchUser(id: string): Promise<{ id: string }>;
`;
const filename = `${import.meta.dirname}/fixtures/file.ts`;

function withOrderService(code: string): { code: string; filename: string } {
  return { code: `${orderService}\n${code}`, filename };
}

tester.run('no-ignored-rejection', noIgnoredRejection, {
  valid: [
    withOrderService(
      'const cached = await readCache(key).catch(() => undefined); cached ?? compute();',
    ),
    withOrderService('const findUser = () => fetchUser(id).catch(() => null);'),
    withOrderService('function findUser() { return fetchUser(id).catch(() => null); }'),
    withOrderService('saveOrder(id).catch(showSaveError);'),
    withOrderService('saveOrder(id).catch((error: unknown) => { showSaveError(error); });'),
    withOrderService('saveOrder(id).catch((error: unknown) => { throw error; });'),
    withOrderService(`
      interface Schema { catch(fallback: () => undefined): Schema }
      declare const schema: Schema;
      schema.catch(() => undefined);
    `),
    withOrderService('const unchecked = JSON.parse("{}"); unchecked.catch(() => {});'),
    withOrderService('saveOrder(id).finally(() => {});'),
    withOrderService('saveOrder(id).then(() => {});'),
    withOrderService(`
      const fulfillmentArgs: [] = [];
      saveOrder(id).then(...fulfillmentArgs, () => {});
    `),
    withOrderService('saveOrder(id)["catch"](() => {});'),
  ],
  invalid: [
    {
      ...withOrderService('const submit = () => void saveOrder(id).catch(() => undefined);'),
      errors: [{ messageId: 'discardedFallback' }],
    },
    {
      ...withOrderService('await saveOrder(id).catch(() => {});'),
      errors: [{ messageId: 'emptyHandler' }],
    },
    {
      ...withOrderService('await saveOrder(id).catch(() => { /* Nothing to show */ });'),
      errors: [{ messageId: 'emptyHandler' }],
    },
    {
      ...withOrderService('saveOrder(id).then(showDone, () => {});'),
      errors: [{ messageId: 'emptyHandler' }],
    },
    {
      ...withOrderService('await saveOrder(id).catch(() => undefined);'),
      errors: [{ messageId: 'discardedFallback', data: { value: 'undefined' } }],
    },
    {
      ...withOrderService('void saveOrder(id).catch(() => null);'),
      errors: [{ messageId: 'discardedFallback', data: { value: 'null' } }],
    },
    {
      code: 'Promise.resolve().catch(() => undefined);',
      filename,
      errors: [{ messageId: 'discardedFallback', data: { value: 'undefined' } }],
    },
    {
      ...withOrderService(
        'declare const pending: Promise<void> | undefined; pending?.catch(() => {});',
      ),
      errors: [{ messageId: 'emptyHandler' }],
    },
    {
      ...withOrderService(`
        class OrderQueue implements PromiseLike<void> {
          constructor(pending: Promise<void>) { this.then = pending.then.bind(pending); }
          then: PromiseLike<void>['then'];
        }
        const queue = new OrderQueue(saveOrder(id));
        queue.then(undefined, () => {});
      `),
      errors: [{ messageId: 'emptyHandler' }],
    },
    {
      ...withOrderService(
        'await Promise.all(ids.map((orderId) => saveOrder(orderId).catch(() => {})));',
      ),
      errors: [{ messageId: 'emptyHandler' }],
    },
    {
      ...withOrderService('await saveOrder(id).catch(function () { return; });'),
      errors: [{ messageId: 'discardedFallback', data: { value: 'undefined' } }],
    },
    {
      ...withOrderService(
        'declare const pending: Promise<void> | undefined; void pending?.catch(() => void 0)!;',
      ),
      errors: [{ messageId: 'discardedFallback', data: { value: 'undefined' } }],
    },
    {
      ...withOrderService('await saveOrder(id).catch(() => null as { id: string } | null);'),
      errors: [{ messageId: 'discardedFallback', data: { value: 'null' } }],
    },
    {
      ...withOrderService('await saveOrder(id).catch(() => <null>null);'),
      errors: [{ messageId: 'discardedFallback', data: { value: 'null' } }],
    },
    {
      ...withOrderService('await saveOrder(id).catch(() => undefined!);'),
      errors: [{ messageId: 'discardedFallback', data: { value: 'undefined' } }],
    },
  ],
});
