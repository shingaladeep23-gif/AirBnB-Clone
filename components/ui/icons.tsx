/**
 * Icon set.
 *
 * All paths are hand-authored from simple geometry (circles, lines, arcs) rather
 * than lifted from the reference's sprite sheet — see the no-lift-and-shift rule
 * in CLAUDE.md.
 *
 * Every icon takes its colour from `currentColor` and its size from the `size`
 * prop, so callers control both via tokens. Icons are decorative by default
 * (`aria-hidden`); the accessible name belongs on the button that wraps them.
 */

interface IconProps {
  size?: number;
  className?: string;
  strokeWidth?: number;
}

function svgProps(size: number, className?: string) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 32 32",
    "aria-hidden": true as const,
    focusable: "false" as const,
    className,
  };
}

/** Magnifier — circle plus a 45° handle. */
export function SearchIcon({ size = 16, className, strokeWidth = 4 }: IconProps) {
  return (
    <svg {...svgProps(size, className)} fill="none" stroke="currentColor">
      <circle cx="13" cy="13" r="9" strokeWidth={strokeWidth} />
      <line
        x1="20"
        y1="20"
        x2="29"
        y2="29"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Globe — outer circle, equator, and two meridian arcs. */
export function GlobeIcon({ size = 16, className, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...svgProps(size, className)} fill="none" stroke="currentColor">
      <circle cx="16" cy="16" r="14" strokeWidth={strokeWidth} />
      <line x1="2" y1="16" x2="30" y2="16" strokeWidth={strokeWidth} />
      <ellipse cx="16" cy="16" rx="7" ry="14" strokeWidth={strokeWidth} />
    </svg>
  );
}

/** Hamburger — three rules. */
export function MenuIcon({ size = 16, className, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...svgProps(size, className)} fill="none" stroke="currentColor">
      <line x1="3" y1="8" x2="29" y2="8" strokeWidth={strokeWidth} />
      <line x1="3" y1="16" x2="29" y2="16" strokeWidth={strokeWidth} />
      <line x1="3" y1="24" x2="29" y2="24" strokeWidth={strokeWidth} />
    </svg>
  );
}

/** Share — box with an arrow rising out of it. */
export function ShareIcon({ size = 16, className, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...svgProps(size, className)} fill="none" stroke="currentColor">
      <path
        d="M8 14H5v14h22V14h-3"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="16"
        y1="20"
        x2="16"
        y2="4"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <path
        d="M10 10l6-6 6 6"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Heart — two arcs meeting at a point. */
export function HeartIcon({
  size = 16,
  className,
  strokeWidth = 2,
  filled = false,
}: IconProps & { filled?: boolean }) {
  return (
    <svg
      {...svgProps(size, className)}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
    >
      <path
        d="M16 28C16 28 3 20 3 11.5A7.5 7.5 0 0 1 16 7a7.5 7.5 0 0 1 13 4.5C29 20 16 28 16 28z"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Five-pointed star, filled by default (ratings). */
export function StarIcon({ size = 12, className }: IconProps) {
  return (
    <svg {...svgProps(size, className)} fill="currentColor">
      <path d="M16 2l4.2 9.1 9.8 1.2-7.2 6.7 1.9 9.8L16 24l-8.7 4.8 1.9-9.8L2 12.3l9.8-1.2z" />
    </svg>
  );
}

/** 3x3 dot grid — the "Show all photos" affordance. */
export function GridIcon({ size = 14, className }: IconProps) {
  const dots = [6, 16, 26];
  return (
    <svg {...svgProps(size, className)} fill="currentColor">
      {dots.map((cy) =>
        dots.map((cx) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3.4" />),
      )}
    </svg>
  );
}

/** Chevron, rotated by the caller for direction. */
export function ChevronIcon({ size = 16, className, strokeWidth = 3 }: IconProps) {
  return (
    <svg {...svgProps(size, className)} fill="none" stroke="currentColor">
      <path
        d="M20 4L9 16l11 12"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Plus — the guest stepper's increment. */
export function PlusIcon({ size = 16, className, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...svgProps(size, className)} fill="none" stroke="currentColor">
      <path d="M16 6v20M6 16h20" strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}

/** Minus — the guest stepper's decrement. */
export function MinusIcon({ size = 16, className, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...svgProps(size, className)} fill="none" stroke="currentColor">
      <path d="M6 16h20" strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}

/** Tick in a circle — the reservation confirmation. */
export function CheckCircleIcon({ size = 32, className, strokeWidth = 2.5 }: IconProps) {
  return (
    <svg {...svgProps(size, className)} fill="none" stroke="currentColor">
      <circle cx="16" cy="16" r="13" strokeWidth={strokeWidth} />
      <path
        d="M10 16.5l4 4 8-8.5"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * The Airbnb wordmark lockup.
 *
 * Drawn as an original rounded "bélo"-style glyph plus the wordmark set in the
 * page font — NOT the reference's own SVG path data.
 */
export function LogoMark({ size = 32, className }: IconProps) {
  return (
    <svg {...svgProps(size, className)} fill="currentColor">
      <path d="M16 3c-1.6 0-2.8 1-3.7 2.7C9.7 10.4 4 21 4 24.6 4 27.6 6.2 29.6 9 29.6c2.5 0 4.8-1.4 7-4.1 2.2 2.7 4.5 4.1 7 4.1 2.8 0 5-2 5-5 0-3.6-5.7-14.2-8.3-18.9C18.8 4 17.6 3 16 3zm0 3.2c.5 0 .9.4 1.4 1.3 2.6 4.7 7.6 14.3 7.6 17.1 0 1.3-.8 2-2 2-1.6 0-3.4-1.3-5.2-3.7 1.6-2.2 2.7-4.2 2.7-6.1 0-2.7-1.9-4.6-4.5-4.6s-4.5 1.9-4.5 4.6c0 1.9 1.1 3.9 2.7 6.1-1.8 2.4-3.6 3.7-5.2 3.7-1.2 0-2-.7-2-2 0-2.8 5-12.4 7.6-17.1.5-.9.9-1.3 1.4-1.3zm0 9.1c1 0 1.6.7 1.6 1.8 0 1-.6 2.3-1.6 3.8-1-1.5-1.6-2.8-1.6-3.8 0-1.1.6-1.8 1.6-1.8z" />
    </svg>
  );
}
