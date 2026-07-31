# Thread CAPTURE: paste-ready kickoff

Rewritten 2026-07-31 at the close of the inbox-and-archive session. FIVE
releases were cut, signed, deployed byte-identical and live-verified that day:
0.49.0 (the task inbox, D-98), 0.50.0 (source reachability, D-104), 0.51.0 (the
archive fallback's decision half), 0.52.0 (the archive provenance chain, D-112)
and 0.53.0 (a deploy that waits for the build to serve, D-108, plus a purge that
means ALL, D-113). The plane is at 0.53.0, op=audit 31/31 clean, and the
installer carries 0.53.0. See `kickoffs/README.md` for the thread register and
the append-only rules, and `kickoffs/BATON.md` for the release baton, which
CAPTURE currently holds.

WHAT IS NOT DONE, so this document is not read as a victory lap: 68 items are
open in DEBT.md. The archive fallback can decide and capture but NOTHING CALLS
IT: no monitoring tick consults `sourcereach` and nothing fires the fallback, so
the machinery is correct and idle. The task inbox creates tasks but NOTHING
DRAINS THE QUEUE on a schedule (D-109), so the ruling's word "automatically" is
honoured only as far as the queue boundary. Capture is still BYTES-ONLY for the
document classes Oakland actually publishes (D-91 PDFs, D-64 client-rendered).
D-60, the docprofile digest adoption, was item 4 of the last plan and was never
started. And D-94's clock still ticks: we pass Akamai only by being unrecognised.

This thread owns the capture and citation machinery in the plane:
`bio-plane/src/subresources.mjs`, `src/cpu.mjs`, `src/cdx.mjs` (new), the
capture, link, task and reachability tables in `src/schema.mjs`, the capture ops
in `src/index.mjs`, the link, capture, task and reachability functions in
`src/store.mjs`, the capture and authority checks in `bio-checks`, and
`test/subresources.test.mjs`, `test/governor.test.mjs`, `test/inbox.test.mjs`,
`test/reachability.test.mjs` and `test/cdx.test.mjs`. It does NOT own
`civicos-ui/**` or `docprofile/**`, and READING docprofile is expected (D-60
adopts its `digests`/`compare` into the plane) while CHANGING it is not.
`newgroup/**` was touched under explicit instruction for D-102 and again for
D-106; treat it as out of bounds absent one.

Bob pastes the block below verbatim and fills the grant slots. Everything the
session needs it fetches for itself from the public repo; Bob attaches nothing.
The SIGNING SEED begins `BIOKEY-RAW1.bio-release.` and is a 32-byte Ed25519 key
in this project's own envelope, which `ssh-keygen` will not load, so a session
reconstructs the SSHSIG path in Node and verifies every signature against stock
`ssh-keygen -Y verify` WITH NEGATIVE CONTROLS before trusting it. Leave it blank
when no release will be cut.

---

Kickoff: thread CAPTURE.

Read `docs/development/kickoffs/CAPTURE.md` from
raw.githubusercontent.com/believeinoakland/bio/main first. It names what to read
and in what order, the session plan, the rulings that are settled, and the
standing knowledge this thread does not re-derive. Follow it.

Grants (sessions carry no secrets; paste every one even if unchanged):
  Cloudflare deploy token: [PASTE]
  GitHub token, believeinoakland/bio, Contents read/write: [PASTE]
  Member token, read-only, for post-deploy verification: [PASTE]
  Admin token, for op=audit, op=purge, governorconfig and registeraudit: [PASTE]
  Release signing seed (BIOKEY-RAW1.bio-release.<seed>), only if a release may
    be cut; blank means hand me the bytes to sign in tools/sign-release.html: [PASTE]
  Ratification seed, only if something is published: [PASTE]

Deploy target: account 20b533579290b9b93168345edd3b7f72 (biocloudflare), plane
worker biosmoke7. The plane is at 0.53.0, op=audit 31/31 clean.

Work without asking me to confirm anything determinable from the repo. Stop and
tell me if any item in the plan changes the ones after it. Decision items at the
end only.

---

## Reading order

Fetch from raw.githubusercontent.com/believeinoakland/bio/main. The parenthetical
is why, not a summary; read the document.

1. `docs/development/kickoffs/README.md` — the thread register, the
   never-force-push rule.
2. `docs/development/kickoffs/BATON.md` — who may cut a plane release. CAPTURE
   holds it.
3. `docs/development/DEBT.md` — 68 items open. Take the next free D-number at
   the moment you write, not at the moment you plan.
4. `docs/development/MEASUREMENTS.md` — READ THE 2026-07-31 SECTIONS FIRST. They
   overturn three claims the archive design rested on and they record one near
   miss that would have wasted a session.
5. `docs/development/ARCHIVE-FALLBACK.md` — now carries its corrections inline.
   The rate figures are still THEIRS and deliberately unverified (D-111).
6. `docs/development/AUTHORITY-AND-TRUST.md` — RULED sections are settled.
7. `docs/development/INBOX-GRAMMAR.md` — the contract D-98 was built against.
   Three places it was underspecified are recorded in D-98's resolution.
8. `docs/development/SOURCE-ACCESS.md` — the contact URL is the measured
   admission key; the City is non-supportive and the allowlist ask is HELD.
9. `docs/development/LINK-FIDELITY.md`, `CAPTURE-SCALING.md`,
   `CLIENT-RENDERED.md` — the citation, scaling and rendering designs.
10. `docs/development/CIVICOS_UI_STATE.md` — NEWEST TWO ENTRIES ONLY.
11. `bio-plane/package.json` and `bio-plane/scripts/deploy.mjs` — the release
    path. It takes `--thread`, checks the baton on the REMOTE, binds
    INSTANCE_NAME from the slug, and now WAITS for the version to serve.

## The session plan

In order. Stop and say so if any item changes the ones after it.

**(1) D-109, drain the task queue.** First because it is the smallest thing
standing between a shipped mechanism and a working one: undetermined captures
enqueue correctly and no task ever appears unless somebody calls `op=taskdrain`
by hand. The mechanism is chosen and proven elsewhere in this codebase: a
Durable Object alarm, armed on enqueue and re-armed while `task_queue` is
non-empty, self-terminating when it drains, exactly as `#armSweep` does for
selections. DO NOT drain from the capture path: that puts the daemon credential
back in the position of causing the inbox write, which is the coupling the
producer/consumer split exists to break.

**(2) Make something CALL the archive fallback.** The decision and the capture
both work and nothing invokes them. A monitoring tick that fails should record
its outcome through `op=recordsourceoutcome`'s path (the acquire path already
does), and a tick finding `fallback_eligible` should call `op=acquire` with
`via: "archive.org"` and the document address. Note what the fallback does NOT
yet do: nothing consults it for MONITORING specifically, which is the only thing
the ruling permits it for. Read D-104's resolution before touching the counter.

**(3) D-113 as a CLASS, not an instance.** `op=purge` was fixed to take the
three tables it had silently outgrown, but that list is maintained by hand and
nothing fails when the next derived table is added and forgotten. D-98's tables
were three releases old before anyone noticed, and only during a tidy-up. A
hygiene check that every `CREATE TABLE` in `schema.mjs` is either named in purge
or explicitly exempted closes the class. Cheap, and it prevents a repeat.

**(4) If time remains, D-60.** Confirmed feasible; build it. docprofile
tree-shakes to 5.3KB, zero dependencies, imported as `../../docprofile/index.mjs`
from `src/`, and `build` inlines it so the deployed artifact and the installer
are unaffected. Import `digests`/`compare` into monitoring, `op=audit`'s
duplicate sweep, and `resolveLinks`' bracket arm. Do not grow a second copy.
Read docprofile; do not change it.

**(5) Close out.** Push, APPENDING to DEBT.md and MEASUREMENTS.md rather than
rewriting them, prepend a state doc entry naming this thread, and rewrite ONLY
`docs/development/kickoffs/CAPTURE.md` for the session after.

## What this thread should know without being told

**A DEPLOY VERIFIED IS NOT A BUILD SERVING, and this cost most of a debugging
detour on 2026-07-31.** Seconds after `deploy.mjs` verified 0.52.0
byte-identical, `/version` answered 0.51.0, two probes were answered by the
previous build and a third by the new one. The rollout is PER-ISOLATE AND NOT
ATOMIC. A forged-locator probe appeared to show new code fetching
`evil.example.com`; it was the old code answering, and it looked exactly like a
security defect. `deploy.mjs` now gates on the version actually serving and says
so loudly when it cannot confirm. It still cannot confirm the DURABLE OBJECT
half, which cycles separately, so an op routed into the store can lag after the
Worker is current. IF A LIVE PROBE EVER CONTRADICTS THE SUITE, ESTABLISH WHICH
BUILD ANSWERED BEFORE BELIEVING EITHER.

**An equality or an outcome that costs nothing to produce is not evidence.** One
principle, three mechanisms, all enforced structurally: a governed refusal is
our politeness and not the source failing, so it moves no counter (D-104); two
empty-body digests agreeing agree on nothing, so `3I42H3S6NNFQ2MSVX7XZKYAYSCX5QBYJ`
is excluded by name (D-105); and a chain hop a caller can hand us is a chain hop
a caller can invent, so the archive hop is built by the call that fetched the
CDX record and `hygiene.test.mjs` asserts at SOURCE that no provenance field is
readable off a request body (D-112).

**RUN THE NEGATIVE CONTROL.** Neutering the inbox write-path grammar check left
all 67 assertions passing, because every task the consumer builds from ordinary
input is well-formed by construction, so nothing actually proved the write gate
fired. An assertion driving it with a non-canonical bundle id was added and the
control then failed 3. Removing D-104's exclusion breaks 17 of 34. A suite that
does not fail when you break the thing it tests is testing something else.

**Measure before building, through the PLANE's egress.** The container cannot
reach `web.archive.org`; the plane can, and `op=acquire` into `store=scratch` is
the instrument. Three questions closed D-105 and overturned three claims the
design rested on. Every figure and field shape now in ARCHIVE-FALLBACK.md is
measured except the rate ceilings, which are theirs.

**The instance name IS the worker name, with no exceptions.** The wizard collects
it as `slug`; the wizard and deploy.mjs both bind INSTANCE_NAME from it, on
install and on update. A third party therefore sees the same name the operator
types into a URL, which is what lets them throttle one operator rather than a
provider. Do not add a second name, an override, or a prompt.

**The contact URL is the measured admission key.** D-94's component ladder,
second-path confirmed: purpose and instance are droppable from the agent; remove
the contact URL and www.oaklandca.gov flips 200 to 403 uniformly. Never let the
advertised URL stop resolving, and never regress it out of the string. We still
pass only because Akamai does not recognise CivicOS.

**The governor is live and its constants are chosen, not measured.**
Store.GOVERNOR in the DO: 12/min default appetite, three-token burst, jittered
gaps, 429 overrides the bucket honouring Retry-After, escalation doubles and
resets on success. `web.archive.org` is overridden to 24/min from THEIR
published figure on first contact. Per-instance via GOVERNOR_APPETITE_PER_MIN.

**Authority is three-valued and the fence is real.** acquire records
authority_state and a dated authority_basis in BOTH cases plus a
provenance_chain; no assertion means honestly undetermined, never invented.
C-18.9 refuses undetermined material at or past verified. An archive capture is
deliberately left UNDETERMINED rather than having authority auto-set to the
Internet Archive: the publisher is reached by delegation and disclosed in the
chain, not asserted by us, and auto-setting it would make an archive capture
publishable without any member ever deciding who issued the document.

**Grade tracks directness, never technique.** A direct capture is one hop and
grade B. An archive capture is two hops, the second unsigned and saying so, and
grade C, even when the bytes are identical and the method just as careful.

**captured_locators keys on (address_norm, capture_sha, via).** An archive
capture files under the CDX `original` as the document address and the replay URL
as the retrieval locator, so it lands on the SAME row as a direct capture and two
sources agreeing accumulate as corroboration rather than looking like two
documents.

**Template literals bite, and node --check lies.** setup.mjs twice, schema.mjs
once: a comment with backticks terminates the literal, and a BALANCED stray pair
still parses. hygiene.test.mjs counts ticks in both files and also asserts the
schema literal ends on a `);`, so a new table appended at the very end of
schema.mjs will fail it; put new tables BEFORE the host_governor block.

**Test through the op; assertions run both ways; numbers come from
MEASUREMENTS.md; a Worker cannot time itself; the DO is where a governor
belongs; schema changes reshape derived tables only, BEFORE schema application;
deploy believes only the bytes and then waits for them to serve; do not create
debt that can be avoided; superseded rules in tests are CORRECTED, never
exempted.** All of these earned their place; the ledger has the receipts.

## Bob's rulings, already made. Do not re-ask.

From 2026-07-31: **there is no need to push capture traffic to the breaking
point.** The governor keeps traffic low enough that being banned is not a
concern, and there is plenty of time to capture even large collections. This is
why D-111 is an entry rather than an omission: establishing a rate ceiling means
hitting it, and the documented consequence lands on Cloudflare's SHARED egress,
on people who have never heard of this project and get no say. Their capacity is
discovered by a refusal arriving in ordinary polite use, never by probing.

From 2026-07-30, detailed in AUTHORITY-AND-TRUST.md: the renderer is immaterial
and authority follows the data. Authority is three-valued; undetermined becomes
a task for the project manager, falling back to a group admin, forwardable.
An authority-undetermined capture cannot be published. Transitive trust is
accepted where disclosed in the provenance chain with grade and confidence
adjusted; what is inherited is the FACT OF PUBLICATION, never the credibility of
the content. An alternative source counts as a re-fetch for monitoring after
three consecutive failures or fourteen days. Content is identified in PDFs as in
HTML; CAPTURE extracts structure, FRAMEWORK decides content. Archive.org is a
BACKUP source only. BIO does not disguise its requests. Browser-UA delegation is
HELD IN RESERVE with a named trigger and a named veto and is NOT adopted while
the honest CivicOS string works; do not build it pre-emptively.

Also from 2026-07-30: an undetermined capture creates an inbox task
AUTOMATICALLY AT CAPTURE through a producer/consumer queue. The instance name IS
the worker name. And THE CITY IS NON-SUPPORTIVE, which inverts the D-94 plan: an
allowlist request to a hostile City may simply hand them the string to block, so
the archive path and egress diversity are the priority and the ask is Bob's
alone to time.

From earlier sessions: source addresses are not exempt from canonical identity
and the address is a comment on a canonical-ID citation. Element references are
part of citations. undetermined is first-class and must be STATED. A superseded
link offers the capture the record does hold, labelled. Re-fetch at ratification
records the attempt and outcome, not success. Cascade may run unattended behind
the ratification fence. site_chrome is derived. Workers Paid is an optimisation,
never a requirement. JS-rendered content IS the content, at the SAME grade.

## Open, and named

**Nothing calls the archive fallback.** The fence, the CDX selection, the two-hop
chain and the capture all work and are live-verified; no monitoring tick invokes
any of it. This is the largest gap between what is built and what is running.

**D-109: nothing drains the task queue.** Undetermined captures enqueue and no
task appears without a manual `op=taskdrain`.

**D-113 as a class:** purge's table list is maintained by hand and nothing fails
when the next derived table is forgotten.

**D-107:** the installer still has no scripted deploy with read-back
verification; DEPLOY.md documents a hand-paste into the dashboard.

**D-110:** `setup.mjs` still explains the NO_AUTHORITY refusal D-97 removed.

**D-111:** the Wayback rate ceilings are theirs and deliberately unverified.

**D-94's clock still ticks.** Admission rests on being unrecognised. Given the
City's stance, the allowlist ask is held rather than pending.

**Design only, not built:** WARC and Memento interchange (D-99's remainder,
though the Memento headers are now confirmed present on replay responses), PDF
structure extraction (D-91), the volatile digest in the plane (D-60), monitoring
contracts (D-65), cascade planting, the objective object type.
