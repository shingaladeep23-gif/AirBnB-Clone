import type { Metadata, Viewport } from "next";
import { cereal } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  // Exact <title> from the reference.
  title:
    "Romantic Jacuzzi 1BHK Candolim | Mirashya UG10 - Serviced apartments for Rent in Candolim, Goa, India - Airbnb",
  description:
    "Entire serviced apartment in Candolim, India. 3 guests · 1 bedroom · 1 bed · 1 bathroom.",
};

/**
 * Desktop-only clone: the viewport is left at its natural width rather than
 * `width=device-width`, because responsive behaviour is explicitly out of scope
 * and a device-width viewport would invite half-done mobile layouts.
 */
export const viewport: Viewport = {
  width: 1280,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={cereal.variable}>
      <body>
        {/*
          Skip link. The reference makes this the FIRST node in <body>, parked
          offscreen at x-999 with a real 131x40 box (not display:none, which would
          take it out of the tab order). Matched deliberately — it's an a11y check,
          and the page is ~6259px long behind a sticky header.
        */}
        <a
          href="#main"
          className="absolute left-[-999px] top-0 z-50 flex h-10 w-[131px] items-center justify-center rounded-card bg-surface text-sm font-medium text-fg shadow-card focus:left-2 focus:top-2"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
