import type { Host } from "@/lib/types";

/**
 * "Meet your host" card plus host details (response rate/time).
 * STUB — T4. Renders nothing until host data is transcribed (blocked on T2), so
 * the page doesn't show an empty card with a blank avatar.
 */
export function HostSection({ host }: { host: Host }) {
  if (!host.name) return null;

  return (
    <section aria-label="Host" className="border-t border-border-subtle pt-12">
      <h2 className="text-xl font-semibold text-fg">Meet your host</h2>
      {/* T4: host card, superhost badge, stats, response info. */}
    </section>
  );
}
