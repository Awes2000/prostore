/**
 * Format a number or string as USD currency
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "$19.99", "$1,000.00")
 */
export function formatCurrency(amount: number | string): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount);
}
