import type { Listing } from "@/lib/types";
import { formatCapacity } from "@/lib/listing";

/**
 * Left content column: property type + capacity line, guest-favourite rating
 * card, highlights, description, sleeping arrangements, amenities.
 * STUB — T4. Sections land here in reference order; splitting further is a T4 call.
 */
export function ListingDetails({ listing }: { listing: Listing }) {
  return (
    <div className="divide-y divide-border-subtle">
      <section className="pb-6">
        <h2 className="text-xl font-semibold text-fg">{listing.propertyType}</h2>
        <p className="pt-1 text-base text-fg">{formatCapacity(listing.capacity)}</p>
      </section>

      {/* T4: rating card, highlights, description, sleeping, amenities. */}
    </div>
  );
}
