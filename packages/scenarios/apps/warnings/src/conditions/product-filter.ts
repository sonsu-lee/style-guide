interface Product {
  category: { id: string };
  prices: readonly number[];
}

interface SearchFilters {
  categoryId: string;
  min: number;
  max: number;
}

export function filterProductsInline(
  products: readonly Product[],
  { categoryId, min, max }: SearchFilters,
): Product[] {
  return products.filter(
    (product) =>
      // expect: warning sonsu-lee(prefer-named-conditions) -- The category check and price search are coupled inside the filter callback.
      product.category.id === categoryId &&
      product.prices.some((price) => price >= min && price <= max),
  );
}

export function filterProducts(
  products: readonly Product[],
  { categoryId, min, max }: SearchFilters,
): Product[] {
  function isInPriceRange(price: number): boolean {
    return price >= min && price <= max;
  }

  return products.filter((product) => {
    const isInCategory = product.category.id === categoryId;
    // Search prices only for products in the selected category.
    return isInCategory && product.prices.some(isInPriceRange);
  });
}

interface Customer {
  accountActive: boolean;
  availableCredit: number;
}

export function checkoutStatus(customer: Customer | undefined, total: number): string {
  function canPurchase(account: Customer): boolean {
    return account.accountActive && account.availableCredit >= total;
  }

  // Keep the guard beside the call: canPurchase requires a customer and must not run first.
  if (customer !== undefined && canPurchase(customer)) return 'Ready to pay';
  return 'Checkout unavailable';
}
