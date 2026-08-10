# The retired runtime, as `BIO_Technical_Architecture_Decisions_v10` described it

**Moved here 2026-08-10, verbatim and unedited, on Bob's instruction that the retired
substrate be removed from the architecture record.** Every section below was written
about a runtime that no longer exists: a hosted document-store substrate with a per-group
scripted endpoint runtime, retired July 2026 and replaced by a Cloudflare Worker plus a
Durable Object with SQLite and R2.

**This is a record of what those sections concluded, and it is not corrected in place.**
The reasoning that outlived the runtime stayed in the live document, restated in terms of
the property rather than the vendor; what is here is the mechanism, the deployment
history, and the worked examples. Read it for what it teaches — several of these
admissions are the clearest worked examples of the constrained-endpoint criteria the
record has — and never as a description of anything running.

**Where each piece came from, and what replaced it in the live document:**

| here | was | what stayed live |
| --- | --- | --- |
| the v5–v10 revision log | `§0` | one paragraph naming what the revisions recorded, and a pointer here |
| the Phase 1 client as built | `§8.4` | the one-check-codebase law, the scan-equals-gate law, and the honest-null rule |
| three technology-stack rows | `§9` | the substrate-neutral properties that governed the choice |
| the endpoint transport findings | `§10.4` | *the caller shape is part of the endpoint contract* |
| the registry of ten operations | `§10.4` | the registry discipline, three admissions that generalize, and the unadmitted candidate class |
| the deployment-authorization discipline | `§10.4` | the failure posture: refuse per locator, record honestly, write nothing, leave the condition standing |
| the sequence-uniqueness non-invariant | `§10.8` | *the full id is the identity; a hint field carries no invariant* |
| the promotion gate's deployment lag | `§10.11` | *a guarantee the store states must be enforced by something the store controls* |

**The runtime's source has its own archive note** — `docs/archive/apps-script-README.md`
— which records what was extracted from it before it went and what its credentials were.

---

## From `§0` — the revision log, v5 through v10

**Revision note (v10).** Supersedes v9. Ratifies the P2 M2' daemon
completion state at bio-bundle rev 0.1.48 (accelerator 0.10.2,
bio-checks 1.9.0, client 0.7.0), folding the M2' daemon admission slate,
the July 19 live-fire findings, and the operator decisions of July 20.
(a) Section 10.4's registry flips monitor-tick, sweep, and
deadline-recheck (duescan) from candidate to deployed, each live-fire
verified in production on July 19, 2026, and admits member
creation-by-packaging as a write-package capability extension per its
admission note (endpoint-admission-m2b-member-creation.md), deployed at
accelerator 0.10.2. (b) New Sections 10.7 through 10.9 record the
operational models the live fire validated: the interruption model
(manifest-last durability, cascade-before-change ordering, self-expiring
claims, recovery by inflight completion), daemon concurrency
(claim-serialized creation-capable operations, sequence uniqueness
deliberately not an invariant), and fail-closed index integrity (missing
versus failure, degraded-index behavior). (c) New Section 10.10 states
the manifest contract: created is real UTC, author names the deciding
member on authority-bearing writes, and skill_version is the writer's
component version. (d) New Section 10.11 records the promotion gate
posture decided July 20 on the operator's word: the embedded gate runs
at promotion for non-mechanical manifests, implementation queued at
accelerator 0.10.3. (e) Section 7 gains 7.6 (the gathering contract:
locators as ordered fallbacks, one document per request, unknown cadence
defaulting to monthly) and 7.7 (attestation in production: SPN anonymous
mode, the RFC 3161 freetsa fallback with digicert failures recorded, the
CA caveat, and the coming M3' asymmetry for unfetchable member-submitted
documents). (f) Section 7.1 records the proven mechanical source
classes: Socrata full-file exports and Granicus Legistar REST. (g)
Section 10.4's deployment posture gains the OAuth deployment discipline
by reference to DEPLOY-P2M2.md Section 2a. Companion references update
to include BIO_Intake_Doctrine v1.0.

**Revision note (v9).** Supersedes v8. Ratifies the Phase 1 completion
state at bio-bundle rev 0.1.29. (a) Section 10.4's registry folds in the
two Phase 1 admission drafts, the client caller-class slate (list, read,
write-package; drafted July 16) and reindex (drafted July 17); all four
operations are admitted and deployed, live-fire verified through the
July 17-18 deployment trip including the operator's end-to-end write,
and both draft files are superseded by this folding. The status
operation's bundle-selector probe, added during the M4 live-fire
postmortem, is recorded. (b) Section 8 gains 8.4, ratifying the Phase 1
client's settled decisions from the client's decision record
(CLIENT.md): in-repo placement importing bio-checks by relative path,
the two-table mirror schema, and Netlify hosting. (c) Section 10 gains
10.6, recording the VERSIONS.json tree-coherence discipline (adopted at
rev 0.1.16) as a decision. (d) The v8 browser-reachability finding is
upgraded from verified-in-browser to live-verified: the client's
live-fire sync, write, and reindex all ride native /exec CORS within
simple-request rules. (e) The registry's candidate list gains two named
candidates with recorded trigger conditions, batched multi-file read and
read-class log batching; the routine candidate list otherwise stands
empty, with the monitor tick and sweeps pending their Phase 2 consuming
components and headless dispatch pending Section 12. Companion
references update to State Rules v1.4 and Bundle Skill Composite Design
v1.6.

**Revision note (v8).** Supersedes v7. Records two operational findings
from the July 11 accelerator deployment and conformance work, both
binding on Section 10.4's deployment posture. (a) URL capture: inside
the Apps Script editor, getService().getUrl() returns the head
deployment's /dev URL, which demands Google sign-in and which no AI
session can invoke; setup therefore resolves the published /exec URL by
strict precedence (an explicit proxy URL, then the WEBAPP_EXEC_URL
script property the operator sets from Manage deployments, then the
service URL only when it already ends in /exec) and never writes a /dev
URL into any caller credential block; code changes republish as a new
version on the existing deployment, which keeps the URL stable. (b)
Browser reachability: /exec responses carry Access-Control-Allow-Origin:
\* on both the 302 redirect and the final hop, so simple cross-origin
GETs succeed natively from any browser origin, while preflighted
requests fail on a 405 OPTIONS response; callers must stay within
simple-request rules (plain fetch, every parameter in the query string,
no custom headers), which the endpoint contract already enforces.
Verified in a live browser on July 11. This closes the Phase 1
reachability question and covers natively the CORS role once assigned to
the discarded proxy worker.

**Revision note (v7).** Supersedes v6. Ratifies two decisions carried in
prototype as pending. (a) Section 10.4's endpoint registry is updated to
record the operations admitted and exercised during the July 10-11
deployment: the promotion endpoint (drains the queue), the status
operation (read-only health: version, configuration, trigger state,
queue depth), and the selftest operation (packages and promotes one
update in a single designated scratch bundle from standing intent,
hash-verifying the result). All three were live-fire verified against
the deployed CivicOS accelerator. A development-only companion (a
deletable second script file granting path-addressed read/write/delete
plus trash and trigger-tick, guarded by a dead-man expiry and reported
by the status operation's devMode flag) is recorded as an explicitly
temporary, non-production capability, not a registry member. (b) Section
10.5 is added, ratifying the two-tier secret-management scheme. The
permitted-use question (Section 12) remains genuinely open, as it turns
on Anthropic's external subscription terms rather than any BIO decision;
the headless-dispatch endpoint candidate stays blocked on it.

**Revision note (v6).** Supersedes v5. Section 10.4's deployment posture
gains the invocation-token discipline: endpoints deploy with "anyone"
access so AI sessions can invoke by plain fetch, layered with
per-caller-class bearer tokens that are honestly scoped as a
quota-and-attribution mechanism, never a security boundary (integrity
rests on store-authoritative semantics and cannot be strengthened by
identifying callers). Verification is strict rather than lazy (the check
is free, the work costs quota, and rejection is safe because endpoints
are non-load-bearing); replay defense is deliberately omitted
(idempotence makes replays no-ops); tokens live in Script Properties and
caller-side config, never in the mirrorable store; and every invocation
is logged to a non-authoritative operational log whose anomalies the
checker surfaces as findings, per Operational Principle 8.

**Revision note (v5).** Superseded v4. Added Section 10.4, recognizing
constrained endpoints as a capability class available throughout the
workflow: server-side Apps Script endpoints under store-authoritative
invocation semantics, admitted individually through a closed registry,
overcoming connector capability limits without reopening the no-backend
boundary. The promotion endpoint (Bundle Skill Composite Design v1.4,
Product D) is the registry's first admitted member. Section 12's
permitted-use question gained the headless-dispatch endpoint dependency.
Companion references updated to State Rules v1.1 and the Bundle Skill
Composite Design.

---

## From `§8.4` — the Phase 1 client, as built

## 8.4 The Phase 1 client, as built (added v9)

The Phase 1 PWA shipped all six ladder rungs (client 0.6.2; the decision
record is bio-bundle/client/CLIENT.md, which this section ratifies).
Three architectural decisions:

-   **Repo shape.** The client lives at bio-bundle/client/, a sibling of
    > checks/ and accelerator/, importing bio-checks source directly by
    > relative path. No copied checks artifact exists anywhere: a copy
    > is a second codebase the moment the original moves, and the client
    > scan must byte-match the gate, so the one-check-codebase law
    > decided this. VERSIONS.json carries a client entry asserted by
    > check-versions.

-   **Local schema.** Two Dexie tables, decided against actual consumers
    > rather than speculation: bundles (primary key id, indexed by root)
    > holds the parsed render model; files (compound key bundleId plus
    > path) holds the byte-faithful string mirror, whose one indexed
    > read reconstructs exactly the file map the gate's collector feeds
    > checkBundle, so the browser scan and the node gate consume
    > identical input. The store stays authoritative; both tables
    > rebuild from ingest at any time and the app tolerates their
    > absence.

-   **Hosting.** Netlify, from the three acceptable static hosts of
    > Section 9, chosen for lowest operator friction; the build uses a
    > relative base so the bundle is statically hostable and mirrorable
    > from any path. Freely reversible; nothing downstream depends on
    > it.

As built, the client carries: folder and zip ingestion; the docket and
bundle detail; the consistency sidebar running checkBundle itself
through three adapters (WebCrypto hashing, a Set-based reference
resolver, character-identical report formatting); the live mirror over
the Section 10.4 endpoint slate with client-side hash verification that
aborts loudly on mismatch; the gated Editor, whose Submit enables only
on a local gate PASS and whose Edit is offered only on a docket freshly
synced from the live endpoint (demo, local, and mirror-restored stores
are read-only by construction); the client promoter, byte-identical to
the reference implementation and carrying the I-17 divergence ladder;
and local index regeneration with substrate locators honestly null,
since the browser never touches Drive.

**Decision.** The Phase 1 client's three architectural choices, in-repo
placement importing bio-checks by relative path, the two-table mirror
schema reconstructing the gate's exact input, and Netlify hosting, are
ratified as recorded in CLIENT.md. The client is a caller class of the
Section 10.4 registry and a packaging-mode writer under the Design
document's write protocol; it holds no Drive credential and nothing in
it is load-bearing to kernel correctness.

---

## From `§9` — the three technology-stack rows that named the substrate

```
  Bundle substrate                    Google Drive folders
                                      (multi-format), with git or OSF as
                                      mirror/resilience alternates. Not
                                      Google Sheets, and not Sheets as
                                      any central surface. Substrate
                                      locators never link objects
                                      (Section 3).

  Hosting / ops                       A static host (Cloudflare Pages,
                                      Netlify, or GitHub Pages), git for
                                      versioning and the mirrorable
                                      directory, and a skill-assembler.

  Constrained endpoints               Google Apps Script, per group,
                                      under Section 10.4's admission
                                      criteria only. Off-kernel, never
                                      load-bearing.
```

---

## From `§10.4` — the two transport findings

-   **URL capture (added v8).** The editor's getService().getUrl()
    > returns the head /dev URL, sign-in walled and unusable by AI
    > callers. Setup resolves the published /exec URL by strict
    > precedence: an explicit proxy URL, then the WEBAPP_EXEC_URL script
    > property set once from Manage deployments, then the service URL
    > only when it already ends in /exec. A /dev URL is never written
    > into any caller credential block, and republishing is a new
    > version on the existing deployment, which keeps the URL stable.

-   **Browser reachability (added v8).** /exec responses carry
    > Access-Control-Allow-Origin: \* on both the redirect and final
    > hops, so simple cross-origin GETs work natively from any browser
    > origin; preflighted requests fail on a 405 OPTIONS response.
    > Callers stay within simple-request rules: plain fetch, every
    > parameter in the query string, no custom headers. Verified in a
    > live browser on July 11, and live-verified in use during the Phase
    > 1 deployment trip (July 17-18): the client's sync, package writes,
    > and reindex all ride native /exec CORS within simple-request
    > rules. This constrains the PWA client invocation shape and covers
    > the CORS role once assigned to the discarded proxy worker.

---

## From `§10.4` — the registry of ten operations, and the deployment-authorization discipline

**The registry (updated v10).** Admitted and deployed, ten operations,
each live-fire verified against the deployed CivicOS accelerator: (1)
the promotion endpoint, which drains the pending-package queue via the
convergent promotion algorithm (Bundle Skill Composite Design, Product
D); (2) the status operation, read-only, returning script version,
configured state, trigger installation, and pending-queue depth, bounded
to information any group member may see, extended during the M4
live-fire postmortem with an optional bundle selector returning a
locate-only probe (roots seen, read-side and write-side resolution
results, no write verbs); (3) the selftest operation, which packages and
promotes one update in the single designated scratch bundle
INFO-2026-0098-accelerator-selftest entirely from server-side standing
intent and hash-verifies its own result, bounded to that one bundle; (4)
list, which enumerates bundle IDs grouped by type root, or one bundle's
file listing as relative path, size, and modified time, cheap metadata
only, no content reads and no server-side hashing, read-only by
construction with selectors validated against the ID grammar and listing
rooted inside the type roots so the credential sibling folder is
unreachable; (5) read, which returns one store file's content as a plain
UTF-8 JSON string with its sha256 and an encoding field, a deliberate
divergence from the dev companion's base64 shape because the store is
text-only by construction and base64 inflates the compressed wire by
roughly half while breaking symmetry with the text/plain write path;
read serves live files, \_history, and pending files alike, since the
client checker needs pending visibility and read exposure of pending
content is no wider than of live content; the admission records honestly
that a leaked client token grants read access to the store, acceptable
only because the store is designed to mirror, fork, and distribute and
the two-tier secret rule of Section 10.5 keeps every secret out of it;
(6) write-package, the client-to-queue transport: one text/plain POST
per file with selectors in the query string, package files first and
PENDING_PROMOTION.json strictly last, mirroring the commit-point write
order so a partial delivery is an inert set of .pending files surfaced
as orphaned-pending findings; the load-bearing constraint is that the
endpoint accepts writes to pending paths only (names ending .pending
plus the literal manifest name, inside the selected bundle) and rejects
every other path naming the constraint, which preserves promotion as the
sole writer of live state; the endpoint parses nothing and judges
nothing, a byte pipe to a constrained path; amended at accelerator
0.10.2 with member creation-by-packaging
(endpoint-admission-m2b-member-creation.md, live-fire verified July 19,
2026 through the first production Focus and Project bundles):
writePendingText creates an absent bundle folder under its type root for
pending-path writes, with the id grammar holding at the POST boundary,
nothing going live without gating and promotion, orphans remaining
C-16.4 findings, and a threat delta of nil, since a leaked write token
trades queue litter for folder litter, the same cleanup class; (7)
reindex, which regenerates index/index.json by scan with zero caller
inputs, the store-authoritative criterion in its strongest form, its
writer confined by construction to exactly that one path and its output
deterministic at fixed time so racing invocations converge
byte-identically; (8) monitor-tick, which runs the Section 7.4
change-detection duties on due gathering requests and monitored bundles
as a mechanical writer under the Section 10.8 claim discipline:
first-capture creation at collected with the intake register, ring-once
hash dedup as corroboration, change detection under the declared field
set with an accretive register entry and change record, the one-hop
set-but-never-clear cascade, the 72-hour removal confirmation window,
and the Section 7.7 co-attestations, admitted per the ratified daemon
slate (endpoint-admission-m2-daemon-slate.md) and live-fire verified in
production July 19, 2026, including the unattended completion of the
Legistar chain after session close; (9) sweep, built to its admission
and deployed inert at budget zero with no ratified sweeps, its recorded
no-op live-fire verified the same day, creation-only at collected behind
the ratification fence when a sweep is ever ratified; and (10)
deadline-recheck (duescan), whose clock pending-to-overdue flip is the
single legal mutation and whose due slate was live-fire verified against
the open gathering requests. Operations 4 through 6 were ratified from
the client caller-class admission slate and operation 7 from the reindex
admission draft, both superseded by the v9 folding; operations 8 through
10 were ratified from the M2' daemon slate as amended at operator
review, superseded by this folding. Live-fire record: promotion, status,
and selftest on July 10-11, 2026; list, read, write-package, and reindex
through the Phase 1 deployment trip of July 17-18, 2026; monitor-tick,
sweep, deadline-recheck, and creation-by-packaging through the July 19,
2026 production live fire at accelerator 0.10.0 through 0.10.2, whose
findings are recorded in Sections 10.7 through 10.9. The registry is
enforced as a closed whitelist checked before dispatch; an unknown
operation is rejected naming the valid set. The development-only
companion (promotion-service-dev.gs) remains recorded as explicitly
non-production and outside the registry, dead-man expired after
2026-08-31, deleted before production deployment, with devMode false
verified in production. Candidates: batched multi-file read and
read-class log batching keep their recorded trigger conditions from v9
(admitted only if measured sync latency or per-call log cost at
production volume demands them; until a trigger fires, each stands as a
recorded decision not to admit). Candidate class requiring extra
admissions: headless dispatch (reads a standing goal from the store and
initiates a budgeted headless session); it additionally requires a
budget guard recorded in store policy and inherits the permitted-use
open question of Section 12, and until it resolves, unattended discovery
beyond store-named sources stays out of scope.

**OAuth deployment discipline (added v10).** A paste alone never widens
the project's OAuth grant, and the first revision to call a new Google
service will refuse at runtime with a healthy-looking deployment. The
discipline, learned in the July 19 live fire and recorded operationally
in DEPLOY-P2M2.md Section 2a, which this document incorporates by
reference: pin the full scope inventory explicitly in the
appsscript.json manifest rather than trusting auto-detection to
re-prompt; when no consent dialog appears after a manifest change, the
stored grant is stale-broken and must be revoked at the account's
connections page and re-granted, which touches neither code, deployment,
URL, nor token; and diagnostic probe functions must not end in an
underscore, which the editor's Run dropdown hides. The slate's failure
posture is part of the architecture: an unauthorized fetch layer refuses
per locator, records the refusals honestly, writes nothing, and leaves
the due condition standing, so authorization failure is visible and
recoverable rather than silent.

---

## From `§10.8` — sequence uniqueness as a deliberate non-invariant

**Sequence uniqueness is deliberately not an invariant.** Drive offers
no atomic counter, so two executions indexing the store mid-flight can
allocate the same sequence number; the full bundle id (type, year,
sequence, slug) is the identity, the sequence is a hint, and no
invariant claims sequence uniqueness. The production store carries the
worked example: two deliberate collision pairs (sequence 0100 from the
launch race, sequence 0106 from the pre-0.10.1 concurrency window),
different slugs, different folder names, no collision in identity, all
four bundles gated and promoted. Claim serialization has since made
recurrence unlikely; the tolerance remains the rule because the
substrate cannot promise more.

---

## From `§10.11` — the promotion gate's posture and its deployment lag

Through accelerator 0.10.2 the embedded gate runs only for
daemon-authored packages at packaging; the promoter hash-verifies every
package against its manifest but assumes non-mechanical payloads were
gated by their producing surface. With creation-by-packaging admitted,
an ungated malformed member package can reach live state, and the
store's integrity guarantee is weaker than this document implies.
Decided July 20, 2026 on the operator's word: the embedded gate is wired
into promotion for non-mechanical manifests. The gate already lives in
the endpoint through the Section 10.4 embed mechanism; the cost is
promotion latency, which is tolerable; and the client-side gate remains
the first line per the Mechanical Verification Law, with the
promotion-time gate as the store's own enforcement rather than a
substitute for producer discipline. Mechanical manifests remain gated at
packaging, where the daemon already runs the same embedded gate.
Implementation is queued at accelerator 0.10.3 with battery coverage for
creation-by-packaging riding the same change; until that paste lands,
this section is the recorded decision and the deployment lag is stated
here rather than papered over.
