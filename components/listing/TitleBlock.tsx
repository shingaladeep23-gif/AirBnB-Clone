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
    // Fixed 85px rather than padding: the header ends at y89 and the gallery
    // starts at the measured y174, so this row's height is exactly the gap.
    // Deriving it from padding + line-height left it 11px short.
    <div className="flex h-title-row-h items-center justify-between">
      <h1 className="text-2xl font-medium text-fg">{listing.title}</h1>

      <div className="flex items-center gap-1">
        <button
          type="button"
          className="flex h-control-h items-center gap-2 rounded-md px-2.5 transition-colors duration-fast hover:bg-surface-hover"
        >
          <ShareIcon size={14} />
          <span className="text-sm font-medium text-fg underline">Share</span>
        </button>
        <button
          type="button"
          className="flex h-control-h items-center gap-2 rounded-md px-2.5 transition-colors duration-fast hover:bg-surface-hover"
        >
          <HeartIcon size={14} />
          <span className="text-sm font-medium text-fg underline">Save</span>
        </button>
      </div>
    </div>
  );
}
