import type { Listing } from "@/lib/types";
import { HeartIcon, ShareIcon } from "@/components/ui/icons";

/**
 * The h1 plus the Share / Save actions, sitting between the header and the hero
 * gallery.
 *
 * MEASURED: the header ends at y89 and the gallery starts at y174, so this row
 * is exactly 85px. The h1 and the Share/Save buttons BOTH start at y121 on the
 * reference — same top edge, despite being 30px and 35px tall — so the row is
 * top-aligned with a 32px inset (121 - 89), not centred. Centring put both 4-7px
 * high: the 30px h1 landed at y116.5 and the 35px buttons at y114.
 *
 * DO NOT "fix" the h1's WIDTH to match the capture. Ours renders 602.23 against
 * the capture's 585.55, and that 16.68px is not our bug — Airbnb Cereal VF never
 * loaded on the machine the reference was captured from, so every text-derived
 * width in `capture-listing.json` carries system-ui metrics. Measured proof:
 * this exact string in "Segoe UI" is 585.55, matching the capture to the
 * hundredth of a pixel, and so is the "More stays nearby" heading at a different
 * size. See DIFFERENCE-REGISTER.md, "Text-derived widths in the capture".
 */
export function TitleBlock({ listing }: { listing: Listing }) {
  return (
    // Fixed 85px rather than padding: the header ends at y89 and the gallery
    // starts at the measured y174, so this row's height is exactly the gap.
    // Deriving it from padding + line-height left it 11px short.
    <div className="flex h-title-row-h items-start justify-between pt-8">
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
