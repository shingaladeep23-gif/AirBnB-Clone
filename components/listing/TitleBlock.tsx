import type { Listing } from "@/lib/types";

/**
 * The h1 plus the share/save actions that sit above the hero gallery.
 * STUB — T4.
 */
export function TitleBlock({ listing }: { listing: Listing }) {
  return (
    <div className="flex items-end justify-between pt-6 pb-3">
      <h1 className="text-2xl font-semibold text-fg">{listing.title}</h1>
      {/* T4: Share / Save actions. */}
    </div>
  );
}
