"use client";

/**
 * Root error boundary.
 *
 * Next renders this in place of the whole document when an error escapes the root
 * layout, so it must supply its own <html>/<body>.
 *
 * Deliberately plain: the reference has no error state to clone, and this should
 * never be seen in a working build.
 */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <main style={{ padding: "48px", fontFamily: "sans-serif" }}>
          <h1 style={{ fontSize: "26px", fontWeight: 600 }}>
            Something went wrong
          </h1>
          <button type="button" onClick={reset} style={{ marginTop: "16px" }}>
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
