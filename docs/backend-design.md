# Pixbet independent backend

## Implemented foundation

Original Next.js Route Handlers and JavaScript. No ViperPro code, games, artwork, wallet code or credentials are copied in this foundation release. The user subsequently confirmed written permission to reuse bundled games; the authorized import is pending the binary asset transfer. The existing Odds API integration is preserved.

- GET /api/games: public demo catalogue and providers.
- POST /api/games/:id/launch: creates a signed, game-bound demo token valid for 15 minutes. The response declares demo mode and disables real money.
- POST /api/games/:id/round: verifies the bearer token and generates symbols using Node crypto.randomInt. Returns a unique round ID and zero monetary value. Client input cannot select the result or a payout.
- DEMO_SESSION_SECRET is a server-only production secret, at least 32 characters. Tokens and rounds are not stored. No balance, transaction ledger or persistent account is implemented by these demo routes. A launch token is authorization for demo rounds only, not an account credential.

## Workflow to implement with a licensed provider

Catalogue -> authenticated launch request -> provider adapter -> expiring game session -> verified provider event -> atomic ledger entry -> user transaction history.

The catalogue stores internal game IDs and maps them to provider IDs. Provider secrets stay server-side. Return only a verified HTTPS launch URL from an allowlisted provider host. Do not accept arbitrary client URLs or provider identifiers.

A real-money backend additionally requires durable Postgres storage and authenticated user accounts. Suggested tables: users, providers, games, game_sessions, rounds, wallet_accounts, ledger_transactions, ledger_entries, provider_events, audit_events. Use integer minor units with an explicit currency. Never use JavaScript floating-point arithmetic for a ledger.

Wallet changes must occur in one database transaction, with row locks or serializable isolation, balanced ledger entries, a non-negative available balance rule, and uniqueness on provider + transaction ID. An exact duplicate provider event returns the original result; a conflicting duplicate is rejected. Rollbacks reference the original transaction and are applied once. These guarantees require persistent storage; process memory is insufficient.

Callback authentication and acknowledgement schemas must come from the chosen provider's actual documentation. Verify signatures against the raw request body, timestamps, replay rules, game/user/currency ownership and server-side transaction amounts. No unauthenticated generic balance callback is enabled. Real-money launches, payouts, deposits and withdrawals remain unavailable until these services are implemented and verified.

## ViperPro findings

The inspected project uses Laravel 10 / PHP 8.1+, Vue 3 and Vite. Its GameController groups games by provider, filters the catalogue, launches remote games, and accepts provider callbacks. It also references local browser games in public/originals. Those game clients depend on session and spin services; copying a directory would not make it an independent game backend.

The user confirmed written permission to reuse the bundled games. Treat that authorization as covering the requested bundled-game integration. It does not supply credentials for externally hosted provider services. The reusable browser clients still require a compatible session/spin protocol and binary asset hosting; neither importing their artwork alone nor routing them to the generic demo-round endpoint is a complete integration.

References:
- https://github.com/Casino-Scripts-com/ViperPro-Casino/blob/main/app/Http/Controllers/Api/Games/GameController.php
- https://github.com/Casino-Scripts-com/ViperPro-Casino/tree/main/public/originals
- https://github.com/Casino-Scripts-com/ViperPro-Casino/blob/main/README.md

