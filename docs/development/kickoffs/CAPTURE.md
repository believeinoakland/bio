# Thread CAPTURE: paste-ready kickoff

Rewritten 2026-07-30 at the close of the release-and-governor session (0.46.0
and 0.47.0 both cut, deployed, and live-verified). See `kickoffs/README.md` for
the thread register and the append-only rules, and `kickoffs/BATON.md` for the
release baton, which CAPTURE currently holds.

This thread owns the capture and citation machinery in the plane:
`bio-plane/src/subresources.mjs`, `src/cpu.mjs`, the capture and link tables in
`src/schema.mjs`, the capture ops in `src/index.mjs`, the link and capture
functions in `src/store.mjs`, the capture and authority checks in `bio-checks`,
and `test/subresources.test.mjs` plus `test/governor.test.mjs`. It does NOT own
`civicos-ui/**` or `docprofile/**`.

Bob pastes the block below verbatim and fills the four grant slots. Everything
the session needs it fetches for itself from the public repo; Bob attaches
nothing.

---

Kickoff: thread CAPTURE. Fetch these from
raw.githubusercontent.com/believeinoakland/bio/main and read them before anything
else: docs/development/kickoffs/README.md (the thread register and the
never-force-push rule), docs/development/kickoffs/BATON.md (who may cut a plane
release), docs/development/DEBT.md (D-98, D-91, D-102, D-103, D-60 and D-65 are
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
rate figures (theirs, not ours) through the governor's config table. (2) D-98, the tasks table on the gathering queue's shape, C-18.5's
grammar bounds and the quoted-data exporter, so authority-undetermined
captures land in a project manager's inbox instead of a count nobody reads.
(3) D-102 and D-103, the small ones: the wizard binds INSTANCE_NAME, and
governorstate/governorconfig get control-plane ops. (4) If time remains, start
D-91 (PDF link annotations first, unpdf second) or plane adoption of the
volatile digest (D-60); measure bundle size against the 3MB limit before
believing either fits. (5) Push, appending to DEBT.md and MEASUREMENTS.md,
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

## Open, and named

**D-94's clock still ticks.** Admission rests on being unrecognised. The
allowlist ask now carries a measured, specific claim: a named civic agent, a
resolving contact, and a component ladder showing exactly what we send and why.

**D-98 blocks the authority ruling's landing.** Undetermined captures exist on
the live instance now; nothing routes them to a person.

**Design only, not built:** WARC and Memento interchange (D-99's remainder),
PDF structure extraction (D-91), the volatile digest in the plane (D-60),
monitoring contracts (D-65), cascade planting, the objective object type.
