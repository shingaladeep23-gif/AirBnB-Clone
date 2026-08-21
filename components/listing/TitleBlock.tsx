import type { Listing } from "@/lib/types";
import { HeartIcon, ShareIcon } from "@/components/ui/icons";

/**
 * The h1 plus the Share / Save actions, sitting between the header and the hero
 * gallery.
 *
 * APPROX: the gallery starts at y174 and the header ends at y89, so this row
 * occupies ~85px. Padding is set to land the 30px-tall h1 in the middle of that.
 */
export function TitleBlock({ listing }: { listing: Listing }) {
  return (
    <div className="flex items-center justify-between pb-3.5 pt-7">
      <h1 className="text-2xl font-semibold text-fg">{listing.title}</h1>

      <div className="flex items-center gap-1">
        <button
          type="button"
          className="flex h-8 items-center gap-2 rounded-md px-2.5 transition-colors duration-fast hover:bg-surface-hover"
        >
          <ShareIcon size={14} />
          <span className="text-sm font-medium text-fg underline">Share</span>
        </button>
        <button
          type="button"
          className="flex h-8 items-center gap-2 rounded-md px-2.5 transition-colors duration-fast hover:bg-surface-hover"
        >
          <HeartIcon size={14} />
          <span className="text-sm font-medium text-fg underline">Save</span>
        </button>
      </div>
    </div>
  );
}
