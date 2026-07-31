# Thread CAPTURE: paste-ready kickoff

Rewritten 2026-07-30 at the close of the release-and-governor session. THREE
releases were cut, signed, deployed byte-identical and live-verified that day:
0.46.0 (the legible user-agent and a resolving contact URL), 0.47.0 (the
per-host governor, three-valued authority, the observation-source split), and
0.48.0 (the governor's operator surface). The plane is at 0.48.0, op=audit
31/31 clean. See `kickoffs/README.md` for the thread register and the
append-only rules, and `kickoffs/BATON.md` for the release baton, which CAPTURE
currently holds.

WHAT IS NOT DONE, so this document is not read as a victory lap: 59 items are
open in DEBT.md. Capture is still BYTES-ONLY for the document classes Oakland
actually publishes (D-91 PDFs, D-64 client-rendered), the archive fallback is
designed and unbuilt, several things exist with nothing consuming them (D-65
monitoring contracts, D-67 connections, D-60 the stable digest), and D-94 is
still open because we pass Akamai only by being unrecognised. The five-item
plan of 2026-07-30 finished; the thread did not.

This thread owns the capture and citation machinery in the plane:
`bio-plane/src/subresources.mjs`, `src/cpu.mjs`, the capture and link tables in
`src/schema.mjs`, the capture ops in `src/index.mjs`, the link and capture
functions in `src/store.mjs`, the capture and authority checks in `bio-checks`,
and `test/subresources.test.mjs` plus `test/governor.test.mjs`. It does NOT own
`civicos-ui/**` or `docprofile/**`, and READING docprofile is expected (D-60
adopts its `digests`/`compare` into the plane) while CHANGING it is not.
`newgroup/**` was touched once, for D-102, under an explicit instruction from
Bob; treat it as out of bounds again absent one.

Bob pastes the block below verbatim and fills the four grant slots. Everything
the session needs it fetches for itself from the public repo; Bob attaches
nothing. The fourth slot is the release SIGNING SEED, the string beginning
`BIOKEY-RAW1.bio-release.` — a 32-byte Ed25519 key in this project's own
envelope, which `ssh-keygen` will not load, so a session reconstructs the
SSHSIG path in Node and verifies every signature against stock `ssh-keygen -Y
verify` before trusting it. Leave it blank when no release will be cut.

---

Kickoff: thread CAPTURE. Fetch these from
raw.githubusercontent.com/believeinoakland/bio/main and read them before anything
else: docs/development/kickoffs/README.md (the thread register and the
never-force-push rule), docs/development/kickoffs/BATON.md (who may cut a plane
release), docs/development/DEBT.md (D-106, D-98, D-91, D-60 and D-65 are
this thread's open work; take the next free D-number at the moment you write),
docs/development/SOURCE-ACCESS.md (the contact URL is the measured admission
key; the allowlist ask is Bob's and pending),
docs/development/AUTHORITY-AND-TRUST.md (RULED sections are settled; D-97's
fields shipped in 0.47.0, the task list has not),
docs/development/ARCHIVE-FALLBACK.md (unblocked: the via column and the
address/retrieval split it needed shipped in 0.47.0),
docs/development/MEASUREMENTS.md (every number, including the governor's chosen
constants and the UA component ladder), docs/development/LINK-FIDELITY.md,
docs/development/CAPTURE-SCALING.md, docs/development/CLIENT-RENDERED.md,
docs/development/CIVICOS_UI_STATE.md (newest two entries only),
bio-plane/package.json and bio-plane/scripts/deploy.mjs (the release path; it
checks the baton on the REMOTE and now binds INSTANCE_NAME from the slug).

This session, in order. Stop and tell me if any item changes the ones after it.
(1) The archive fallback, per ARCHIVE-FALLBACK.md and the monitoring re-fetch
ruling. TWO THINGS FIRST, both recorded as debt this session: MEASURE the CDX
claims through the plane's own egress before building on them (D-105: the
Anthropic container cannot reach web.archive.org, so the record shape and rate
figures in ARCHIVE-FALLBACK.md are still vendor description, not measurement),
and build the failure counter to EXCLUDE governed refusals from the first line
(D-104: our own governor declining is not the source being unreachable, and
counting it would trip the fallback on our own politeness). Then: an
archive-sourced observation files via 'archive.org' with the CDX original as
the document address and the replay address as the retrieval locator; the
provenance_chain grows the second hop, unsigned, and the grade sits below a
direct capture of the same document; the three-failures-or-fourteen-days
threshold triggers it for monitoring only. Respect the archive's third-party
rate figures (theirs, not ours) through the governor's config table. (2) D-98,
the tasks table. THE GRAMMAR AND ROUTING ARE ALREADY FIXED as a contract in
docs/development/INBOX-GRAMMAR.md, derived field-for-field from C-18.5 and the
RULED routing order, so this is a BUILD task: persist the tasks array in the
DO, copy the C-18.5 validator with TASK fixtures both ways, export
checkInboxGrammar for the write path exactly as checkGatheringGrammar is
exported, so authority-undetermined captures land in a project manager's inbox
instead of a count nobody reads. RULED and no longer open: an undetermined
capture creates a task automatically at capture through a PRODUCER/CONSUMER
QUEUE. The capture path only ENQUEUES (refers_to, F5-bounded subject,
timestamp); a separate consumer holds the sole inbox write path, applies
routing and the grammar, and dedups on (refers_to, kind) so a re-capture loop
cannot flood it. This is the safety property, not a detail: the daemon
credential cannot write a task. Transport is table-as-queue in the DO unless a
Cloudflare Queue buys something specific.
(3) D-106, the urgent small one, which replaces the old item 3 because D-102 and
D-103 are both DONE and DEPLOYED in 0.48.0. The INSTALLER ships 0.35.0 while the
plane runs 0.48.0, so a group installing today gets a plane that cannot reach
oaklandca.gov at all and identifies as bio-acquire: every fix of the 2026-07-30
session is absent from a fresh install. Two separable halves, and the SECOND
matters more: (a) cut an installer release embedding the current plane, and
(b) make the embed step REFUSE when the embedded version does not match
bio-plane/package.json, because a silently stale installer is what let this
drift thirteen releases unnoticed. Sovereign instances are the distribution
model. (4) If time remains, plane
adoption of the volatile digest (D-60) is the cheaper win: feasibility is
ALREADY MEASURED (docprofile tree-shakes to 5.3KB, zero deps, import path
`../../docprofile/index.mjs` from src/, build inlines it so the installer is
unaffected), so it is a build task, not an investigation. Import digests/compare
into monitoring, op=audit's duplicate sweep, and resolveLinks' bracket arm; do
not grow a second copy. D-91 (PDF link annotations first, unpdf second) is the
larger alternative and DOES still need the bundle-size and CPU measurement
before believing unpdf fits. (5) Push, appending to DEBT.md and MEASUREMENTS.md,
prepending a state doc entry naming this thread, and rewriting ONLY
docs/development/kickoffs/CAPTURE.md for the session after.

Grants for this session (sessions carry no secrets; paste all four even if
unchanged): Cloudflare deploy token: [PASTE]. GitHub fine-grained token for
believeinoakland/bio, Contents read/write: [PASTE]. Member token, read-only,
for post-deploy verification: [PASTE]. Release signing key
(BIOKEY-RAW1.bio-release.<seed>), only if a release may be cut this session;
otherwise leave blank and the session hands you the exact bytes to sign in
tools/sign-release.html: [PASTE]. Deploy target account id
20b533579290b9b93168345edd3b7f72 (biocloudflare), plane worker biosmoke7. Work
without asking me to confirm anything determinable from the repo; decision
items at the end only.

---

## What this thread should know without being told

**The instance name IS the worker name, with no exceptions.** The wizard already
collects it as `slug`; the wizard and deploy.mjs both bind INSTANCE_NAME from it,
on install and on update, so an update retro-names copies that predate the
binding. A third party therefore sees the same name the operator types into a
URL, which is what lets them throttle one operator rather than a provider. Do
not add a second name, an override, or a prompt: a name that can differ from the
worker is a second source of truth that drifts, and the one interim override
this project had ('development') was removed the day it was created.

**The contact URL is the measured admission key.** D-94's component ladder,
second-path confirmed: purpose and instance are droppable from the agent;
remove the contact URL and www.oaklandca.gov flips 200 to 403 uniformly. Never
let the advertised URL stop resolving, and never regress it out of the string.
We still pass only because Akamai does not recognise CivicOS; the durable fix
is the allowlist request, Bob's to make, and the probe is the instrument for
the day admission stops.

**The governor is live and its constants are chosen, not measured.**
Store.GOVERNOR in the DO: 12/min default appetite, three-token burst, jittered
gaps, 429 overrides the bucket honouring Retry-After, escalation doubles and
resets on success. Per-host override via governorconfig; per-instance via the
GOVERNOR_APPETITE_PER_MIN binding, which is also how suites drive the real
path without pacing a fake host. Subresources ride the primary admission with
a browser stagger, because a person paces documents and a browser bursts
assets. The observed live failure it answers: one 403 on a cold back-to-back
pair, ten admissions otherwise, deployed 0.46.0.

**Authority is three-valued and the fence is real.** acquire records
authority_state and a dated authority_basis in BOTH cases plus a single-hop
provenance_chain; no assertion means honestly undetermined, never invented.
C-18.9 refuses undetermined material at or past verified. The task list it
routes to does not exist yet (D-98). Archive hops make the chain two hops with
the weaker hop unsigned; grade tracks directness, never technique.

**captured_locators keys on (address_norm, capture_sha, via).** Two sources
agreeing is stronger than one repeating; two disagreeing is a provenance
difference, not a change. The bracket arm reads via 'direct' only. The table
is derived and on the reshape list; the reshape ran clean on the live store.

**Template literals bite, and node --check lies.** setup.mjs twice, schema.mjs
once: a comment with backticks terminates the literal, and a BALANCED stray
pair still parses. hygiene.test.mjs counts ticks in both files now. Quote
nothing in backticks inside either.

**Test through the op; assertions run both ways; numbers come from
MEASUREMENTS.md; a Worker cannot time itself; the DO is where a governor
belongs; schema changes reshape derived tables only, BEFORE schema
application; signing needs the out-of-tree Node SSHSIG reconstruction verified
against stock ssh-keygen with negative controls; deploy believes only the
bytes and checks the baton on the REMOTE; do not create debt that can be
avoided; superseded rules in tests are corrected, never exempted.** All of
these earned their place; the ledger has the receipts.

## Bob's rulings, already made. Do not re-ask.

From earlier sessions: source addresses are not exempt from canonical identity
and the address is a comment on a canonical-ID citation. Element references are
part of citations. undetermined is first-class and must be STATED. A superseded
link offers the capture the record does hold, labelled. Re-fetch at
ratification records the attempt and outcome, not success. Cascade may run
unattended behind the ratification fence. site_chrome is derived. Workers Paid
is an optimisation, never a requirement. JS-rendered content IS the content, at
the SAME grade.

From 2026-07-30, detailed in AUTHORITY-AND-TRUST.md: the renderer is immaterial
and authority follows the data. Authority is three-valued; undetermined becomes
a task for the project manager, falling back to a group admin, forwardable, on
a per-user inbox whose transport may one day be email, which is why field
bounds are enforced at write time. An authority-undetermined capture cannot be
published. Transitive trust is accepted where disclosed in the provenance chain
with grade and confidence adjusted; what is inherited is the FACT OF
PUBLICATION, never the credibility of the content. An alternative source counts
as a re-fetch for monitoring after three consecutive failures or fourteen days.
Content is identified in PDFs as in HTML; CAPTURE extracts structure, FRAMEWORK
decides content. Archive.org is a BACKUP source only. BIO does not disguise its
requests, and the measurements keep proving legibility is also what works.
Refinement (RULED 2026-07-30): delegating the operator's OWN browser user-agent
to their OWN instance is legitimate, not disguise, because the authorship is
real; it is HELD IN RESERVE with a named trigger (the honest agent stops
gaining admission) and a named veto (outside counsel Bob is consulting), and is
NOT adopted while the honest CivicOS string works. Do not build browser-UA
delegation pre-emptively.

Also from 2026-07-30. An undetermined capture creates an inbox task
AUTOMATICALLY AT CAPTURE, through a PRODUCER/CONSUMER QUEUE: the capture path
only enqueues, a separate consumer holds the sole inbox write path, and the
daemon credential therefore cannot write a task, assign one, or forge history.
The instance name IS the worker name, everywhere, with no override. And THE
CITY IS NON-SUPPORTIVE, which inverts the D-94 plan: an allowlist request to a
hostile City may simply hand them the string to block, since they already
denylist archive.org_bot and GPTBot by name, so the archive path and egress
diversity are the priority and the ask is Bob's alone to time. Whether that
reframing becomes doctrine in SOURCE-ACCESS.md is still Bob's call and is NOT
yet written there.

## Open, and named

**D-106 is being paid for right now.** The installer embeds 0.35.0 while the
plane runs 0.48.0, so a group installing today gets an instance that cannot
reach oaklandca.gov at all and identifies as `bio-acquire`. Everything the
2026-07-30 session shipped is absent from a fresh install. Sovereign instances
are the distribution model, so this outranks every other small item.

**D-94's clock still ticks.** Admission rests on being unrecognised. The
allowlist ask now carries a measured, specific claim: a named civic agent, a
resolving contact, and a component ladder showing exactly what we send and why.
Given the City's stance, the ask is held rather than pending.

**D-98 blocks the authority ruling's landing.** Undetermined captures exist on
the live instance now; nothing routes them to a person.

**Design only, not built:** WARC and Memento interchange (D-99's remainder),
PDF structure extraction (D-91), the volatile digest in the plane (D-60),
monitoring contracts (D-65), cascade planting, the objective object type.
