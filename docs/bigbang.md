# BigBang Casino sandbox integration

Source contract: https://api.bigbangcasino.bet/docs/

BIGBANG_API_KEY is a production Vercel Secret. Only ek_test_ keys are accepted by this implementation. The browser never sends or receives the operator key. CasinoAPIPro was superseded before an adapter was installed.

GET /api/providers/bigbang/games retrieves the account-visible Standard catalogue (up to 5,000 entries), caches it for 15 minutes, and returns normalized display data. Premium games are excluded. The lobby uses provider title as the visible name and provider thumbnails where available. Search and provider filters work on the returned catalogue.

POST /api/providers/bigbang/launch validates the same-origin request and game membership in the catalogue. It always supplies demo:true to BigBang; client-supplied player IDs, wallet values and demo flags are ignored. A successful response must explicitly identify demo mode and supply an HTTPS /demo/launch/ URL on an allowlisted BigBang origin. Launch responses are private and never cached. The UI embeds this URL in a sandboxed iframe. All browser responses use generic errors, never provider bodies or credential-bearing URLs.

This integration does not create players, deposit or withdraw, register callbacks, or handle wallet movements. The provider demo contract uses virtual balance with no operator wallet. Future wallet work requires durable transaction storage, authenticated player accounts and the documented signature/idempotency contract; it must not reuse the demo session backend as a ledger.

If the catalogue cannot be fetched, the existing original Pixbet demo games remain available and the lobby reports provider unavailability. A missing key, invalid key, insufficient permission or IP/domain restriction is shown as a connection problem, never replaced with fake provider games.

