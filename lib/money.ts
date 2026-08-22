/**
 * Currency formatting.
 *
 * Lives in its own module because both the server (building quote labels) and
 * every view need it, and the alternative — importing it from `lib/listing.ts` —
 * would drag the entire 43-photo listing constant into an API route for the sake
 * of one function.
 *
 * Amounts are whole rupees. There are no minor units anywhere in this app: money
 * is integer arithmetic end to end, because a float cannot represent currency
 * exactly and a rounding drift between the quote and the charge is the one bug a
 * booking flow must not have.
 */

/** Formats the way the reference does: whole units, grouped, no decimals. */
export function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
