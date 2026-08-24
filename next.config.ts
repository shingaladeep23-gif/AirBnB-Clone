import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  /*
    BUILD OUTPUT IS PER-WORKER, and that is not a preference — it is the fix for a
    real class of phantom failure.

    Several agents verify against this repo at once. They were all building into
    the same `.next`, so one agent's build would delete the directory out from
    under another agent's ALREADY-RUNNING server. The victim saw a 500 and an
    `ENOENT: app-paths-manifest.json`, which looks exactly like a routing bug in
    the code under test and is not. Two behavioural checks "failed" that way
    before the cause was found, and the second build simply refused to start with
    "Another next build process is already running".

    Setting NEXT_DIST_DIR gives each worker its own output tree, so builds and
    servers stop colliding. Unset, it is plain `.next` — CI, Vercel and a single
    developer are all unaffected.
  */
  distDir: process.env.NEXT_DIST_DIR || ".next",
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
