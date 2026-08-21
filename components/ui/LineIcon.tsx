/**
 * Line-icon registry for amenities, highlights and the rating breakdown.
 *
 * One component with a path map rather than 15 separate components: these are all
 * the same 24px stroked style, and a registry keeps the call sites declarative
 * (`<LineIcon name="wifi" />`) while making the whole set easy to audit.
 *
 * All paths are hand-authored simple geometry. Nothing is traced from the
 * reference's sprite sheet — see the no-lift-and-shift rule in CLAUDE.md.
 *
 * NOTE (BELOW-FOLD-SPEC §10b): the six rating categories use THESE line icons,
 * not the `chips/*.png` illustrations. The chips are the review-topic rail.
 */

const PATHS: Record<string, string> = {
  // Amenities
  "hot-tub": "M3 14h18v3a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5v-3zM7 14V6a2 2 0 0 1 4 0M17 9v5",
  wifi: "M2 8.5a16 16 0 0 1 20 0M5.5 12.5a11 11 0 0 1 13 0M9 16.5a6 6 0 0 1 6 0M12 20.5h.01",
  kitchen: "M6 3v8a2 2 0 0 0 4 0V3M8 11v10M15 3c-1.5 2-2 4-2 6a2 2 0 0 0 4 0c0-2-.5-4-2-6zM15 11v10",
  ac: "M3 5h18v9H3zM7 18h.01M12 18h.01M17 18h.01",
  parking: "M4 3h16v18H4zM9 17V8h3.5a3 3 0 0 1 0 6H9",
  tv: "M3 4h18v12H3zM8 20h8",
  washer: "M4 3h16v18H4zM12 8a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9zM8 6h.01",
  balcony: "M3 12h18M5 12v9M19 12v9M9 12v9M15 12v9M6 12V7a6 6 0 0 1 12 0v5",
  desk: "M3 8h18M4 8v12M20 8v12M8 8V4h8v4M8 13h8",
  pool: "M2 18c2 0 2-1.5 4-1.5s2 1.5 4 1.5 2-1.5 4-1.5 2 1.5 4 1.5M6 14V5a2 2 0 0 1 4 0M14 14V5a2 2 0 0 1 4 0M6 9h4M14 9h4",
  bed: "M3 18v-7h18v7M3 18v2M21 18v2M6 11V8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3",
  door: "M6 3h12v18H6zM14 12h.01",
  calendar: "M3 6h18v15H3zM3 10h18M8 3v4M16 3v4",

  // Rating-breakdown categories
  cleanliness: "M4 8h16l-1.5 12h-13zM9 8V5a3 3 0 0 1 6 0v3M10 12v4M14 12v4",
  accuracy: "M12 3l2.5 6H21l-5 4 2 7-6-4-6 4 2-7-5-4h6.5z",
  checkIn: "M15 3h4v18h-4M11 8l4 4-4 4M15 12H3",
  communication: "M4 4h16v12H8l-4 4z",
  location: "M12 22s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11zM12 8.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z",
  value: "M12 2v20M17 6.5c0-2-2.2-3-5-3s-5 1-5 3 2.2 2.8 5 3.5 5 1.5 5 3.5-2.2 3-5 3-5-1-5-3",
};

export function LineIcon({
  name,
  size = 24,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const d = PATHS[name];
  // An unknown icon name renders nothing rather than a broken glyph — a missing
  // icon should never break a row's layout.
  if (!d) return null;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d={d} />
    </svg>
  );
}
