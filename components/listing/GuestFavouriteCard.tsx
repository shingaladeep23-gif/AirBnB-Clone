import Image from "next/image";
import type { Listing } from "@/lib/types";
import { StarIcon } from "@/components/ui/icons";

/**
 * The "Guest favourite" card: laurel wreaths flanking the badge, with the rating
 * and review count below.
 *
 * The laurels are real reference assets (`laurel-left.png` / `laurel-right.png`),
 * so they are rendered as images rather than redrawn.
 *
 * APPROX: this card's exact box was not measured — the spec only lists its
 * contents and position in the left column. Spacing here is judgement and is
 * expected to be corrected by pixel diff.
 */
export function GuestFavouriteCard({ listing }: { listing: Listing }) {
  if (!listing.isGuestFavourite) return null;

  return (
    <section
      aria-label="Guest favourite"
      className="flex items-center justify-between rounded-card border border-border-subtle px-6 py-5"
    >
      <div className="flex items-center gap-2">
        <Image
          src="/assets/images/ui/laurel-left.png"
          alt=""
          width={26}
          height={44}
          className="h-11 w-auto"
        />
        <div className="text-center">
          <p className="text-md font-medium leading-tight text-fg">
            Guest favourite
          </p>
          <p className="max-w-[220px] pt-0.5 text-xs text-fg">
            {listing.guestFavouriteCopy}
          </p>
        </div>
        <Image
          src="/assets/images/ui/laurel-right.png"
          alt=""
          width={26}
          height={44}
          className="h-11 w-auto"
        />
      </div>

      <div className="flex items-center gap-8 pr-2">
        <div className="text-center">
          <p className="text-stat font-bold text-fg">{listing.rating}</p>
          <div
            className="flex items-center justify-center gap-0.5 pt-1 text-fg"
            aria-hidden="true"
          >
            {Array.from({ length: 5 }, (_, i) => (
              <StarIcon key={i} size={10} />
            ))}
          </div>
        </div>

        <div className="text-center">
          <p className="text-stat font-bold text-fg">{listing.reviewCount}</p>
          <p className="pt-1 text-meta font-medium text-fg underline">Reviews</p>
        </div>
      </div>
    </section>
  );
}
