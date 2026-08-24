import type { Amenity } from "@/lib/types";
import { LineIcon } from "@/components/ui/LineIcon";

/**
 * "What this place offers" — `id="amenities"` (BELOW-FOLD-SPEC §8).
 *
 * The id is load-bearing: the sticky section nav anchors to it, so the section
 * shell must exist even if the content list were empty.
 *
 * Unavailable amenities render struck through, matching Airbnb. The strike is
 * paired with visually-hidden text rather than relying on line-through alone —
 * a screen reader gets no signal from a CSS decoration.
 */
export function Amenities({
  amenities,
  total,
}: {
  amenities: Amenity[];
  /** What the button offers. The page lists 10; the full set is 50. */
  total: number;
}) {
  return (
    <section id="amenities" className="scroll-mt-nav-offset py-8">
      <h2 className="text-xl font-medium text-fg">What this place offers</h2>

      {amenities.length > 0 && (
        <>
          <ul className="grid grid-cols-2 gap-x-8 gap-y-4 pt-6">
            {amenities.map((amenity) => (
              <li key={amenity.id} className="flex items-center gap-4 py-1">
                <span
                  className={amenity.available ? "text-fg" : "text-fg-subtle"}
                >
                  <LineIcon name={amenity.icon} size={24} />
                </span>
                <span
                  className={
                    amenity.available
                      ? "text-base text-fg"
                      : "text-base text-subtle line-through"
                  }
                >
                  {amenity.label}
                </span>
                {!amenity.available && (
                  <span className="sr-only-text">(not available)</span>
                )}
              </li>
            ))}
          </ul>

          <button
            type="button"
            className="mt-8 h-button-lg-h rounded-card border border-border-strong px-5 text-base font-medium text-fg transition-colors duration-fast hover:bg-surface-hover"
          >
            Show all {total} amenities
          </button>
        </>
      )}
    </section>
  );
}
