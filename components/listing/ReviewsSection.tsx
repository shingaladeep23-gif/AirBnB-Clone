import type { Listing } from "@/lib/types";

/**
 * Reviews block: the big rating header, six category bars, then the review grid.
 * STUB — T4.
 */
export function ReviewsSection({ listing }: { listing: Listing }) {
  return (
    <section
      aria-label="Reviews"
      className="border-t border-border-subtle pt-12"
    >
      <h2 className="text-xl font-semibold text-fg">
        {listing.rating} · {listing.reviewCount} reviews
      </h2>
      {/* T4: category rating bars + review cards. */}
    </section>
  );
}
