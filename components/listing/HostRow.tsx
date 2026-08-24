import Image from "next/image";
import type { Host } from "@/lib/types";

/**
 * Compact "Hosted by …" row (BELOW-FOLD-SPEC §4). No heading; dividers above and
 * below come from the parent's divide rules.
 *
 * The 48px avatar is `host.jpeg` (240x240 source, so 5x — it also serves the
 * 104px avatar in "Meet your host").
 */
export function HostRow({ host }: { host: Host }) {
  if (!host.name) return null;

  return (
    <div className="flex items-center gap-3 py-6">
      <Image
        src={host.avatar}
        alt=""
        width={48}
        height={48}
        className="size-12 rounded-pill object-cover"
      />
      <div>
        <p className="text-base font-medium text-fg">Hosted by {host.name}</p>
        <p className="pt-0.5 text-sm text-subtle">
          {host.isSuperhost ? "Superhost · " : ""}
          {host.hostingDuration}
        </p>
      </div>
    </div>
  );
}
