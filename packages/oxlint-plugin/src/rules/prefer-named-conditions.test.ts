import { RuleTester } from 'oxlint/plugins-dev';
import { describe, it } from 'vitest';

import { preferNamedConditions } from './prefer-named-conditions.ts';

// Without these, RuleTester runs the cases outside vitest's test tree.
RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({ languageOptions: { parserOptions: { lang: 'tsx' } } });

ruleTester.run('prefer-named-conditions', preferNamedConditions, {
  valid: [
    'if (price >= min && price <= max) showPrice(price);',
    'if (isAdult && canAfford && isInStock) allowPurchase();',
    'if (user !== undefined && canPurchase(user)) openCheckout();',
    'const canBuy = age >= 19 && balance >= price && stock > 0;',
    'function canBuy(user) { return user.age >= 19 && user.balance >= price && user.stock > 0; }',
    'const canBuy = () => age >= 19 && balance >= price && stock > 0;',
    'const permissions = { canBuy: () => age >= 19 && balance >= price && stock > 0 };',
    'class Checkout { canBuy() { return age >= 19 && balance >= price && stock > 0; } }',
    'name || "Anonymous";',
    '<main>{isOpen && items.length > 0 && <List />}</main>;',
    '<main>{items.some(isInStock) && <><List /></>}</main>;',
    '<main>{items.some((item) => item.inStock) && <List />}</main>;',
    'name ?? displayName;',
    'if ((user?.account).active && !user?.blocked && user.hasRole?.("admin")) allowPurchase();',
    'if (isAdmin || (isOwner && !account.locked)) openCheckout();',
  ],
  invalid: [
    {
      code: 'if (age >= 19 && balance >= price && stock > 0) allowPurchase();',
      errors: [{ messageId: 'unnamedConditions' }],
    },
    {
      code: 'if (isAdmin || (ownerId === userId && !lockedAt)) openCheckout();',
      errors: [{ messageId: 'mixedOperators' }],
    },
    {
      code: 'products.filter((product) => product.category.id === targetId && product.prices.some((price) => price >= min && price <= max));',
      errors: [{ messageId: 'inlineCallback' }],
    },
    {
      code: 'if (status === "paid" || status === "refunded" || status === "cancelled") closeOrder();',
      errors: [{ messageId: 'unnamedConditions' }],
    },
    {
      code: 'orders.filter(({ status }) => { return status === "paid" || status === "refunded" || status === "cancelled"; });',
      errors: [{ messageId: 'unnamedConditions' }],
    },
    {
      code: '<button disabled={!isValid || (isSubmitting && retryCount >= 3)}>Pay</button>;',
      errors: [{ messageId: 'mixedOperators' }],
    },
    {
      name: 'reports only the root and stops counting after three checks',
      code: 'if (age >= 19 && balance >= price && (stock > 0 || credit > 0)) allowPurchase();',
      errors: [
        {
          message:
            'This condition combines 3 unnamed checks. Name the checks that carry a business meaning. Keep short-circuit order: extract to a function when the right side must not run early.',
          line: 1,
          column: 4,
        },
      ],
    },
    {
      name: 'prefers the mixed-operator diagnostic over the inline callback diagnostic',
      code: 'if (isAdmin || (isReady && items.some((item) => item.inStock))) openCheckout();',
      errors: [{ messageId: 'mixedOperators' }],
    },
    {
      name: 'counts a computed access inside a member chain as unnamed',
      code: 'if (isAdmin || (isReady && account.roles[role].active)) openCheckout();',
      errors: [{ messageId: 'mixedOperators' }],
    },
    {
      name: 'counts an inline callback in an optional call',
      code: 'if (isReady && items?.some((item) => item.inStock)) openCheckout();',
      errors: [{ messageId: 'inlineCallback' }],
    },
    {
      name: 'does not treat a computed property callback as named',
      code: 'const permissions = { [permissionKey]: () => age >= 19 && balance >= price && stock > 0 };',
      errors: [{ messageId: 'unnamedConditions' }],
    },
    {
      name: 'checks conditions in nested callbacks as separate roots',
      code: 'if (isReady && orders.some(({ status }) => status === "paid" || status === "refunded" || status === "cancelled")) closeBatch();',
      errors: [{ messageId: 'inlineCallback' }, { messageId: 'unnamedConditions' }],
    },
    {
      name: 'treats a condition below nullish coalescing as a separate root',
      code: 'const canBuy = configured ?? (age >= 19 && balance >= price && stock > 0);',
      errors: [{ messageId: 'unnamedConditions' }],
    },
  ],
});
