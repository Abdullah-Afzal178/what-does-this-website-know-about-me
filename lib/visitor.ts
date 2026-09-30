import "server-only";

import { headers } from "next/headers";

import { blockReasonForIp } from "@/lib/ip-guard";

type JsonObject = Record<string, unknown>;

export type VisitorLocation = {
  ip: string;
  city: string;
  district: string;
  stateProv: string;
  zipcode: string;
  countryName: string;
  countryEmoji: string;
  countryCapital: string;
  continentName: string;
  latitude: string;
  longitude: string;
  isEu: boolean;
};

export type VisitorNetwork = {
  organization: string;
  companyType: string;
  asNumber: string;
  route: string;
  connectionType: string;
};

export type VisitorLocale = {
  currencyCode: string;
  currencyName: string;
  currencySymbol: string;
  callingCode: string;
  tld: string;
  languages: string[];
  timeZone: string;
  localTime: string;
  utcOffset: number;
};

export type VisitorClient = {
  name: string;
  version: string;
  type: string;
  engineName: string;
  osName: string;
  osVersion: string;
  deviceName: string;
  deviceType: string;
  deviceBrand: string;
};

export type VisitorData = {
  location: VisitorLocation | null;
  network: VisitorNetwork | null;
  locale: VisitorLocale | null;
  client: VisitorClient | null;
  /** Raw header values that are themselves revealing. */
  rawUserAgent: string;
  acceptLanguage: string;
  doNotTrack: string;
  referer: string;
  /** Explains why a section is empty, when it is. */
  note: string | null;
};

const GEO_ENDPOINT = "https://api.ipgeolocation.io/v3/ipgeo";
const UA_ENDPOINT = "https://api.ipgeolocation.io/v3/user-agent";

const GEO_FIELDS = [
  "ip",
  "location",
  "country_metadata",
  "currency",
  "time_zone",
  "asn",
  "company",
  "network",
].join(",");

export async function getVisitor(): Promise<VisitorData> {
  const headerStore = await headers();
  const rawUserAgent = headerStore.get("user-agent") ?? "";
  const clientIp = pickPublicIp(headerStore);
  const apiKey = process.env.IPGEOLOCATION_API_KEY;

  const base: VisitorData = {
    location: null,
    network: null,
    locale: null,
    client: null,
    rawUserAgent,
    acceptLanguage: headerStore.get("accept-language") ?? "",
    doNotTrack: headerStore.get("dnt") ?? "",
    referer: headerStore.get("referer") ?? "",
    note: null,
  };

  if (!apiKey) {
    return {
      ...base,
      note: "Set IPGEOLOCATION_API_KEY in your .env file to reveal location and device details.",
    };
  }

  const [geo, client] = await Promise.all([
    clientIp ? lookupIp(clientIp, apiKey) : Promise.resolve(null),
    parseUserAgent(rawUserAgent, apiKey),
  ]);

  return {
    ...base,
    ...(geo ?? {}),
    client,
    note: clientIp
      ? null
      : "You are browsing from a local address, so there is no public IP to look up. Deployed, this section fills in.",
  };
}

async function lookupIp(
  ip: string,
  apiKey: string,
): Promise<Pick<VisitorData, "location" | "network" | "locale"> | null> {
  try {
    const params = new URLSearchParams({
      apiKey,
      ip,
      include: "network",
      fields: GEO_FIELDS,
    });
    const response = await fetch(`${GEO_ENDPOINT}?${params.toString()}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as JsonObject;
    const location = asObject(payload.location);
    const meta = asObject(payload.country_metadata);
    const currency = asObject(payload.currency);
    const timeZone = asObject(payload.time_zone);
    const asn = asObject(payload.asn);
    const company = asObject(payload.company);
    const network = asObject(payload.network);

    return {
      location: {
        ip: str(payload.ip) || ip,
        city: str(location?.city),
        district: str(location?.district),
        stateProv: str(location?.state_prov),
        zipcode: str(location?.zipcode),
        countryName: str(location?.country_name),
        countryEmoji: str(location?.country_emoji),
        countryCapital: str(location?.country_capital),
        continentName: str(location?.continent_name),
        latitude: str(location?.latitude),
        longitude: str(location?.longitude),
        isEu: location?.is_eu === true,
      },
      network: {
        organization: str(company?.name) || str(asn?.organization),
        companyType: str(company?.type) || str(asn?.type),
        asNumber: str(asn?.as_number),
        route: str(network?.route),
        connectionType: str(network?.connection_type),
      },
      locale: {
        currencyCode: str(currency?.code),
        currencyName: str(currency?.name),
        currencySymbol: str(currency?.symbol),
        callingCode: str(meta?.calling_code),
        tld: str(meta?.tld),
        languages: Array.isArray(meta?.languages)
          ? (meta.languages as unknown[]).filter(
              (item): item is string => typeof item === "string",
            )
          : [],
        timeZone: str(timeZone?.name),
        localTime: str(timeZone?.date_time_txt) || str(timeZone?.date_time),
        utcOffset: num(timeZone?.offset_with_dst ?? timeZone?.offset),
      },
    };
  } catch {
    return null;
  }
}

/** The free tier parses the User-Agent supplied as a request header. */
async function parseUserAgent(
  userAgent: string,
  apiKey: string,
): Promise<VisitorClient | null> {
  const safe = userAgent.replace(/[\x00-\x1F\x7F]/g, "").trim();

  if (!safe) {
    return null;
  }

  try {
    const response = await fetch(`${UA_ENDPOINT}?apiKey=${encodeURIComponent(apiKey)}`, {
      cache: "no-store",
      headers: { Accept: "application/json", "User-Agent": safe },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as JsonObject;
    const device = asObject(payload.device);
    const engine = asObject(payload.engine);
    const os = asObject(payload.operating_system);

    return {
      name: clean(payload.name),
      version: clean(payload.version),
      type: clean(payload.type),
      engineName: clean(engine?.name),
      osName: clean(os?.name),
      osVersion: clean(os?.version),
      deviceName: clean(device?.name),
      deviceType: clean(device?.type),
      deviceBrand: clean(device?.brand),
    };
  } catch {
    return null;
  }
}

function pickPublicIp(headerStore: Headers): string | null {
  const candidates = [
    headerStore.get("x-forwarded-for"),
    headerStore.get("x-real-ip"),
    headerStore.get("cf-connecting-ip"),
    headerStore.get("x-vercel-forwarded-for"),
  ];

  for (const value of candidates) {
    const candidate = value
      ?.split(",")
      .map((item) => item.trim())
      .find(Boolean)
      ?.replace(/^\[|\]$/g, "");

    if (candidate && !blockReasonForIp(candidate)) {
      return candidate;
    }
  }

  return null;
}

function str(value: unknown) {
  return typeof value === "string" ? value : "";
}

function num(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

/** The API uses "??" and "Unknown" as sentinels for values it could not determine. */
function clean(value: unknown) {
  const text = str(value).trim();
  return text === "??" || text.toLowerCase() === "unknown" ? "" : text;
}

function asObject(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonObject)
    : null;
}
