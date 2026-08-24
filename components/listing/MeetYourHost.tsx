import Image from "next/image";
import type { CoHost, Host } from "@/lib/types";
import { Avatar } from "@/components/ui/Avatar";

/**
 * "Meet your host" (BELOW-FOLD-SPEC §12). Two columns: a raised host card on the
 * left, host details + co-hosts on the right.
 *
 * Eight co-hosts, of which two have no photo and render as letter tiles — see
 * `Avatar`. Several of the photo sources are portrait, not square, which is why
 * that component insists on object-cover.
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
      <h2 className="text-xl font-medium text-fg">Meet your host</h2>

      <div className="flex gap-16 pt-8">
        {/* Host card */}
        <div className="w-card-w shrink-0">
          <div className="flex flex-col items-center rounded-card px-8 py-10 shadow-card">
            <Image
              src={host.avatar}
              alt=""
              width={104}
              height={104}
              className="size-26 rounded-pill object-cover"
            />
            <p className="pt-4 text-2xl font-medium text-fg">{host.name}</p>
            <p className="pt-1 text-sm font-medium text-fg">
              {host.isSuperhost ? "Superhost" : "Host"}
            </p>

            <dl className="flex w-full items-stretch pt-8">
              {/* 1463 renders as "1,463" — grouped, the way the reference shows it. */}
              <Stat label="Reviews" value={host.reviewCount.toLocaleString("en-IN")} />
              <Stat label="Rating" value={`${host.rating}★`} bordered />
              <Stat label="Years hosting" value={host.hostingDuration.split(" ")[0] ?? ""} />
            </dl>
          </div>

          {/* What the host wrote about themselves, in the order they wrote it. */}
          {host.facts.length > 0 && (
            <ul className="pt-6">
              {host.facts.map((fact) => (
                <li key={fact} className="pb-2 text-base text-fg">
                  {fact}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Host details + co-hosts */}
        <div className="flex-1">
          <h3 className="text-lg font-medium text-fg">Host details</h3>
          <p className="pt-3 text-base text-fg">
            Response rate: {host.responseRate}
          </p>
          <p className="pt-1 text-base text-fg">
            Responds {host.responseTime}
          </p>

          {coHosts.length > 0 && (
            <div className="pt-8">
              <h3 className="text-lg font-medium text-fg">Co-Hosts</h3>
              <ul className="flex flex-wrap gap-6 pt-4">
                {coHosts.map((coHost) => (
                  <li key={coHost.id} className="flex items-center gap-2">
                    <Avatar
                      src={coHost.avatar}
                      name={coHost.name}
                      size={40}
                      className="size-10"
                      letterClassName="text-sm"
                    />
                    <span className="text-sm text-fg">{coHost.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            type="button"
            className="mt-8 h-12 rounded-md bg-fg px-6 text-base font-medium text-fg-inverse transition-opacity duration-fast hover:opacity-90"
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
      <dd className="pt-0.5 text-base font-medium text-fg">{value}</dd>
    </div>
  );
}
