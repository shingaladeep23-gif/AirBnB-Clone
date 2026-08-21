import Image from "next/image";
import type { Promo } from "@/lib/types";

/**
 * The "Get 10% off your next stay" card, above the booking card in the sticky
 * right column. Copy and the discount.svg asset both come from the spec.
 *
 * APPROX: the card's exact box was not measured; only its contents and position.
 */
export function PromoCard({ promo }: { promo: Promo }) {
  return (
    <section
      aria-label="Promotion"
      className="flex items-center gap-3 rounded-card border border-border-subtle bg-surface-sunken px-4 py-3.5"
    >
      <Image src={promo.icon} alt="" width={28} height={28} className="shrink-0" />

      <div className="flex-1">
        <p className="text-sm font-medium text-fg">{promo.headline}</p>
        <p className="text-xs text-subtle">{promo.terms}</p>
      </div>

      <button
        type="button"
        className="shrink-0 rounded-md px-2 py-1 text-sm font-medium text-fg underline transition-colors duration-fast hover:bg-surface-hover"
      >
        {promo.ctaLabel}
      </button>
    </section>
  );
}
