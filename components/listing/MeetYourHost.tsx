import Image from "next/image";
import type { CoHost, Host } from "@/lib/types";

/**
 * "Meet your host" (BELOW-FOLD-SPEC §12). Two columns: a raised host card on the
 * left, host details + co-hosts on the right.
 *
 * The three co-host avatars are why this section is evidence-backed — nothing else
 * on an Airbnb page consumes exactly three small avatars.
 *
 * IMPORTANT: co1 (120x160) and co3 (120x197) are NOT square. They must be
 * object-cover inside the circle or heads crop badly.
 */
export function MeetYourHost({
  host,
  coHosts,
}: {
  host: Host;
  coHosts: CoHost[];
}) {
  if (!host.name) return null;

  return (
    <section className="border-t border-border-subtle py-12">
      <h2 className="text-xl font-semibold text-fg">Meet your host</h2>

      <div className="flex gap-16 pt-8">
        {/* Host card */}
        <div className="w-card-w shrink-0">
          <div className="flex flex-col items-center rounded-2xl px-8 py-10 shadow-card">
            <Image
              src={host.avatar}
              alt=""
              width={104}
              height={104}
              className="size-26 rounded-pill object-cover"
            />
            <p className="pt-4 text-3xl font-semibold text-fg">{host.name}</p>
            {host.isSuperhost && (
              <p className="pt-1 text-sm font-medium text-fg">Superhost</p>
            )}

            <dl className="flex w-full items-stretch pt-8">
              <Stat label="Reviews" value={String(host.reviewCount)} />
              <Stat label="Rating" value={`${host.rating}★`} bordered />
              <Stat label="Years hosting" value={host.hostingDuration.split(" ")[0] ?? ""} />
            </dl>
          </div>
        </div>

        {/* Host details + co-hosts */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-fg">Host details</h3>
          <p className="pt-3 text-base text-fg">
            Response rate: {host.responseRate}
          </p>
          <p className="pt-1 text-base text-fg">
            Responds {host.responseTime}
          </p>

          {coHosts.length > 0 && (
            <div className="pt-8">
              <h3 className="text-lg font-semibold text-fg">Co-hosts</h3>
              <ul className="flex flex-wrap gap-6 pt-4">
                {coHosts.map((coHost) => (
                  <li key={coHost.id} className="flex items-center gap-2">
                    <Image
                      src={coHost.avatar}
                      alt=""
                      width={40}
                      height={40}
                      // object-cover is load-bearing: co1/co3 are portrait, not square.
                      className="size-10 rounded-pill object-cover"
                    />
                    <span className="text-sm text-fg">{coHost.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            type="button"
            className="mt-8 h-12 rounded-md bg-fg px-6 text-base font-semibold text-fg-inverse transition-opacity duration-fast hover:opacity-90"
          >
            Message host
          </button>
        </div>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  bordered = false,
}: {
  label: string;
  value: string;
  bordered?: boolean;
}) {
  return (
    <div
      className={`flex-1 px-3 text-center ${
        bordered ? "border-x border-border-subtle" : ""
      }`}
    >
      <dt className="text-xs text-subtle">{label}</dt>
      <dd className="pt-0.5 text-base font-semibold text-fg">{value}</dd>
    </div>
  );
}
