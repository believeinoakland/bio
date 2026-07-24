# Setting up a BIO instance

For a group standing up Believe in Oakland infrastructure for the first time, on
a Cloudflare account of its own.

Everything here is done in a browser except one deploy command. Read the two
prerequisites before you start, because one of them is an organisational
decision rather than a technical step and it has stopped projects at this exact
point.

## What you are building

A control plane (one Cloudflare Worker), a metadata store (SQLite embedded in a
Durable Object), and two object stores (R2 buckets) holding captures.

The two buckets are the fence. `bio-captures` is the working corpus and is
private. Everything lands there on intake, ratified or not. `bio-published`
holds ratified material only and is written by the publisher as the act of
ratification. A published-scope query cannot reach unratified material because
that corpus has never seen it. This is a structural property, not a filter, and
it is the reason for two buckets rather than one bucket with a flag.

## Prerequisites

**An email address the group controls, not a person.** This account will outlive
whoever sets it up. Use a role address that survives someone leaving. Recovering
a Cloudflare account tied to a departed volunteer's personal email is painful
and sometimes impossible.

**A payment method is NOT required to start.** As of release 0.3.0 the two R2
buckets are optional: a new group's record fits entirely in the built-in
database on the free plan, and the software treats "no large-file storage" as
a normal, declared state. R2 only matters once your group needs to attach
files over 1MB. When that day comes, Cloudflare does require a card or PayPal
on the account before R2 can be enabled, even inside its free tier. That is a
real governance question for a volunteer organisation and not an IT detail:
decide then who is willing to attach a payment instrument to shared
infrastructure, and write the decision down. If you already know you want R2
from day one, follow step 2 below; otherwise skip it.

The free tier as of 2026 is 10GB of storage, one million write operations per
month, ten million read operations, and no egress charges. For reference, the
whole current BIO corpus does not approach 10GB. Watch your first invoice
anyway; there are scattered reports of unexpected small charges at R2 activation
and you want to catch that in month one rather than month six.

Durable Objects with SQLite storage work on the Workers free plan. Storage
billing for them began in January 2026, so they are not free forever either, but
the volumes here are small.

## 1. Create the account

Sign up at `dash.cloudflare.com` with the role address. Verify the email.

Turn on two-factor authentication immediately, under My Profile, Authentication.
More than one person in the group should hold recovery codes, stored somewhere
that is not the same system this account administers.

You do not need to add a domain. Skip any prompt asking for one. A BIO instance
runs perfectly well on a `workers.dev` hostname and a custom domain can be
attached later without redeploying anything.

Note your account ID. It is in the URL after `dash.cloudflare.com/`, and also on
the right side of the account home page.

## 2. Optional: enable R2 and create the buckets

Skip this entire step if your group is starting without large-file storage,
which is the normal case. The instance runs, passes its selftest, and reports
storage as "not configured" rather than broken. Come back to this step later
by creating the buckets and adding the two bucket bindings to the Worker; the
buckets are always added as a pair, never one without the other.

R2 in the sidebar. The first visit asks for the payment method described above.

Create two buckets. Names must be exactly these, because the Worker configuration
binds to them by name:

- `bio-captures`, location Automatic
- `bio-published`, location Automatic

Leave both private. Do not enable public access on `bio-captures` at any point.
`bio-published` gets public read later, when the group is ready to publish, and
that is a deliberate act rather than part of setup.

Bucket names are unique within an account, not across Cloudflare. If the group
already runs another BIO instance elsewhere, or if you are migrating from an
older account that still holds these names, that is fine: the same two names can
exist on both accounts at once, which is what makes a clean cutover possible.

If creation is refused for a name conflict, prefix both with something
identifying the instance, for example `oak-bio-captures` and
`oak-bio-published`, and change the `bucket_name` values in `wrangler.jsonc` to
match. Change both or neither. The binding names `CAPTURES` and `PUBLISHED`
never change.

## 3. Visit Workers once

Go to Compute, or Workers & Pages, and let the page load fully.

This step looks pointless and is not. The first visit provisions your account's
`workers.dev` subdomain. If you skip it, the deploy in step 5 fails with an
error about not having a subdomain, which is confusing because it names
something you never chose.

While you are there, note the subdomain. It is shown as "Your subdomain" with a
Change link beside it. Every Worker you deploy will be reachable at
`<worker-name>.<that-subdomain>.workers.dev`.

## 4. Get the code

Unpack the `bio-plane` release. You need Node.js 22 or later. Then, in that
directory:

```
npm install
npm test
```

Expect 24 passed on the store suite and 16/16 on livefire, both running locally
with no credentials and no network. If they do not pass, stop. Deploying code
that fails its own tests locally will not go better against real storage.

## 5. Deploy

```
npx wrangler deploy
```

The first run opens a browser to authorise wrangler against your new account.
Approve it. This is an OAuth login, not an API token, and it is scoped to the
account you are signed into.

Watch two things in the output.

The migration line must create the `Store` class as SQLite-backed. **SQLite
cannot be enabled on a Durable Object class after it is deployed.** Getting this
wrong is not repairable by editing configuration; it requires a new class name
and a fresh namespace. Since a Cloudflare change of July 2026, a new account
cannot create key-value backed namespaces at all, so on a fresh account this is
the only available outcome and there is nothing to get wrong. Verify it anyway.

The last lines print the deployed URL. Copy it. That is your instance.

## 6. Tokens

The Worker recognises three token classes and does nothing at all without them.

| Token | Can do | Held by |
|---|---|---|
| `ADMIN_TOKEN` | Everything, including purge | Two named people, no more |
| `MEMBER_TOKEN` | Read and write bundles in the live store | Working group members |
| `PROBE_TOKEN` | Read anything, mutate only `scratch` | Anyone testing, and any automation |

Generate three distinct random values. On macOS or Linux:

```
openssl rand -hex 32
```

Run it three times. Then set each one:

```
npx wrangler secret put ADMIN_TOKEN
npx wrangler secret put MEMBER_TOKEN
npx wrangler secret put PROBE_TOKEN
```

Each command prompts for the value and does not echo it. Once saved, Cloudflare
will not show a secret back to you. Store all three in the group's password
manager before you set them, not after.

The probe class exists so that testing and automation never need a credential
that can damage anything. It is confined to the `scratch` namespace by the
Worker's own code, and a request naming any other store is refused rather than
quietly redirected. This is why it is safe to put a probe token in a URL, hand
it to a contractor, or paste it into a chat with a tool. Treat `ADMIN_TOKEN` and
`MEMBER_TOKEN` as you would a password.

Rotate any token by running `wrangler secret put` again with a new value. No
redeploy is needed.

## 7. Verify

Open, in a browser:

```
https://<your-worker-url>/?op=selftest&token=<PROBE_TOKEN>
```

You want `"ok": true`. If you skipped R2, `CAPTURES` and `PUBLISHED` report
`"not configured"`, which is healthy and expected; `r2Configured` says
`false`. If you set R2 up, both report `true`. One bound without the other is
a defect the selftest fails loudly, because the fence is a pair. If a token
entry is false, either that secret was not set, or the value you set is one
that has been published in this project's repository, which the software
permanently refuses; generate a fresh value.

Then:

```
https://<your-worker-url>/?op=livefire&token=<PROBE_TOKEN>
```

This runs the full battery server-side in the `scratch` namespace and returns
JSON. You want `16/16 assertions passed`. It exercises the compare-and-swap
ladder including refusal of a stale edit base, append-only history, the oversize
guard, identifier allocation, leases, and an R2 round trip with server-side
checksum and range read. Nothing it does can touch live state.

If you are on a shell rather than a browser, quote the URL. An unquoted `&`
splits the command and the token never arrives, which presents as
`{"ok": false, "error": "unauthenticated"}` and sends people hunting for a
problem that is not there.

Expect roughly 100ms of fixed overhead on store operations and 220 to 250ms per
R2 object regardless of its size. Neither grows meaningfully with corpus size;
a store holding 500 bundles answers a whole-store pass about 10ms slower than
one holding a single bundle.

## 8. Optional, a custom domain

Only if the group already has a domain on this same Cloudflare account. The
domain must be a zone in this account, which means its nameservers point at
Cloudflare.

Worker, Settings, Domains & Routes, Add Custom Domain.

If the domain is registered elsewhere and mid-transfer between registrars, wait.
Moving a zone between Cloudflare accounts assigns a new nameserver pair that has
to be set at the registrar, and doing that during a pending registrar transfer
is a common way to have the transfer fail. It also forces certificate reissue
and DNS record recreation, which means downtime. The `workers.dev` hostname
works fine in the meantime and switching later costs nothing.

## Operating notes

**Purge.** `?op=purge&token=<ADMIN_TOKEN>&confirm=<store>` clears a store. The
`confirm` value must name the store the request actually resolves to, so a purge
cannot land somewhere you did not mean. Add `&bundleId=<id>` to remove a single
bundle with its lineage instead of everything. Identifier allocation is not
reset by a purge; a purged store keeps counting, because reissuing an identifier
that has already existed is worse than leaving a gap.

Purge does not touch R2. Captures are immutable and content-addressed, so
orphaned objects cost storage and cannot corrupt anything.

**Decommissioning.** Deleting the Worker removes the Durable Object and its
contents. Buckets are deleted separately, under R2, and must be emptied first.

**What is not backed up.** Nothing here is, by default. The Durable Object has
point-in-time recovery for the past 30 days, which covers accidents but not a
deleted account. A group holding material that matters should export the index
on a schedule and keep it somewhere else entirely.
