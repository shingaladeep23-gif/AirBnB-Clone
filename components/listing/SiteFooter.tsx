import { GlobeIcon } from "@/components/ui/icons";

/**
 * Global footer (BELOW-FOLD-SPEC §15). Full-bleed, grey, two tiers.
 *
 * Inner container inset 80px each side to match the header — the header inset is
 * measured (EXACT), and footers align to it.
 */

const COLUMNS = [
  {
    heading: "Support",
    links: [
      "Help Centre",
      "Get help with a safety issue",
      "AirCover",
      "Anti-discrimination",
      "Disability support",
      "Cancellation options",
      "Report neighbourhood concern",
    ],
  },
  {
    heading: "Hosting",
    links: [
      "Airbnb your home",
      "Airbnb your experience",
      "AirCover for Hosts",
      "Hosting resources",
      "Community forum",
      "Hosting responsibly",
      "Join a free Hosting class",
    ],
  },
  {
    heading: "Airbnb",
    links: [
      "Newsroom",
      "New features",
      "Careers",
      "Investors",
      "Airbnb.org emergency stays",
      "Gift cards",
      "Airbnb friendly apartments",
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-border-subtle bg-surface-sunken">
      <div className="mx-auto w-full px-header-inset py-12">
        <div className="grid grid-cols-3 gap-8 pb-10">
          {COLUMNS.map((column) => (
            <div key={column.heading}>
              <h3 className="text-sm font-semibold text-fg">{column.heading}</h3>
              <ul className="pt-4">
                {column.links.map((link) => (
                  <li key={link} className="pb-3">
                    <a
                      href="#"
                      className="text-sm text-subtle transition-colors duration-fast hover:text-fg hover:underline"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-border pt-6">
          <p className="text-sm text-subtle">
            © 2026 Airbnb, Inc. · Privacy · Terms · Sitemap
          </p>

          <div className="flex items-center gap-6">
            <button
              type="button"
              className="flex items-center gap-2 text-sm font-medium text-fg hover:underline"
            >
              <GlobeIcon size={14} />
              English (IN)
            </button>
            <button
              type="button"
              className="text-sm font-medium text-fg hover:underline"
            >
              ₹ INR
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
