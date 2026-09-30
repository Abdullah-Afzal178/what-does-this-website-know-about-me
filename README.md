# What Does This Website Know About Me?

A privacy demonstration: open one page and see everything a website learns about you before you click anything — your city, ISP, currency, timezone, browser, device, screen, hardware, and a canvas fingerprint. Powered by [ipgeolocation.io](https://ipgeolocation.io).

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-000?logo=nextdotjs)](https://nextjs.org/)
[![Powered by ipgeolocation.io](https://img.shields.io/badge/Powered%20by-ipgeolocation.io-1a73e8)](https://ipgeolocation.io)

<!-- Add a screenshot of the tool running locally at ./public/tool.png and reference it here -->

---

## What It Does

A sticky summary panel keeps the headline answer on screen while six detail sections scroll beside it, each answering a question the visitor never agreed to answer:

| # | Section | What it shows |
|---|---|---|
| 1 | **Where you are** | IP, city, district, postal area, region, country, coordinates, continent, EU status |
| 2 | **Your provider** | ISP or company name, provider type, ASN, the IP block you sit in |
| 3 | **How a shop sees you** | Currency and symbol, phone country code, local time, timezone, languages, ccTLD |
| 4 | **Your browser** | Browser and version, rendering engine, OS and version, device and type |
| 5 | **What you send** | `Accept-Language`, `DNT`, `Referer`, and the raw `User-Agent` |
| 6 | **What JavaScript reads** | Screen, hardware, locale, preferences, and a canvas fingerprint |

A real example, from a visitor in Montreal on an iPhone:

> **Montreal · Vieux-Montréal**, Quebec, postal area **H2X**, at **45.51085, -73.55596** — on **Videotron ltee** (`AS5769`, block `24.48.0.0/18`) — would be charged in **C$ CAD** — running **Safari 17.5** on **iOS 17.5**, an **Apple iPhone**.

None of that required a cookie, a login, or a permission prompt.

---

## The honest part

This is a demonstration, not a data collector:

- **Nothing is stored.** Sections 1–5 come from one server-side lookup that is discarded once the page renders.
- **Section 6 never leaves your browser.** Screen size, CPU cores, GPU string, and the canvas fingerprint are all computed client-side and rendered locally — they are never sent to the server or to any API.
- **The fingerprint is the point.** It is shown so a visitor can reload and watch the same ID come back, with no cookie involved. It is a non-cryptographic hash used for illustration.

---

## Why ipgeolocation.io

This tool exists because two APIs answer the two halves of "who is this visitor" in one request each:

- **[IP Geolocation API](https://ipgeolocation.io/documentation/ip-location-api.html)** — a single call with `include=network` returns location down to district and postal area, plus ISP, ASN, announced route, currency, timezone, calling code, and the country's languages. That breadth is what makes the reveal land.
- **[User-Agent API](https://ipgeolocation.io/documentation/user-agent-api.html)** — turns the raw `User-Agent` string into browser, engine, OS, device, and client type without shipping a regex database that goes stale.
- **Free tier** — both endpoints work on the free plan, so the page costs two calls per visit.

> ipgeolocation.io also offers dedicated APIs for [ASN](https://ipgeolocation.io/documentation/asn-api.html), [Security](https://ipgeolocation.io/documentation/ip-security-api.html) (VPN, proxy, Tor detection), [Timezone](https://ipgeolocation.io/documentation/timezone-api.html), [Astronomy](https://ipgeolocation.io/documentation/astronomy-api.html), and [Abuse Contact](https://ipgeolocation.io/documentation/ip-abuse-contact-api.html) lookups.

**[Get your free API key →](https://ipgeolocation.io/signup)**

---

## Features

- **Sticky summary panel** with the headline answer, beside scrollable detail sections
- **Two API calls per visit**, both server-side; the key never reaches the browser
- **Client signals computed locally** — screen, pixel ratio, colour depth, CPU cores, device memory, touch points, platform, GPU via WebGL, languages, timezone, clock offset, cookie and storage availability, Do Not Track, dark mode, reduced motion, connection type
- **Canvas fingerprint** demonstrated in-place, stable across reloads, never transmitted
- **Graceful locally** — on `localhost` there is no public IP, so the page says so instead of failing
- **Bot-aware** — crawlers are identified as such rather than mislabelled as browsers
- **SEO-ready** — Open Graph tags, meta description, `robots.txt`, `sitemap.xml`, and favicon

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js](https://nextjs.org/) (App Router) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| Language | TypeScript |
| Icons | [lucide-react](https://lucide.dev/) |
| Visitor data | [ipgeolocation.io](https://ipgeolocation.io) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- An [ipgeolocation.io](https://ipgeolocation.io/signup) API key (free tier is enough)

### Run It Locally

1. Clone the repo:

```bash
git clone https://github.com/Abdullah-Afzal178/what-does-this-website-know-about-me.git
cd what-does-this-website-know-about-me
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the project root:

```env
IPGEOLOCATION_API_KEY=your_api_key_here
```

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000).

> On `localhost` your request has no public IP, so sections 1–3 will explain that rather than fill in. Deployed, they populate normally.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `IPGEOLOCATION_API_KEY` | Yes | Your [ipgeolocation.io](https://ipgeolocation.io/signup) API key |
| `NEXT_PUBLIC_SITE_URL` | No | Your production URL if you choose to deploy (used for sitemap and OG metadata) |

---

## How It Works

1. The server reads the incoming request headers and picks the client IP, skipping private and reserved addresses.
2. Two calls run in parallel: the IP Geolocation API with a narrowed `fields` list, and the User-Agent API with the visitor's own UA forwarded as a request header.
3. The results render in the summary panel and sections 1–5. Nothing is written to disk or to a database.
4. Section 6 mounts in the browser and reads what JavaScript can see. That data exists only in the visitor's tab.

---

## Project Structure

```
what-does-this-website-know-about-me/
├── app/
│   ├── layout.tsx
│   ├── page.tsx              # Summary panel + detail sections
│   ├── opengraph-image.tsx
│   ├── robots.ts
│   └── sitemap.ts
├── components/
│   ├── client-signals.tsx    # Browser-readable signals (client only)
│   ├── summary-panel.tsx     # Sticky at-a-glance panel
│   ├── detail-section.tsx
│   ├── fact-list.tsx
│   └── detail-card.tsx
├── lib/
│   ├── visitor.ts            # IP + User-Agent lookups (server only)
│   ├── ip-guard.ts           # Private-address detection
│   └── session-cache.ts
├── .env                      # API key (not committed)
└── README.md
```

---

## Want to Deploy It?

Works out of the box on any platform that supports Next.js:

- **Vercel** — import the repo, add `IPGEOLOCATION_API_KEY`, deploy.
- **Netlify**, **Cloudflare Pages**, **Railway** — similar process.
- **Self-hosted** — `npm run build && npm start`.

---

## License

MIT — see [LICENSE](LICENSE) for details.
