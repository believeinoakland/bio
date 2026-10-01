# Kickoff: the BIO installer

Written July 23, 2026 at the end of a long session. Everything a fresh session
needs, so nothing has to be rediscovered.

Platform facts below were either tested in the container or read from Cloudflare
primary documentation during that session. Where something is inferred rather
than established, it says so. Several of the claims correct earlier mistakes,
and the corrections are marked, because the wrong versions are still sitting in
older documents in this tree.

---

## 1. What is being built

Three parts, three different places, three different owners.

| Part | Lives at | Owned by | Job |
|---|---|---|---|
| 1. Invitation | `believeinoakland.org/newgroup` | BIO | Explain what a group is. State the prerequisites honestly, card included. One button to part 2. |
| 2. Wizard | `newgroup.believeinoakland.workers.dev` | BIO | Get consent via OAuth, provision the group's instance into their own account, hand off. |
| 3. Setup | the new group's own instance | the group | Claim the instance, set a password, configure. Nothing routes through BIO again. |

The audience is community activists who will not open a terminal under any
circumstances. That is not a preference to design around, it is the requirement.

### The order of operations after this is built

1. Build and test all three parts.
2. Use the installer to set up a BIO system on `believeinoakland.org` itself.
   That is the real test: if the flow cannot stand up BIO's own instance, it
   cannot stand up anyone's.
3. With that instance live, continue the migration to the new data plane.

---

## 2. Identifiers, all confirmed this session

**New BIO account** (created this session, clean)
- Account ID `20b533579290b9b93168345edd3b7f72`
- workers.dev subdomain `believeinoakland` → instances at
  `<worker>.believeinoakland.workers.dev`
- No R2 yet, no payment method yet, no Workers yet

**OAuth client** (on the new account, private)
- Client ID `1c2fdba3fc71cf88d26fcd7b90df95de`
- No client secret. Token auth method `None (PKCE)`, response type `code`,
  grant type `authorization_code`
- Redirect URL `https://newgroup.believeinoakland.workers.dev/callback`
- Allowed CORS origin `https://newgroup.believeinoakland.workers.dev`
- Scopes: `workers-r2.write`, `workers-scripts.write`, `account-settings.read`
- Client URL deliberately left blank. Once set and domain-verified it can never
  be changed. Do not fill it until `believeinoakland.org` is settled.
- Visibility is private and must stay private for now. Promotion to public is
  permanent and irreversible. Private clients can only be authorized by members
  of the owning account, which is fine while Bob is the only tester.

**Old account** (`sparkyscoffeefund.com`, subdomain `neocloudflare`)
- Holds the working `bio-plane` test deployment at
  `bio-plane.neocloudflare.workers.dev`, plus the sparkyscoffeefund site and a
  `reviews.sparkyscoffeefund.com` Worker that are unrelated to BIO
- `believeinoakland.org` zone is still here, registrar transfer from Network
  Solutions in flight
- This deployment is the proven reference. Do not decommission it until the new
  one is green.

---

## 3. The OAuth flow, and the constraint that shapes everything

### Endpoints, from Cloudflare's own discovery document

Fetched live from `https://api.cloudflare.com/.well-known/openid-configuration`:

```
authorization_endpoint            https://dash.cloudflare.com/oauth2/auth
token_endpoint                    https://dash.cloudflare.com/oauth2/token
revocation_endpoint               https://dash.cloudflare.com/oauth2/revoke
code_challenge_methods_supported  ["plain", "S256"]
token_endpoint_auth_methods       [..., "none"]
```

Self-managed OAuth clients launched June 3, 2026, which is after the training
cutoff of the model that wrote this. Do not rely on recalled knowledge here.

### The finding that killed the no-backend design

Tested directly, twice, and it is the single most load-bearing fact in this
document:

```
OPTIONS api.cloudflare.com/client/v4/accounts/.../r2/buckets
  Origin: https://newgroup.believeinoakland.workers.dev   (a registered origin)
  → HTTP 400, zero CORS headers

control: registry.npmjs.org → access-control-allow-origin: *
```

The management API answers no preflight, so a browser can never send it a
request carrying an `Authorization` header. `allowed_cors_origins` on the OAuth
client governs the OAuth endpoints only, not the management API.

**A browser page cannot create a bucket or upload a Worker.** Part 2 must do its
work server-side. Since part 2 is already a Worker, that is the same origin
serving the page, not new infrastructure.

*Correction: earlier statements in this session claimed a static page with no
backend would work. That was wrong. `INSTALLER.md` still contains the wrong
version in places.*

### Untested, and it resolves itself on first deploy

Whether the token exchange at `dash.cloudflare.com/oauth2/token` succeeds. The
container's egress proxy refuses that host (`x-deny-reason: host_not_allowed`),
so it could not be tested from the sandbox. That is a sandbox limit, not a
Cloudflare behaviour. The Worker is not subject to it.

### Token custody, and why it is acceptable

The access token passes through BIO's Worker. That is unavoidable given the
above. It is materially different from the pasted account-wide API token this
session refused earlier:

- scoped to exactly three permissions rather than the whole account
- granted through a consent screen the user reads and approves
- revocable by the user at any time from their own dashboard
- short-lived
- held in memory for the seconds provisioning takes, never written to storage

The obligation this creates: **the manual, no-installer path stays documented
and supported permanently**, so a group can stand up an instance if BIO
disappears. `SETUP.md` and `DEPLOY-DASHBOARD.md` are that path and must not be
allowed to rot.

### Redirect URL discipline

Cloudflare sends the browser to the exact registered string. Matching is
character-exact and a redirect cannot bridge a mismatch, because Cloudflare
never follows it. A mismatch fails on Cloudflare's side, before the user returns,
so our software cannot catch it or explain it. That is the only failure in the
whole flow we cannot put a plain sentence on the screen for.

`/callback` is a return address, not a front door. Only Cloudflare sends anyone
there. The button on part 1 points at `/`, not `/callback`.

When the domain moves, the safe order is: add the new redirect URL alongside the
old, deploy and verify a real run, then remove the old. Both work during the
overlap so there is no window where a user can land wrong.

---

## 4. The part 1 page

`believeinoakland.org/newgroup`, served from the old account until the zone
moves. A deliberate button, not an automatic redirect: someone who clicks from
`believeinoakland.org` and arrives at `believeinoakland.workers.dev` can read
the relationship in the name, whereas a silent bounce to an unfamiliar domain
immediately before a trust decision is exactly the pattern people are taught to
treat as phishing.

The card warning belongs here, before they start, not three steps into the
wizard.

When the zone moves to the new account, the wizard can sit under
`believeinoakland.org` directly and the seam closes.

---

## 5. Prerequisites the user must clear, in difficulty order

1. **A payment method.** R2 cannot be enabled without a card on file, even
   entirely inside the free tier. Confirmed across multiple sources. For a
   volunteer organisation this is a governance question, not an IT step. See
   the optional-R2 work below, which may remove it.
2. **A Cloudflare account.** Email and verification.
3. **A git host account.** Only if the deploy-button path is used. The OAuth
   path removes this entirely. See section 7.

Free tier for reference: 10GB storage, 1M writes, 10M reads per month, no egress
charges. Durable Objects with SQLite run on the Workers free plan.

---

## 6. State of the code

The tree is `bio-plane`, version 0.3.0 in spirit, `wrangler.jsonc` still says
0.2.0.

### Green

- `npm test` runs four suites: store 24, purge 14, bootstrap 18, livefire 16/16
- Every guard is mutation-tested. Removing the CAS check turns 7 red in store
  and 5 in livefire. Removing the purge confirm gate turns 3 red. Letting member
  purge turns 1 red. Letting a spent bootstrap re-claim turns 3 red. Accepting
  any password at login turns 1 red.

### Built this session

**`purge`** — admin and probe classes, mutating. Refuses unless
`confirm=<store>` matches the store the request resolved to. `&bundleId=` for a
single bundle with its lineage. `seq` is deliberately not reset, because
reissuing an identifier that has existed is worse than a gap. R2 is untouched;
captures are immutable and content-addressed so orphans cost storage and cannot
corrupt anything.

**The bootstrap handover.** A Worker cannot rewrite its own secret; `env` is
read-only at runtime. So `ADMIN_TOKEN` is not the credential, it is a bootstrap
credential spent once:

- the setup page presents it and chooses a real password
- only a PBKDF2 hash is stored, in the Durable Object
- the bootstrap secret is marked spent and stops working
- login exchanges the password for a session token

Recovery from a lost password: overwrite `ADMIN_TOKEN` in the Cloudflare
dashboard. The instance records a fingerprint of the secret it consumed, so a
different value re-arms the claim. The group's Cloudflare login is the root of
trust, which is the one thing they still have when everything else is lost.

**API moved to `/api/*`** so the instance can serve its own setup UI at the
root. The legacy root form still answers, for the one deployment that predates
this. Drop that shim when the old deployment is retired.

### Verified for part 3

A Worker can carry static assets alongside the API, and
`"assets": { "directory": "./public", "binding": "ASSETS", "run_worker_first": ["/api/*"] }`
validates against wrangler 4.114.0. Page and API are same-origin, so no CORS
work is needed for part 3 at all.

### Measured on live infrastructure

Whole-store pass: 102ms at 1 bundle, 112ms at 504. That is a fixed floor, not a
multiplier: 0.020 ms/bundle against local's 0.037. Projects to roughly 201ms at
5,000 and 500ms at 20,000. The 20,000 figure is extrapolated from a 500-bundle
range and local data shows mild superlinearity above 5,000, so treat it as
indicative. The Postgres threshold of 60,000 to 90,000 bundles is not
challenged.

R2 through the binding: best 25MB put 785ms, 31.8 MB/s. Wide run-to-run variance
(25MB came in at 1623, 1428 and 785ms). Fixed per-object overhead 220 to 250ms
regardless of size, which is an independent argument for the 1MB spill
threshold. Do not spill small objects.

Deployed schema matched local `SCHEMA.length` exactly at 3475 chars, confirming
the deployed module was byte-identical to the mutation-tested source.

### Left behind

The `scratch` namespace on the old deployment holds 504 load-test bundles. The
live `bio` store was never written to. Everything in `bio-captures` and
`bio-published` there is livefire test data. All of it is disposable, and
decommissioning is deleting the Worker (which takes the Durable Object with it)
and emptying and deleting the two buckets. The purge op is not needed for that.

---

## 7. Two paths to installing an instance, and the tradeoff

**OAuth path (what part 2 does).** BIO's Worker holds a scoped token briefly and
calls the management API directly: create buckets, upload the script with its
Durable Object migration, set secrets, enable the route. No git host account, no
repository, no forked copy. The migration is under our control rather than a
documented unknown.

**Deploy button path (the fallback, and what the older docs describe).**
Cloudflare clones BIO's public repository into the user's git account, provisions
resources, and wires CI/CD. Requires a GitHub or GitLab account. The user does
not create a repository or upload anything; the button does it. Repositories must
be public, and only github.com and gitlab.com are supported.

**A landmine in the button path, already defused but do not undo it.** The button
derives its secret prompts from the repository's example vars file and pre-fills
whatever values it finds, with no way to mark an entry optional. A published
postmortem two weeks before this session described every copy of an application
deploying with authentication disabled for exactly this reason. For BIO that
would mean every group running the same `ADMIN_TOKEN`, published in a public
repo, silently, showing green. `.dev.vars.example` now ships with all three
values empty and per-binding descriptions in `package.json`. Two further
hardenings still belong in the Worker: refuse to start on an empty token, and
refuse to start on any token value ever published in the repository, both as
livefire assertions.

**Correction, and this needs a decision.** `INSTALLER.md` says the update path is
GitHub's Sync fork button, which triggers a rebuild through CI/CD. That only
holds on the deploy-button path. If part 2 provisions over OAuth there is no
fork and no CI/CD, so **there is currently no update path at all** for instances
installed the new way. For a system holding investigative material that is a
security exposure with a long tail, and it needs designing rather than
discovering later. The likely answer is that the wizard offers an update that
re-uploads the current release into an existing instance, which is arguably
better than a fork sync, but it is not built and not designed.

---

## 8. Optional R2, the highest-value unbuilt item

Storage is by role, not size: only registered captures go to R2, spilling at
1MB. A new group has nothing over 1MB, so everything lives in SQLite in the
Durable Object, which runs on the free plan.

If the two bucket bindings are optional in code, with the capture path checking
for `env.CAPTURES` and refusing large captures clearly rather than crashing, a
group can install with **no payment method at all**. R2 gets added later as a
deliberate step, when the need is concrete.

The fence doctrine survives: a group with no R2 has nothing to fence, and when
they add it they add both buckets together.

Cost: the capture adapter must treat an absent binding as a first-class state,
and `selftest` must distinguish "R2 not configured" from "R2 broken." Do this
before the capture adapter is written, not after.

---

## 9. Cloudflare behaviours worth not rediscovering

**Durable Object storage backend is irreversible.** SQLite cannot be enabled on
a class after deployment; recovery needs a new class name. But the failure is
loud and self-describing: running the Store class against a key-value backed DO
returns HTTP 500 with `SQL is not enabled for this Durable Object class. To
enable it, change new_classes to new_sqlite_classes`. It fails on the first
request, before anything is stored, so at install time the cost is one minute.
Since Cloudflare's change of July 9, 2026, an account with no pre-existing
key-value namespace cannot create one at all, so on a fresh account SQLite is
the only available outcome.

**workers.dev subdomain** is at Workers & Pages, shown as "Your subdomain" with
a Change link. Every Worker is then reachable at
`<worker-name>.<subdomain>.workers.dev`. Changing it later silently breaks every
URL already issued. Cloudflare treats workers.dev as a free website intended for
hobby projects and recommends custom domains for production, which is a further
argument for finishing the registrar transfer.

**Moving a zone between accounts** means removing and re-adding it, which
assigns a new nameserver pair that must be set at the registrar, forces
certificate reissue and DNS record recreation, and risks failing a registrar
transfer that is in flight. Export DNS records first. This is why the zone move
is deferred rather than done.

**R2 bucket names are account-scoped**, not global. The new account can create
`bio-captures` and `bio-published` while the old account still holds those
names, which is what makes a clean cutover possible.

**The management API has no CORS.** See section 3. Do not spend time re-testing
this hoping for a different answer.

---

## 10. Open, in priority order

1. **Build part 2.** The wizard Worker. All identifiers are in section 2. First
   deploy answers the token-exchange question.
2. **Optional R2.** Section 8. Before the capture adapter.
3. **Design the update path.** Section 7. Currently absent.
4. **Build part 1** and part 3's setup UI.
5. **Bootstrap hardening**: refuse empty tokens and refuse published values, as
   livefire assertions.
6. **Then** install BIO onto `believeinoakland.org` using the installer, as the
   real test.
7. **Then** decommission the old deployment and continue the data plane
   migration.

Not on this list deliberately: per-member credentials. Admin being DO-backed
makes them possible, but they imply user records, invitations and revocation,
which is a feature to scope rather than a refactor to smuggle in.

---

## 11. How to work with Bob

He does not use a terminal or command line, and does not edit files. Deliver
complete replacement files and browser-only paths.

"Groundhog" is a standing correction keyword meaning fundamentals have slipped.
It means all seven of: stop guessing and go find out; stop asking questions with
one reasonable answer; stop asking questions answerable from the code or context;
write to be skimmed because he cannot read every word; never be opaque about what
was done, what broke, or what is still unverified; apply his stated strengths and
limits; and never stop to ask permission for work already directed.

The test that catches most violations: if a recommendation appears anywhere in
the same response, it is not a decision to put to him, it is a decision already
made. Act on it and report it. Zero decision items is the normal case.

No em dashes. No telegraphing sentences that announce what is coming instead of
saying it.
