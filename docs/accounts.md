# Accounts, game pages and user panel

Supabase Auth stores accounts and verifies every launch server-side. The app uses the SSR SDK with HttpOnly, same-site cookies; no browser-local login flags, passwords, service-role keys or operator keys authorize playback. Server routes call auth.getUser() for a verified user record. The Next.js proxy refreshes sessions and never grants access based only on cookie presence.

- /tr/auth: email/password registration and sign-in, with a validated return path.
- /auth/callback: PKCE confirmation-code exchange.
- /tr/game/:id: authenticated game page with fresh-launch iframe, favorite toggle, fullscreen controls, details and related games.
- /tr/account: authenticated profile, favorites and last 50 launch records.
- All existing game-launch and round endpoints require the same server-verified account. Local demo tokens are also bound to that user.

Project settings: enable email/password auth; set Site URL to https://pixbet-three.vercel.app and allow https://pixbet-three.vercel.app/auth/callback as an authentication redirect. Keep email confirmations enabled. The provider sends confirmation messages; production email delivery may require configuring SMTP in Supabase. No fake account or confirmation bypass is built in.

Add SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY as server environment variables. Only the public publishable key is needed; no service-role credential is used by the app. Apply the reviewed database/account-schema.sql to the dedicated Pixbet project; each table enables RLS and restricts rows to auth.uid(). User metadata supplies display text only, never permissions. Launch records describe game openings, not wagers, wins or wallet transactions. Real-money wallets stay disconnected.


## Turkish virtual wallet

/tr/account includes a TRY demo wallet with free virtual top-ups, simulated withdrawals and the latest 50 transactions. No payment details are collected. The balance is independent of BigBang game balances and cannot fund a provider game. All mutations pass through an authenticated RPC with a row lock, a user-scoped idempotency key, integer minor units, balance constraints and a durable transaction record. Exposed tables are read-only for their owners. The mutating function is in the non-exposed pixbet_private schema, explicitly checks auth.uid(), and is callable only by authenticated users through its public invoker wrapper.

Apply database/account-schema.sql and database/virtual-wallet.sql to the dedicated Pixbet project. Accounts are backed by Supabase project jclhwbmmftaaedurpcvk. Site URL and callback redirect URLs were configured by the project owner.
