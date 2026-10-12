# Deploying Civicsmith's stewards' reporting service

The service is one Worker, `stewards`, on the project's account (`20b533579290b9b93168345edd3b7f72`, the
`believeinoakland` workers.dev prefix), apart from every group's Civicsmith. It holds its own store (a Durable Object)
and one mail binding, and nothing else: see `wrangler.jsonc`. Deploying it is a deploy act and needs Bob's approval in
session.

It stays **not yet open** (its page says so, and it takes no report) until all of these are set, and `npm run deploy`
refuses, deploying nothing, until they are:

| what | where | set by |
| --- | --- | --- |
| `STEWARDS_ADDRESS`, the stewards' contact address | `vars` in `wrangler.jsonc`, and the same address as the `NOTIFY` binding's `destination_address` | Bob names it (K2799) |
| `CONTACT_RETENTION_DAYS` (90), `REPORT_RETENTION_DAYS` (365) | `vars` in `wrangler.jsonc` (committed, K2819) | already set |
| `STEWARD_KEYS`, one line per steward, `name:sha256-of-key` | `wrangler secret put STEWARD_KEYS` | the stewards Bob names |
| `SOURCE_KEY`, at least 32 random bytes | `wrangler secret put SOURCE_KEY` | the deployer |

## 1. Each steward's key

Each steward makes a key of at least 32 random bytes and keeps it private, for example
`node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`, and gives the deployer only its
SHA-256: `printf %s "$KEY" | sha256sum`. The service never holds a key, only these digests.

## 2. Mail

Cloudflare's send-e-mail binding delivers only to an address verified in the account's Email Routing, and sends only
from an address on a domain whose Email Routing is active in the account. In the dashboard: Email, Email Routing,
Destination addresses, add `STEWARDS_ADDRESS` and confirm it from that mailbox. Set `NOTIFY_FROM` in `vars` to a sender
on a routed domain. Without `NOTIFY_FROM` the service still takes reports; each notice fails and is logged by its
reference only.

## 3. Deploy

In `stewards/`: `npm install`, `npx wrangler login` (to the project's account), the two secrets as above, then
`npm run deploy`. The deploy script lists the secret names, checks the configuration (`checkOpen`) and the account, and
runs `wrangler deploy` only when both pass. It never prints a secret's value.

## 4. Verify

Open `https://stewards.believeinoakland.workers.dev/`: the notice and the form. Send a test report; the stewards'
address receives one notice with its reference. Sign in at `/steward` with a steward's name and key, dismiss the test
report with a reason.
