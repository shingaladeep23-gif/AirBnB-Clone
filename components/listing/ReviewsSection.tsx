import Image from "next/image";
import type { Listing } from "@/lib/types";
import { StarIcon } from "@/components/ui/icons";
import { LineIcon } from "@/components/ui/LineIcon";

/**
 * Reviews — `id="reviews"` (BELOW-FOLD-SPEC §10). Runs the FULL 1120px content
 * column, not the left column: that is what makes the review grid two-across.
 *
 * Four stacked blocks: guest-favourite hero, rating breakdown, topic chips,
 * review cards, then the "Show all N reviews" button.
 */

const CATEGORIES = [
  { key: "cleanliness", label: "Cleanliness", icon: "cleanliness" },
  { key: "accuracy", label: "Accuracy", icon: "accuracy" },
  { key: "checkIn", label: "Check-in", icon: "checkIn" },
  { key: "communication", label: "Communication", icon: "communication" },
  { key: "location", label: "Location", icon: "location" },
  { key: "value", label: "Value", icon: "value" },
] as const;

export function ReviewsSection({ listing }: { listing: Listing }) {
  return (
    <section id="reviews" className="scroll-mt-nav-offset py-12">
      {/* 10a — Guest-favourite hero. The laurels are reference assets, used here
          at full size (their 240x365 source) flanking the rating numeral. */}
      {listing.isGuestFavourite && (
        <div className="flex flex-col items-center pb-12">
          <div className="flex items-center gap-4">
            <Image
              src="/assets/images/ui/laurel-left.png"
              alt=""
              width={99}
              height={150}
              className="h-[150px] w-auto"
            />
            <span className="text-hero font-semibold text-fg">
              {listing.rating}
            </span>
            <Image
              src="/assets/images/ui/laurel-right.png"
              alt=""
              width={99}
              height={150}
              className="h-[150px] w-auto"
            />
          </div>
          <h2 className="pt-4 text-2xl font-semibold text-fg">Guest favourite</h2>
          <p className="max-w-[420px] pt-2 text-center text-base text-subtle">
            One of the most loved homes on Airbnb based on ratings, reviews and
            reliability
          </p>
        </div>
      )}

      {/* 10b — Rating breakdown. Line icons, NOT the chips/ illustrations. */}
      <div className="flex items-stretch border-y border-border-subtle py-6">
        <div className="w-[220px] pr-8">
          <p className="text-sm font-medium text-fg">Overall rating</p>
          <div className="pt-2">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center gap-2">
                <span className="w-2 text-2xs text-subtle">{star}</span>
                <span className="h-1 flex-1 overflow-hidden rounded-pill bg-border-subtle">
                  <span
                    className="block h-full rounded-pill bg-fg"
                    style={{ width: star === 5 ? "95%" : star === 4 ? "5%" : "0%" }}
                  />
                </span>
              </div>
            ))}
          </div>
        </div>

        {CATEGORIES.map((category) => (
          <div
            key={category.key}
            className="flex flex-1 flex-col justify-between border-l border-border-subtle px-6"
          >
            <p className="text-sm text-fg">{category.label}</p>
            <p className="pt-2 text-lg font-semibold text-fg">
              {listing.ratingBreakdown[category.key].toFixed(1)}
            </p>
            <span className="pt-2 text-fg">
              <LineIcon name={category.icon} size={28} />
            </span>
          </div>
        ))}
      </div>

      {/* 10c — Review topic chips: exactly 10, horizontally scrollable. */}
      {listing.reviewTopics.length > 0 && (
        <div className="overflow-x-auto py-8">
          <ul className="flex gap-4">
            {listing.reviewTopics.map((topic) => (
              <li
                key={topic.id}
                className="flex w-[220px] shrink-0 flex-col rounded-card border border-border-subtle p-4"
              >
                <Image
                  src={topic.icon}
                  alt=""
                  width={56}
                  height={56}
                  className="size-14"
                />
                <p className="pt-3 text-base font-semibold text-fg">
                  {topic.label}
                </p>
                <p className="pt-1 text-sm text-subtle">{topic.quote}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 10d — Review cards: exactly 5 (rev1-5.jpeg), two-across so 2+2+1. */}
      {listing.reviews.length > 0 && (
        <ul className="grid grid-cols-2 gap-x-16 gap-y-10 pt-4">
          {listing.reviews.map((review) => (
            <li key={review.id}>
              <div className="flex items-center gap-3">
                <Image
                  src={review.authorAvatar}
                  alt=""
                  width={48}
                  height={48}
                  className="size-12 rounded-pill object-cover"
                />
                <div>
                  <p className="text-base font-semibold text-fg">
                    {review.authorName}
                  </p>
                  <p className="text-sm text-subtle">{review.authorTenure}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 text-fg">
                <span className="flex gap-0.5" aria-hidden="true">
                  {Array.from({ length: review.rating }, (_, i) => (
                    <StarIcon key={i} size={10} />
                  ))}
                </span>
                <span className="sr-only-text">
                  {review.rating} out of 5 stars
                </span>
                <span className="text-xs text-subtle">· {review.date}</span>
              </div>

              <p className="line-clamp-4 pt-2 text-base text-fg">{review.body}</p>
            </li>
          ))}
        </ul>
      )}

      {/* 10e */}
      <button
        type="button"
        className="mt-10 h-12 rounded-md border border-border-strong px-5 text-base font-semibold text-fg transition-colors duration-fast hover:bg-surface-hover"
      >
        Show all {listing.reviewCount} reviews
      </button>
    </section>
  );
}
