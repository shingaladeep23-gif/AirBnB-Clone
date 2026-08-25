import type { ListingHighlight } from "@/lib/types";
import { LineIcon } from "@/components/ui/LineIcon";

/**
 * Three icon + title + subtitle rows (BELOW-FOLD-SPEC §5).
 * Renders nothing when the array is empty, so the section can't leave an
 * orphaned divider behind.
 */
export function Highlights({ highlights }: { highlights: ListingHighlight[] }) {
  if (highlights.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 py-6">
      {highlights.map((highlight) => (
        <div key={highlight.id} className="flex items-start gap-4">
          <span className="shrink-0 pt-0.5 text-fg">
            <LineIcon name={highlight.icon} size={24} />
          </span>
          <div>
            <p className="text-sm font-medium text-fg">{highlight.title}</p>
            <p className="pt-0.5 text-sm text-subtle">{highlight.subtitle}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
