import {
  Braces,
  Building2,
  Code2,
  MapPin,
  Monitor,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { Suspense } from "react";

import { ClientSignals } from "@/components/client-signals";
import { DetailSection } from "@/components/detail-section";
import { FactList, type Fact } from "@/components/fact-list";
import { SummaryPanel } from "@/components/summary-panel";
import { getVisitor } from "@/lib/visitor";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <Suspense fallback={<Loading />}>
      <Reveal />
    </Suspense>
  );
}

function Loading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <div className="h-96 animate-pulse rounded-[32px] border border-slate-200 bg-white" />
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-56 animate-pulse rounded-[32px] border border-slate-200 bg-white"
            />
          ))}
        </div>
      </div>
    </main>
  );
}

async function Reveal() {
  const visitor = await getVisitor();
  const { location, network, locale, client } = visitor;

  const locationFacts: Fact[] = location
    ? [
        { label: "IP address", value: location.ip },
        { label: "City", value: [location.city, location.district].filter(Boolean).join(" · ") },
        { label: "Region", value: location.stateProv },
        { label: "Postal area", value: location.zipcode, hint: "narrowed from your IP alone" },
        {
          label: "Country",
          value: [location.countryEmoji, location.countryName].filter(Boolean).join(" "),
        },
        {
          label: "Coordinates",
          value:
            location.latitude && location.longitude
              ? `${location.latitude}, ${location.longitude}`
              : "",
          hint: "approximate, but usually the right neighbourhood",
        },
        { label: "Continent", value: location.continentName },
        { label: "In the EU", value: location.isEu ? "Yes" : "No" },
      ]
    : [];

  const networkFacts: Fact[] = network
    ? [
        { label: "Internet provider", value: network.organization },
        { label: "Provider type", value: titleCase(network.companyType) },
        { label: "Network (ASN)", value: network.asNumber },
        { label: "IP block", value: network.route },
        { label: "Connection type", value: titleCase(network.connectionType) },
      ]
    : [];

  const localeFacts: Fact[] = locale
    ? [
        {
          label: "Currency",
          value: [locale.currencySymbol, locale.currencyCode, locale.currencyName]
            .filter(Boolean)
            .join(" · "),
          hint: "what a shop would charge you in",
        },
        { label: "Phone country code", value: locale.callingCode },
        { label: "Local time", value: locale.localTime },
        { label: "Time zone", value: locale.timeZone },
        { label: "Languages", value: locale.languages.join(", ") },
        { label: "Country domain", value: locale.tld },
      ]
    : [];

  const clientFacts: Fact[] = client
    ? [
        { label: "Browser", value: [client.name, client.version].filter(Boolean).join(" ") },
        { label: "Rendering engine", value: client.engineName },
        {
          label: "Operating system",
          value: [client.osName, client.osVersion].filter(Boolean).join(" "),
        },
        { label: "Device", value: describeDevice(client) },
        { label: "Device type", value: titleCase(client.deviceType) },
        { label: "Client type", value: titleCase(client.type) },
      ]
    : [];

  const headerFacts: Fact[] = [
    { label: "Accept-Language", value: visitor.acceptLanguage },
    {
      label: "Do Not Track",
      value: visitor.doNotTrack === "1" ? "On" : visitor.doNotTrack === "0" ? "Off" : "Not sent",
      hint: "sites are free to ignore it, and nearly all do",
    },
    {
      label: "Referring page",
      value: visitor.referer || "Not sent",
      hint: visitor.referer ? "the page that linked you here" : undefined,
    },
    { label: "Raw User-Agent", value: visitor.rawUserAgent },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <aside>
          <SummaryPanel visitor={visitor} />
        </aside>

        <div className="space-y-6">
          <DetailSection
            id="location"
            eyebrow="Where you are"
            title="Your location, from your IP alone"
            lead="Worked out before you clicked anything, with no permission prompt."
            icon={MapPin}
          >
            <FactList facts={locationFacts} />
          </DetailSection>

          <DetailSection
            id="provider"
            eyebrow="Your provider"
            title="Who carries your traffic"
            lead="The same lookup identifies the company your connection belongs to."
            icon={Building2}
          >
            <FactList facts={networkFacts} />
          </DetailSection>

          <DetailSection
            id="locale"
            eyebrow="How a shop sees you"
            title="Enough to price and translate a page for you"
            lead="Currency, language, and time zone, all before you pick anything."
            icon={Wallet}
          >
            <FactList facts={localeFacts} />
          </DetailSection>

          <DetailSection
            id="browser"
            eyebrow="Your browser"
            title="What you are browsing with"
            lead="Your browser announces this on every single request it makes."
            icon={Monitor}
          >
            <FactList facts={clientFacts} />
          </DetailSection>

          <DetailSection
            id="headers"
            eyebrow="What you send"
            title="Headers your browser volunteers"
            lead="Sent automatically, whether or not the site needs them."
            icon={Braces}
          >
            <FactList facts={headerFacts} />
          </DetailSection>

          <DetailSection
            id="signals"
            eyebrow="What JavaScript reads"
            title="Everything readable without a prompt"
            lead="All of this is computed in your own browser and never sent anywhere."
            icon={Code2}
          >
            <ClientSignals />
          </DetailSection>

          <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.08em] text-emerald-700">
              <ShieldCheck className="h-4 w-4" />
              Nothing was stored
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
              This page keeps none of it.
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              The location and device details come from two server-side lookups that are
              discarded once the page renders, and the JavaScript section is computed in
              your own browser and never transmitted.
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              The point is not that any of this is secret — it is that every site you visit
              receives it by default, and most of them do keep it.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

/** The API often repeats the brand inside the device name ("Apple Apple iPhone"). */
function describeDevice(client: {
  deviceBrand: string;
  deviceName: string;
  deviceType: string;
}) {
  const brand = client.deviceBrand.trim();
  const name = client.deviceName.trim();

  if (name && brand && !name.toLowerCase().startsWith(brand.toLowerCase())) {
    return `${brand} ${name}`;
  }

  return name || brand || titleCase(client.deviceType);
}

function titleCase(value: string) {
  if (!value.trim()) {
    return "";
  }

  return value
    .toLowerCase()
    .split(/[\s_]+/)
    .map((word) =>
      ["isp", "cdn"].includes(word)
        ? word.toUpperCase()
        : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(" ");
}
