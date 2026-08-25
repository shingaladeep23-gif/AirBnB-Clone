import Image from "next/image";
import type { SimilarListing } from "@/lib/types";
import { formatPrice } from "@/lib/listing";
import { ChevronIcon, StarIcon } from "@/components/ui/icons";

/**
 * Bottom "Similar listings" rail (BELOW-FOLD-SPEC §14).
 *
 * Eight cards. Shape: a single row across the 1120px column
 * showing 4 at a time — 4x254 + 3x32 gutters = 1112, which fits — with chevrons
 * revealing cards 5-6.
 *
 * The rail scrolls natively (overflow-x + scroll-snap) rather than with a JS
 * carousel: it keeps the component a Server Component, and native scrolling is
 * keyboard- and trackpad-accessible for free. The chevrons are presentational
 * affordances over that.
 *
 * The heading and the "1 / 2" pager label are transcribed from the reference.
 */
export function SimilarListings({ listings }: { listings: SimilarListing[] }) {
  if (listings.length === 0) return null;

  return (
    <section className="border-t border-border-subtle py-12">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium text-fg">More stays nearby</h2>
        <div className="flex items-center gap-2">
          {/* Eight cards, four at a time — the reference labels the pager. */}
          <span className="pr-1 text-sm text-fg">1 / 2</span>
          <span className="flex size-8 items-center justify-center rounded-pill border border-border text-fg">
            <ChevronIcon size={12} />
          </span>
          <span className="flex size-8 rotate-180 items-center justify-center rounded-pill border border-border text-fg">
            <ChevronIcon size={12} />
          </span>
        </div>
      </div>

      <ul className="flex snap-x snap-mandatory gap-similar-card-gap overflow-x-auto pt-6">
        {listings.map((item) => (
          <li key={item.id} className="w-similar-card-w shrink-0 snap-start">
            <div className="relative aspect-square overflow-hidden rounded-card bg-surface-sunken">
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="208px"
                className="object-cover"
              />
            </div>
            <p className="truncate pt-3 text-sm font-medium text-fg">
              {item.title}
            </p>
            {/* Price with no qualifier — the reference shows the bare amount,
                no property type above it and no "for N nights" after it. */}
            <p className="pt-1 text-sm text-fg">
              <span className="font-medium">
                {formatPrice(item.price, "INR")}
              </span>
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
