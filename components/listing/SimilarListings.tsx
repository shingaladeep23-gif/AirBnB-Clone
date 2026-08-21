import Image from "next/image";
import type { SimilarListing } from "@/lib/types";
import { formatPrice } from "@/lib/listing";
import { ChevronIcon, StarIcon } from "@/components/ui/icons";

/**
 * Bottom "Similar listings" rail (BELOW-FOLD-SPEC §14).
 *
 * Six 3:2 cards (720x480 sources). Shape: a single row across the 1120px column
 * showing 4 at a time — 4x254 + 3x32 gutters = 1112, which fits — with chevrons
 * revealing cards 5-6.
 *
 * The rail scrolls natively (overflow-x + scroll-snap) rather than with a JS
 * carousel: it keeps the component a Server Component, and native scrolling is
 * keyboard- and trackpad-accessible for free. The chevrons are presentational
 * affordances over that.
 *
 * The heading string is unconfirmed — Airbnb's wording for nearby-stay rails
 * varies. Flagged rather than asserted.
 */
export function SimilarListings({ listings }: { listings: SimilarListing[] }) {
  if (listings.length === 0) return null;

  return (
    <section className="border-t border-border-subtle py-12">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-fg">Similar listings</h2>
        <div className="flex gap-2">
          <span className="flex size-8 items-center justify-center rounded-pill border border-border text-fg">
            <ChevronIcon size={12} />
          </span>
          <span className="flex size-8 rotate-180 items-center justify-center rounded-pill border border-border text-fg">
            <ChevronIcon size={12} />
          </span>
        </div>
      </div>

      <ul className="flex snap-x snap-mandatory gap-8 overflow-x-auto pt-6">
        {listings.map((item) => (
          <li key={item.id} className="w-similar-card-w shrink-0 snap-start">
            <div className="relative aspect-3/2 overflow-hidden rounded-card bg-surface-sunken">
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="254px"
                className="object-cover"
              />
            </div>
            <p className="truncate pt-3 text-base font-medium text-fg">
              {item.title}
            </p>
            <p className="truncate text-sm text-subtle">{item.propertyType}</p>
            <p className="pt-1 text-sm text-fg">
              <span className="font-semibold">
                {formatPrice(item.price, "INR")}
              </span>{" "}
              for {item.nights} nights
            </p>
            <p className="flex items-center gap-1 pt-1 text-sm text-fg">
              <StarIcon size={10} />
              {item.rating}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
