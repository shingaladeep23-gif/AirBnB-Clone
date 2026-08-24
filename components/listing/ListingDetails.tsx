import type { Listing } from "@/lib/types";
import { formatCapacity } from "@/lib/listing";
import { GuestFavouriteCard } from "./GuestFavouriteCard";
import { HostRow } from "./HostRow";
import { Highlights } from "./Highlights";
import { Description } from "./Description";
import { WhereYouSleep } from "./WhereYouSleep";
import { Amenities } from "./Amenities";
import { Calendar } from "./Calendar";

/**
 * The LEFT COLUMN of the two-column body — BELOW-FOLD-SPEC sections 3 through 9.
 *
 * The sticky right stack ends after the calendar; everything from Reviews down
 * runs the full 1120px content column and is rendered by ListingPage, not here.
 * That transition is structural, not cosmetic — it's what makes the reviews grid
 * two-across.
 *
 * `divide-y` supplies the hairline between sections so no section has to know
 * whether it's first or last.
 */
export function ListingDetails({ listing }: { listing: Listing }) {
  return (
    <div className="flex flex-col divide-y divide-border-subtle">
      {/* §3 — Overview */}
      <section className="pb-6 pt-8">
        <h2 className="text-xl font-medium text-fg">{listing.propertyType}</h2>
        <p className="pt-1 text-base text-fg">
          {formatCapacity(listing.capacity)}
        </p>
        <div className="pt-6">
          <GuestFavouriteCard listing={listing} />
        </div>
      </section>

      {/* §4 */}
      <HostRow host={listing.host} />

      {/* §5 */}
      <Highlights highlights={listing.highlights} />

      {/* §6 */}
      <Description description={listing.description} />

      {/* §7 */}
      <WhereYouSleep arrangements={listing.sleepingArrangements} />

      {/* §8 — id="amenities" */}
      <Amenities amenities={listing.amenities} total={listing.amenitiesTotal} />

      {/* §9 — swing block; see the component's note */}
      <Calendar listing={listing} />
    </div>
  );
}
