import type { Listing } from "@/lib/types";
import { StarIcon } from "@/components/ui/icons";

/**
 * Reviews block.
 *
 * The id is load-bearing — the sticky section nav anchors to `#reviews`.
 *
 * PENDING: review bodies, authors and the per-category rating breakdown are not
 * captured yet (below the fold, unmeasured). The heading renders with the real
 * rating and count from the spec; the review cards render nothing rather than
 * inventing guests and quotes. Five reviewer avatars exist on disk
 * (`avatars/rev1–5.jpeg`) and will be wired when the copy arrives.
 */
export function ReviewsSection({ listing }: { listing: Listing }) {
  return (
    <section
      id="reviews"
      aria-label="Reviews"
      className="scroll-mt-nav-offset border-t border-border-subtle py-8"
    >
      <h2 className="flex items-center gap-2 text-xl font-semibold text-fg">
        <StarIcon size={16} />
        {listing.rating} · {listing.reviewCount} Reviews
      </h2>

      {listing.reviews.length > 0 && (
        <ul className="grid grid-cols-2 gap-x-16 gap-y-8 pt-8">
          {listing.reviews.map((review) => (
            <li key={review.id}>
              <p className="text-base text-fg">{review.body}</p>
              <p className="pt-2 text-sm text-subtle">
                {review.authorName} · {review.date}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
