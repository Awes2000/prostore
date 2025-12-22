/**
 * Calculate total for a single item (price × quantity)
 */
export function calculateItemTotal(price: number | string, quantity: number): number {
  return Number(price) * quantity;
}

/**
 * Format price as currency string
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}
