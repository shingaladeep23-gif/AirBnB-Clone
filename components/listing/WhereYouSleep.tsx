import type { SleepingArrangement } from "@/lib/types";
import { LineIcon } from "@/components/ui/LineIcon";

/**
 * "Where you'll sleep" (BELOW-FOLD-SPEC §7). This listing has 1 bedroom / 1 bed,
 * so it renders a single card.
 *
 * DELIBERATELY NO PHOTO: the spec allows reusing a gallery photo positionally,
 * but per-photo room grouping has not been captured — and labelling an arbitrary
 * photo "Bedroom" when nobody has verified what it shows is exactly the kind of
 * plausible-but-wrong detail that reads badly in review. The card renders with a
 * line icon until real room grouping exists.
 */
export function WhereYouSleep({
  arrangements,
}: {
  arrangements: SleepingArrangement[];
}) {
  if (arrangements.length === 0) return null;

  return (
    <section className="py-8">
      <h2 className="text-xl font-semibold text-fg">Where you&rsquo;ll sleep</h2>

      <div className="flex gap-4 pt-6">
        {arrangements.map((arrangement) => (
          <div
            key={arrangement.id}
            className="w-card-w rounded-card border border-border-subtle p-4"
          >
            <span className="text-fg">
              <LineIcon name={arrangement.icon} size={24} />
            </span>
            <p className="pt-3 text-base font-medium text-fg">
              {arrangement.room}
            </p>
            <p className="pt-0.5 text-sm text-subtle">
              {arrangement.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
