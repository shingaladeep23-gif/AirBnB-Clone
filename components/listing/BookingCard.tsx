import type { Listing } from "@/lib/types";
import { formatPrice } from "@/lib/listing";

/**
 * The booking card: price, CHECK-IN / CHECKOUT date fields, and the Reserve CTA.
 *
 * Two parity details that are easy to get wrong:
 *   • The Reserve CTA is a THREE-STOP gradient (--color-cta-from/via/to), not a
 *     flat rausch fill.
 *   • The date fields are a single bordered box with an internal cross rule, not
 *     two separate inputs — the shared border is what makes it read as one control.
 *
 * APPROX: internal spacing is judgement. The spec gives the card's contents and
 * the price string but not its measured box.
 *
 * The date fields are presentational for now: this is a clone of a listing page,
 * and no date-picker behaviour was in scope for T4.
 */
export function BookingCard({ listing }: { listing: Listing }) {
  const { total, currency, nights } = listing.pricing;

  return (
    <section
      aria-label="Reserve this place"
      className="rounded-card border border-border bg-surface p-6 shadow-card"
    >
      <p className="flex items-baseline gap-1.5">
        <span className="text-xl font-semibold text-fg">
          {formatPrice(total, currency)}
        </span>
        <span className="text-base text-fg">for {nights} nights</span>
      </p>

      <div className="mt-4 rounded-card border border-border">
        <div className="grid grid-cols-2">
          <div className="border-r border-border px-3 py-2.5">
            <p className="text-2xs font-semibold uppercase tracking-wide text-fg">
              Check-in
            </p>
            <p className="pt-0.5 text-sm text-subtle">Add date</p>
          </div>
          <div className="px-3 py-2.5">
            <p className="text-2xs font-semibold uppercase tracking-wide text-fg">
              Checkout
            </p>
            <p className="pt-0.5 text-sm text-subtle">Add date</p>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="mt-4 h-12 w-full rounded-card bg-gradient-to-r from-cta-from via-cta-via to-cta-to text-base font-semibold text-fg-inverse transition-opacity duration-fast hover:opacity-95"
      >
        Reserve
      </button>

      <p className="pt-3 text-center text-sm text-subtle">
        You won&rsquo;t be charged yet
      </p>
    </section>
  );
}
