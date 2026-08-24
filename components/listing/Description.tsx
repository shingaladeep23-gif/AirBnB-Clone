import { ChevronIcon } from "@/components/ui/icons";

/**
 * Description paragraph with a "Show more" affordance (BELOW-FOLD-SPEC §6).
 *
 * The affordance is hidden when there is no description — a Show-more button with
 * nothing behind it reads worse than no section at all.
 *
 * The copy is clamped rather than truncated in the data, so the full text stays
 * available to search and screen readers even while visually cut.
 */
export function Description({ description }: { description: string }) {
  if (!description) return null;

  return (
    <section className="py-8">
      {/*
        The reference sits this above the description because the host wrote the
        listing in another language and Airbnb machine-translated it. It is not
        decoration — it is the provenance of the paragraph underneath, so it
        stays with the paragraph rather than being dropped as chrome.

        "Show original" is inert here, as it is there: we hold one version of the
        text, and a toggle that shows the same words again would be a lie.
      */}
      <p className="pb-4 text-sm text-subtle">
        Some info has been automatically translated.{" "}
        <button
          type="button"
          className="font-medium text-fg underline transition-colors duration-fast hover:text-subtle"
        >
          Show original
        </button>
      </p>

      <p className="line-clamp-6 whitespace-pre-line text-base text-fg">
        {description}
      </p>
      <button
        type="button"
        className="mt-3 flex items-center gap-1 text-base font-medium text-fg underline"
      >
        Show more
        <span className="rotate-180">
          <ChevronIcon size={12} />
        </span>
      </button>
    </section>
  );
}
