# Area UI: the member-facing application

Refreshed 2026-07-31 to the parallel-development model (`PARALLELISM.md`,
`CLAIMS.md`, `INTERFACES.md`). The old paste-ready kickoff block and its three
grant slots are gone: a session no longer carries secrets in its prompt, and
`CLAUDE.md` plus this file are everything it needs to start. The plan below — the
framework-consolidation steps — is UI's own and is unchanged.

**Coordination:** before making a change another session must know about, read
`docs/development/ORCHESTRATION.md`, "COMMUNICATING A CHANGE" — the channels, which
carries what, and the receipts for every way a correct change reached nobody. Claim
in `CLAIMS.md` before editing; publish before you call anything done.

## What this area owns

`civicos-ui/**` and `docs/development/UI-PLAN.md`. Reading the plane's ops, the
docprofile, and the architecture docs is expected; changing them is not. UI
CONSUMES the op contracts (I3) and, through the plane, the capture interface
(I1, `INTERFACES.md`).

## How a session starts now

1. **Read `CLAUDE.md`** — the standing rules for every session — then this file.
2. **Claim UI in `docs/development/CLAIMS.md`** before editing, naming the paths.
   A claim keeps other sessions out of them. If you need a change inside another
   area's claim, append a DELEGATION entry and continue with your own work; do
   not edit their paths.
3. **Work in a worktree**: `claude --worktree UI`. One session per worktree.
   `.env` is carried in by `.worktreeinclude`, so credentials are present without
   anyone pasting them.
4. **Credentials come from `.env`**, never from a chat message and never
   committed. The Cloudflare deploy token, the member token for post-deploy
   verification, and the account id are all there. `tokens.mjs` denylists any
   token published in the repo and treats it as NOT SET, so committing one
   revokes it.

Then read, in this order: `docs/development/UI-PLAN.md` (the plan of record; U1–U8
are DONE and the standing-dependencies section names the plane defects that make
the link surface tell a member something untrue), the newest
`docs/development/CIVICOS_UI_STATE.md` entry, `docs/development/DEBT.md`,
`docs/development/LINK-FIDELITY.md`, and `civicos-ui/test/run.mjs` (the UI test
path). The parenthetical is why, not a summary; read the document.

## The plan (UI's own)

In order, and the ordering is binding. Each step is finished only when something
CONSUMES its output; that rule is why an earlier session produced 1,463
unconsumed lines.

(0) Read `docs/architecture/BIO_Content_Framework_v0_10.md` before anything else,
then `docs/architecture/CONSTRUCTS.md` for the evidence behind it. The framework
is the shape the code should take; the inventory is why. Note §2, the invariants,
and §9, the cost of absorbing a new stack, content type, connection rule or AXIS:
that table is the specification, and a change that raises one of those numbers
needs to justify itself. Bob's framing, which corrected mine: we have NOT
discovered enough and will keep discovering for a long time, so the framework
exists to make the next surprise cheap rather than to be complete. Also read
UI-PLAN.md's "Who this is for": the audience is non-technical and the workflow
exists to keep members out of logistics, so technical complications get
classified by the system and never surfaced as choices. The suite carries a
vocabulary guard over member-facing strings.

(1) STEP 0 of the plan in CONSTRUCTS.md, and nothing else until it is done. Bob
ruled that this is the FULL version and not a deduplication: "we must do the work
upfront in order to end up with the results we need." So implement framework §4,
one recogniser interface and one registry helper, with both existing axes
rewritten onto them. The test of whether it worked is that Step 4, the entity
axis, costs a registry. Concretely: one confidence ladder rather than
`CONFIDENCE` and `TYPE_CONFIDENCE`; one entry point, `assess()`, with `monitor()`
and `compare()` made internal; one diff, `diffEntities`, with `diffMembers`
deleted; `CONTRACT` declared by the content type rather than derived from the
stack handler; a shared catalogue of event types instead of ad hoc strings inside
one content type; `meaningful` derived from `SIGNIFICANCE` rather than carried
separately. This step should shrink the codebase. Do not add capability while
doing it.

(2) STEP 1: the plane records the profile. `op=acquire` calls `identify()` and
`doctypeFor()` and writes handler, content type, both confidences, signals and
what was normalised onto the capture. Roughly twenty lines and everything else
depends on it: without it, no verdict computed later can be re-evaluated when a
handler turns out to have been wrong. Consumer: the document page says what kind
of document the record thinks it holds. **NOTE:** this step writes to the capture
path, which is CAPTURE's ground and part of interface I1. It is a DELEGATION to
CAPTURE, not a UI edit — append the entry to `CLAIMS.md` and let CAPTURE land it,
or propose the field addition through `INTERFACE-CHANGES.md`, because a content
type promoted onto the capture is a change to I1's shape.

(3) Then Steps 2 through 7 in order, and treat the ordering as binding. Each step
is finished only when something CONSUMES its output. Do not start a new content
type until Step 6.

## Deploy discipline, and releases

**Land tested code on `main`; do not cut plane releases.** The move to parallel
development took the release out of every area's critical path: areas land tested
code continuously and **`DIST` batches plane releases** (`kickoffs/DIST.md`). If
your work needs a plane change shipped, land it green and hand it to DIST as a
DELEGATION — do not bump a version, sign, tag, or run `deploy.mjs` for the plane.

**Deploying `civicos`, the UI worker, is NOT gated and is yours.** It carries no
version number in the shared repo and contends for nothing, so there is no baton
and no DIST handoff for it. The discipline still holds: `node test/run.mjs` bare
and green, deploy, verify `/build` has converged before believing a probe (a
deploy verified is not a build serving — `CLAUDE.md`), then push source and docs
together.

**Verify in a UI instance's own scratch namespace**, never the real record, and
sweep after. Two sessions sharing one scratch namespace purge each other's
probes; a UI session's plane instance is `biosmoke-ui` (see below), separate from
CAPTURE's.

## The plane instance this area verifies against

`biosmoke-ui` — the reserved name for a UI session's own plane instance, so it can
live-verify against a real plane without colliding with CAPTURE's `biosmoke7`
scratch namespace. It belongs on account `20b533579290b9b93168345edd3b7f72`
(biocloudflare). Use it, not `biosmoke7`, for post-deploy verification.

**NOT YET PROVISIONED as of 2026-07-31.** Standing it up needs a biocloudflare
deploy credential that is not present in this checkout: there is no `.env`, and
the only Cloudflare login available points at a different, personal account. The
instance must not be created anywhere but biocloudflare, so it is reserved by name
and left unprovisioned rather than stood up in the wrong account. It becomes live
once the credential is in `.env`; until then a UI session verifies against
whatever instance Bob names.

## What this area should know without being told

**Numbers come from `MEASUREMENTS.md`, never from memory or a vendor's docs
table.** A number in the source that nobody measured is a guess wearing a
constant's clothes, and that has already cost this project two wrong constants.

**A Worker cannot time itself.** Cloudflare freezes `Date.now()` during
synchronous execution, so any millisecond figure measured inside a Worker is a
fabrication. Count work, not time (`bio-plane/src/cpu.mjs`).

**Source access: BIO does not disguise its requests.** `SOURCE-ACCESS.md` has the
evidence and the standing position; a system whose subject is provenance does not
lie about who is asking.

**Bob's standing rulings** are collected in `kickoffs/CAPTURE.md` under "Bob's
rulings, already made". Several are cross-cutting and bind this area too,
particularly that `undetermined` is first-class and must be stated, and that the
audience is non-technical and never made to choose between technical options.

**Close the turn with the decisions that are BOB'S, and nothing else**, in the
shape `kickoffs/README.md` defines. Read its three tests before writing an item.
An empty list is a real answer. At the close, rewrite ONLY this file for the
session after; append to `DEBT.md` and `MEASUREMENTS.md`, prepend to
`CIVICOS_UI_STATE.md`.

## Decisions for Bob — appended 2026-08-08 by UI-50 (append, not a rewrite: several UI workers are live)

**ONE ITEM. THE SENTENCES ALREADY WRITTEN.**

- **What runs NOW, provisionally.** UI-50 fixed the lookup, so no NEW bundle can
  be written with a wrong *"changed from"* sentence. **The bundles that already
  carry one are left exactly as they are, and the correction is DEFERRED to a
  ruling rather than made by a worker.** Nothing has been rewritten and nothing
  has been marked. The defect is enumerated as **D-256** (renumbered from a colliding D-236 by CONDUCT 2026-08-08) so it cannot be lost.
- **Why it was genuinely ambiguous.** The record is append-only and *correction
  moves forward* (DEC-19), so the false sentence in a bundle body cannot be
  edited away — but leaving it unmarked means the record keeps asserting
  something it cannot support, which this project ranks as worse than a missing
  feature. Both halves of the doctrine point in opposite directions here, and
  choosing between them is a statement about what the record MEANS.
- **The alternative, stated fairly.** Append a correction to each affected
  bundle: a new revision saying, in the record's own voice, that the earlier
  sentence was composed by a lookup that returned the oldest version at the
  address and that the version which actually preceded this capture is `<X>`.
  The original sentence stays in the body, visibly superseded rather than
  removed. That is the fuller correction and it is entirely within DEC-19; it
  costs a write to every affected bundle, and it needs an AUTHOR, because a
  machine appending a correction on nobody's behalf is the shape DEC-54 (c)
  warns about.
- **Recommendation.** Take the alternative, in two steps and in this order.
  **First the enumeration, which needs no ruling at all** — the affected set is
  findable (the sentence has one fixed literal shape) and every member is
  decidable today, because the capture is now in the register and
  `op=versionchain&at=` answers with the true predecessor for it. That report
  splits into *provably wrong*, *provably right* (one prior version, where the
  two routes cannot disagree) and *undetermined* (no chain rows), and those
  three must be reported separately or the report repeats the defect's own
  mistake. **Then rule on whether the correction lands in the bundles or in one
  published report**, with the size of the *provably wrong* set in front of you.
  A ruling made before that number exists is a ruling about an unknown.
- **What reversing it costs.** Reversing the DEFERRAL costs nothing today and
  gets no more expensive with time — the fix has stopped the set growing, and
  every affected bundle stays decidable as long as its capture is registered.
  Reversing the ALTERNATIVE, once correction revisions exist in bundles, costs
  the ordinary price of an append-only record: they cannot be removed, only
  superseded in turn. That asymmetry is the reason the enumeration comes first
  and the writing second.

## UI-42 landed 2026-08-09 — version review: rotation and diff (append, not a rewrite: other UI workers are live)

**What exists now that did not.** A surface of its own, `SURFACES["basis-versions"]`, addressed
`#versions/<INQ-…>` and `#versions/<INQ-…>/<name>`, living between
`/*__VERSION_REVIEW_START__*/` and `/*__VERSION_REVIEW_END__*/` in `app.html`. It reads
`op=basisversions` and `op=affordances`, hosts exactly ONE act (`versionhide`), and is driven by
`civicos-ui/test/version-review.test.mjs` (85 assertions) with a nine-arm negative control in
`civicos-ui/test/version-review.control.mjs`.

**Three things the next UI session should know before touching it.**

1. **ROTATION IS THE DIFF, AND THE MEMORY LIVES IN STATE.** `VREV.focus` is the reading in front of
   the member and `VREV.against` is the one they came from. The default focus is settled in
   `versionReviewLoad` and NOT in the renderer — it was in the renderer first, and the first
   rotation then compared against nothing, which is the member's first move being the one that tells
   them least. If you make the focus a derived value again, that regression comes back.
2. **THE ANALYST'S VOCABULARY IS READ AND NEVER PRINTED.** The record stores `relationship` as the
   token `and`/`or` and files each set of reasons under a member-authored label. The surface renders
   the CONSEQUENCE (*"fails only if ALL of these fail"* / *"fails if ANY of these fails"*, the
   elicitation's own two stems) and names a set by the reasons in it, never by its label. The
   fixture deliberately files one set under `"OR-branch: the ground partition"`, so a renderer that
   ever prints a label fails the sweep naming the phase and the word.
3. **HIDING SHRINKS THE DISPLAY AND NOTHING ELSE.** `op=basisversions` keeps returning a hidden
   reading and the surface keeps holding it; only the LIST is filtered, the count line says how many
   it is holding back, one control puts them back, and `#versions/<INQ>/<name>` opens a hidden
   reading directly with its rejection act intact. The negative control's arm 1 makes the load drop
   hidden readings — 10 of 85 assertions go red, five of them named ACTS PERSIST.

**What UI-43 and UI-45 inherit.** The two falsifier stems and the four state sentences are named
constants in this block and are pinned against UI-27's elicitation block and against the catalog's
`VERSION_MACHINE.legal`; reuse them rather than authoring a third spelling. The other five version
acts are still on `ACTS_AWAITING_SURFACE`, and `surface-registry.test.mjs`'s ARM A4c requires the
row struck in the same commit that surfaces each one.

**What this surface does NOT do, stated so it is not read as a gap.** It shows no strength, no grade
and no pair for any reading — PL-14's `op=versionstrength` exists and is deliberately not asked
here, because DEC-32 clause 5's ordering rule is that structure is read before strength is shown,
and a review surface that put a grade beside each alternative is the surface that invites choosing
by the number. It also names no `project`, so it renders no `current` (§7: a stance is the
project's, not the question's) — that half is UI-45's.

## UI-44 — the connections sidebar (DEC-52 final). Appended 2026-08-09, NOT a rewrite: UI-43 and UI-45 are live in the same file

**WHAT LANDED.** The connections sidebar on the running-session surface, as
`IS-BUILD-PLAN.md` UI-44 scopes it and DEC-52 (final, 2026-08-07) governs it:
connections the machine identifies land MACHINE-ATTRIBUTED and the sidebar is a
VISIBILITY and BULK-REVIEW surface, **not a required approval gate**. It is a new
region inside the existing `__AI_SESSION_*` block plus one expression in
`aiSessionPanelHtml`; the paths and the line-level detail are in `CLAIMS.md`.

**IT SHIPPED FIXTURE-VERIFIED, AND THAT IS THE FIRST THING THE NEXT SESSION MUST
KNOW.** No op publishes a machine connection. The post-processing task scope that
would produce one has no item and does not exist. What is verified is HOW THIS
SURFACE TREATS a machine-attributed connection; what is NOT verified is that one
exists to treat. The suite states it in its first paragraph, prints it in its
FOOT on every run, and — the part that matters — **MEASURES it**: SECTION 0 reads
`aiRunRead`'s own body out of `bio-plane/src/store.mjs` and fails the day the
producer lands, so the caveat expires by itself instead of being inherited.

**THREE THINGS THIS AREA SHOULD CARRY FORWARD.**

- **A D-82 DRESS IS NOT ONE SENTENCE FOR EVERY DERIVED THING.** The proposal
  badge says *nobody has yet decided this is worth pursuing… it changes nothing
  until a person acts on it*. That is TRUE of a proposal and FALSE of a
  connection the machine was licensed to rule on, which is in the record and
  which the record already stands on. Reusing it would have been cheap and would
  have made the surface lie in the safe-sounding direction. Two claims, two
  sentences, one rule: say what the record actually did.
- **ATTRIBUTION IS FOUND BY THE SHAPE OF A VALUE, NEVER BY A FIELD NAME OR A WORD
  LIST.** The surface asks the same question REC-46 made the plane ask once: did
  the CONTROL PLANE mint this identity. So a producer publishing the principal
  under a key nobody anticipated, nested inside an array, is still attributed —
  driven as the over-strictness arm. The two prefixes are the one thing copied
  from the plane, and `MACHINE_STAMP_PREFIXES` is imported LIVE and compared, so
  a third spelling fails the build here rather than un-attributing a machine.
- **THE ANTI-GATE ARM IS AN EQUALITY, AND IT IS THE STRONGEST THING IN THE SUITE.**
  Render with nothing selected and with everything selected; strip the selection
  controls; every word about what each connection is and who made it must be
  BYTE-IDENTICAL. A surface where review changed a connection's standing cannot
  pass it. Under the superseded provisional that arm would have been the opposite
  assertion — and it is corrected in place, with its date and its reversal
  written out, rather than deleted.

**ONE INSTRUMENT WAS CORRECTED IN PLACE AND IT WAS NOT THIS ITEM'S.**
`ai-session-wire.test.mjs` ARM S5 asserts *the surface renders nothing the record
did not publish*, over every function in the AI-session block. That is right
about the RUN — IS-6 publishes its own vocabulary — and it is the WRONG RULE the
moment the block hosts D-82's dress, which by definition says something the
record cannot say about itself. Left standing it would have made delivering D-82
fail the build. The replacement partitions by REGION MARKER rather than by a list
of names, falls back to sweeping the WHOLE block when the marker is missing (a
deleted marker fails loudly instead of widening the excuse silently), and requires
the held-out region to be graded by this item's suite. Same correction ARM C2 took
from UI-49, one arm over, and for the same reason.

**TWO THINGS THIS ITEM DELIBERATELY DID NOT ADD, because both are traps this area
keeps meeting.** No new ROUTER — the sidebar is reached at the `#session/<id>`
address that already exists, so nothing new needed classifying by
`preauth-vocabulary`. No new PLANE READ — the sidebar renders the run object
`op=airun` already answered, so there is no explicit ask to state and no applied
bound to report, and `bound-sweep`'s two walks see nothing new. Both were
choices, not omissions.
