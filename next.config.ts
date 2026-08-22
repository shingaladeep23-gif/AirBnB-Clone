import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Listing photography is served from /public/assets/images as static files, so the
  // built-in optimiser is left on its defaults. Reference parity depends on the images
  // keeping their intrinsic aspect ratios — never let a loader crop them.
  images: {
    formats: ["image/avif", "image/webp"],
  },
  /*
    better-sqlite3 is a NATIVE module — a compiled .node binary that the bundler
    cannot trace, rewrite or inline. Left to itself the build either fails to
    resolve the binding or emits a bundle that loads the wrong path at runtime.
    Marking it external tells Next to require it from node_modules at runtime, the
    way Node would.
  */
  serverExternalPackages: ["better-sqlite3", "@prisma/adapter-better-sqlite3"],
};

export default nextConfig;
