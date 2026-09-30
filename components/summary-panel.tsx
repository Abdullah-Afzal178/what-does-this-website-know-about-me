import { Building2, Globe2, MapPin, Monitor } from "lucide-react";

import { PoweredByBadge } from "@/components/powered-by-badge";
import type { VisitorData } from "@/lib/visitor";

const LINKS = [
  { href: "#location", label: "Where you are" },
  { href: "#provider", label: "Your provider" },
  { href: "#locale", label: "How a shop sees you" },
  { href: "#browser", label: "Your browser" },
  { href: "#headers", label: "What you send" },
  { href: "#signals", label: "What JavaScript reads" },
];

/** Sticky at-a-glance panel: the headline answer, always on screen. */
export function SummaryPanel({ visitor }: { visitor: VisitorData }) {
  const { location, network, client } = visitor;

  const place =
    location?.city && location.countryName
      ? `${location.city}, ${location.countryName}`
      : location?.countryName || "Unknown location";

  const rows = [
    {
      icon: MapPin,
      label: "Location",
      value: place,
    },
    {
      icon: Globe2,
      label: "IP address",
      value: location?.ip || "Not detected",
      mono: true,
    },
    {
      icon: Building2,
      label: "Provider",
      value: network?.organization || "Unknown",
    },
    {
      icon: Monitor,
      label: "Browser",
      value: client ? [client.name, client.version].filter(Boolean).join(" ") : "Unknown",
    },
  ];

  return (
    <div className="lg:sticky lg:top-6">
      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <PoweredByBadge className="mb-5" />

        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-sky-700">
          What this page knows
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
          {place}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Worked out the moment you opened this page. No cookie, no sign-in, no prompt.
        </p>

        <dl className="mt-6 space-y-3 border-t border-slate-200 pt-5">
          {rows.map((row) => {
            const Icon = row.icon;

            return (
              <div key={row.label}>
                <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.08em] text-slate-400">
                  <Icon className="h-3.5 w-3.5" />
                  {row.label}
                </dt>
                <dd
                  className={`mt-0.5 break-words text-sm font-semibold text-slate-950 ${
                    row.mono ? "font-mono" : ""
                  }`}
                >
                  {row.value}
                </dd>
              </div>
            );
          })}
        </dl>

        <nav className="mt-6 border-t border-slate-200 pt-5">
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-400">
            Jump to
          </p>
          <ul className="mt-2 space-y-1">
            {LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-sm text-slate-600 transition hover:text-sky-700"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </section>

      {visitor.note ? (
        <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
          {visitor.note}
        </p>
      ) : null}
    </div>
  );
}
