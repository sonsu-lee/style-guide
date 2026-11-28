# prefer-named-conditions

Warn when an inline `&&` or `||` expression makes the reader work out several checks at once. A named check can explain why a purchase is allowed without asking the reader to infer the policy from comparisons.

## Rule details

The rule looks through nested `&&` and `||` operators and reports the outer expression once. In order of priority, it reports conditions that:

1. Combine at least three unnamed checks.
2. Mix `&&` and `||` with at least one unnamed check.
3. Combine a call that takes an inline function with another check.

An identifier, a literal, a noncomputed member chain such as `user?.account.active`, and a call with no inline callback count as named. Comparisons, computed member access, and calls with inline callbacks count as unnamed. A leading `!` does not change how a check is counted. JSX elements and fragments do not count: they are rendered content, not checks.

The rule skips a whole condition assigned in a variable declaration, used as a named arrow function's expression body, or returned from a named function whose body contains only that `return`. Function declarations, functions assigned in variable declarations, and functions on noncomputed property or method keys count as named. An anonymous callback passed as an argument does not. The `??` operator does not join a condition tree.

Examples of code that this rule reports:

```tsx
if (age >= 19 && balance >= price && stock > 0) allowPurchase();
if (isAdmin || (ownerId === userId && !lockedAt)) openCheckout();
products.filter(
  (product) =>
    product.category.id === targetId &&
    product.prices.some((price) => price >= min && price <= max),
);
if (status === 'paid' || status === 'refunded' || status === 'cancelled') closeOrder();
orders.filter(({ status }) => {
  return status === 'paid' || status === 'refunded' || status === 'cancelled';
});
<button disabled={!isValid || (isSubmitting && retryCount >= 3)}>Pay</button>;
```

Examples of code that this rule allows:

```tsx
if (price >= min && price <= max) showPrice(price);
if (isAdult && canAfford && isInStock) allowPurchase();
if (user !== undefined && canPurchase(user)) openCheckout();
const canBuy = age >= 19 && balance >= price && stock > 0;
function canBuy(user) {
  return user.age >= 19 && user.balance >= price && user.stock > 0;
}
name || 'Anonymous';
<main>{isOpen && items.length > 0 && <List />}</main>;
name ?? displayName;
```

## What the rule cannot see

The rule cannot tell whether a name describes the policy, what a check costs to evaluate, or whether extracting it changes which checks run. If the right side must stay lazy, keep it behind `&&` or `||` and call a function there instead of computing a variable before the expression. In `user !== undefined && canPurchase(user)`, for example, the guard must run before `canPurchase(user)`.

The rule has no options or autofix.
