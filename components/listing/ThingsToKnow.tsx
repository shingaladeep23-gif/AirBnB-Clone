import type { ThingsToKnowGroup } from "@/lib/types";
import { ChevronIcon } from "@/components/ui/icons";

/**
 * "Things to know" — three equal columns across the full content column
 * (BELOW-FOLD-SPEC §13).
 */
export function ThingsToKnow({ groups }: { groups: ThingsToKnowGroup[] }) {
  if (groups.length === 0) return null;

  return (
    <section className="border-t border-border-subtle py-12">
      <h2 className="text-xl font-medium text-fg">Things to know</h2>

      <div className="grid grid-cols-3 gap-8 pt-6">
        {groups.map((group) => (
          <div key={group.id}>
            <h3 className="text-base font-medium text-fg">{group.heading}</h3>
            <ul className="pt-4">
              {group.items.map((item) => (
                <li key={item} className="pb-2 text-sm text-fg">
                  {item}
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="mt-2 flex items-center gap-1 text-sm font-medium text-fg underline"
            >
              Learn more
              <span className="rotate-180">
                <ChevronIcon size={10} />
              </span>
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
