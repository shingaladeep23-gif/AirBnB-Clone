import type { Listing } from "@/lib/types";
import { formatCapacity } from "@/lib/listing";
import { GuestFavouriteCard } from "./GuestFavouriteCard";

/**
 * Left content column.
 *
 * Order follows the reference spec's document-order list: property type +
 * capacity, then the Guest-favourite card, then the below-fold sections.
 *
 * The `amenities` and `location` section ids are load-bearing — the sticky
 * section nav anchors to them.
 *
 * BELOW THE FOLD IS NOT MEASURED. The reference document is 6259px tall and only
 * the top ~700px has been captured, so the sections below render their headings
 * and structure but not invented content. Where the spec gives no copy, the
 * section renders empty rather than fabricating amenities or descriptions.
 */
export function ListingDetails({ listing }: { listing: Listing }) {
  return (
    <div className="flex flex-col">
      <section className="border-b border-border-subtle pb-6 pt-8">
        <h2 className="text-xl font-semibold text-fg">{listing.propertyType}</h2>
        <p className="pt-1 text-base text-fg">
          {formatCapacity(listing.capacity)}
        </p>
      </section>

      <div className="py-6">
        <GuestFavouriteCard listing={listing} />
      </div>

      {/* PENDING: "About this place" copy is not captured yet. */}
      {listing.description && (
        <section className="border-t border-border-subtle py-8">
          <h2 className="text-xl font-semibold text-fg">About this place</h2>
          <p className="whitespace-pre-line pt-4 text-base text-fg">
            {listing.description}
          </p>
        </section>
      )}

      <section
        id="amenities"
        className="scroll-mt-nav-offset border-t border-border-subtle py-8"
      >
        <h2 className="text-xl font-semibold text-fg">
          What this place offers
        </h2>
        {/* PENDING: the amenity list is not captured. Rendering the heading keeps
            the sticky-nav anchor valid without inventing amenities. */}
        {listing.amenities.length > 0 && (
          <ul className="grid grid-cols-2 gap-4 pt-6">
            {listing.amenities.map((amenity) => (
              <li
                key={amenity.id}
                className={
                  amenity.available
                    ? "text-base text-fg"
                    : "text-base text-subtle line-through"
                }
              >
                {amenity.label}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section
        id="location"
        className="scroll-mt-nav-offset border-t border-border-subtle py-8"
      >
        <h2 className="text-xl font-semibold text-fg">Where you&rsquo;ll be</h2>
        <p className="pt-2 text-base text-fg">{listing.location}</p>
      </section>
    </div>
  );
}
