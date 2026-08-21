import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Listing photography is served from /public/assets/images as static files, so the
  // built-in optimiser is left on its defaults. Reference parity depends on the images
  // keeping their intrinsic aspect ratios — never let a loader crop them.
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
