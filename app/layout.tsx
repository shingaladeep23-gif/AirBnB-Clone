import type { Metadata, Viewport } from "next";
import { cereal } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Romantic Jacuzzi 1BHK Candolim | Mirashya UG10 - Airbnb",
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
        {/* Skip link — the listing page is long (~6250px) and the header is
            sticky, so keyboard users need a way past the nav. */}
        <a
          href="#main"
          className="sr-only-text focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-card focus:bg-surface focus:px-4 focus:py-2 focus:shadow-card"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
