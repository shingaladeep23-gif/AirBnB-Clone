import type { Listing } from "@/lib/types";
import { formatPrice } from "@/lib/listing";

/**
 * The sticky right-hand booking card: price, date/guest pickers, Reserve CTA.
 *
 * STUB — T4. Two parity details worth preserving when it's built:
 *   • it sticks below the header, so its `top` must account for --spacing-header-h
 *   • the Reserve CTA is a three-stop gradient (--color-cta-from/via/to), not a
 *     flat rausch fill
 */
export function BookingCard({ listing }: { listing: Listing }) {
  const { total, currency, nights } = listing.pricing;

  return (
    <aside className="sticky top-[calc(var(--spacing-header-h)+24px)] w-booking-card-w rounded-card border border-border bg-surface p-6 shadow-card">
      <p className="text-xl font-semibold text-fg">
        {formatPrice(total, currency)}{" "}
        <span className="text-base font-normal text-subtle">
          for {nights} nights
        </span>
      </p>
      {/* T4: date picker, guest picker, Reserve CTA, price breakdown. */}
    </aside>
  );
}
