# Pixbet

Next.js and JavaScript casino lobby prototype based on the supplied mobile layout references. Includes dark/light themes, French/English, game search and provider filters, mobile drawer, responsive card rows, free game simulations and fictional sports bet slips.

## Run

Use Node.js 20.9 or later. Run `npm install`, `npm run dev`, then open http://localhost:3000/tr/casino. Production build: `npm run build`.

## Demo scope

All artwork is original SVG. Games are illustrative simulations, not provider integrations. No money, deposits, real wagering, real accounts, payments, live sports feeds, VIP benefits or support chat are connected. Integrate authenticated server-side services and approved providers before operating a real platform. Do not treat browser state or illustrative odds as authoritative financial data.

## Deployment

Target Vercel project: pixbet (`prj_8ZzWHdAjlNzFGDiaHzxP3xcBPzVE`), team `team_Mo63QVR9kLRk18gJf3cmMqFU`. Framework: Next.js.


## Sports odds

Set ODDS_API_KEY as a server-only Vercel production Secret. Never use NEXT_PUBLIC_ for this key. GET /api/odds retrieves upcoming events via The Odds API, EU region, decimal h2h market. Next.js persistent Data Cache shares a 6-hour snapshot; CDN caching also reduces requests. There is no browser polling, forced refresh, or public upstream parameter forwarding. Expect roughly 120 provider requests per 30 days with continuous traffic in a stable deployment; cache misses, regional execution, failures and redeployments can add requests. This is not a hard quota cap. Failed provider results are cached too, to prevent repeated quota spending. Error details and credential-bearing URLs are never returned. Sports odds are informational and may be stale; tickets remain simulations. Provider docs: https://the-odds-api.com/liveapi/guides/v4/


## Independent game backend

See docs/backend-design.md. Demo launches use signed short-lived game sessions; rounds use server-side cryptographic randomness. Set DEMO_SESSION_SECRET as a production Secret with at least 32 random characters. No third-party game files have been imported. Real provider launches and financial wallets require provider access, accounts and durable storage and are not implemented by the demo endpoints.


## BigBang provider

See docs/bigbang.md for the sandbox catalogue and embedded demo launch integration. Add BIGBANG_API_KEY as a server-only production Secret; this adapter accepts test keys only. It always requests demo mode and does not connect real wallets or balance callbacks.

