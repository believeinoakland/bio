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

Then read, in this order: `docs/development/UI-PLAN.md` — **its FRONT MATTER first,
which says rung by rung what is BUILT and which of its own sections will mislead
you; the body is the 2026-07-28 plan and is stale as a statement of state** (this
line read *"U1–U8 are DONE"* until 2026-09-14, when UI-58 measured eleven of
fourteen rungs built; the standing-dependencies section still names plane defects
that make the link surface tell a member something untrue, and it carries no
dispositions) — then **the newest `docs/development/CIVICOS_UI_STATE.md` entries,
which are the area's log and are where your own goes**, `docs/development/DEBT.md`,
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

**Land tested code on `main` through the train (push `land/ui/<topic>`, M0-111); do not cut plane
releases.** The move to parallel
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

## Where the area's log lives, and why this file no longer holds it

**Rewritten 2026-09-14 by UI-59. This file is REWRITTEN EACH SESSION, not appended
to** — `kickoffs/README.md`, "One kickoff per THREAD": a session reads its thread's
file at the start and *"at the close rewrites only that thread's file."* Between
2026-08-08 and 2026-08-10 seven UI items appended their session log here instead:
UI-50's decision block and per-item blocks for UI-42, UI-45, UI-44, UI-53, UI-54 and
UI-55, each correctly labelled *"append, not a rewrite: other UI workers are live"*.
**Each of those appends was the right call on the day and the wrong file for the
result.** Concurrent UI workers made rewriting this file unsafe, so the log went
where it was safe to write rather than where it belonged — and the safe file is the
one whose own rule guarantees it is eventually overwritten. 380 of this file's 531
lines were that log.

**All seven blocks are MOVED, not deleted.** Their substance is in
`docs/development/CIVICOS_UI_STATE.md` at `v87` (UI-55), `v86` (UI-54), `v85`
(UI-53), `v84` (UI-44), `v83` (UI-45), `v82` (UI-42) and `v80` (UI-50, including the
decision item that is still Bob's and is still open). That ledger is **prepend a new
entry, never edit an existing one**, so it is exactly as safe to write concurrently
as an append here was, and it is the file `UI-PLAN.md`'s own front matter names as
what the plan is *"logged against by"*.

**So the rule for a UI worker, stated once:**

- **Your session log goes in `CIVICOS_UI_STATE.md`, PREPENDED**, one entry per
  landed surface change, its first line carrying the date and the thread name so a
  version collision with a concurrent worker is still readable. Name your landing
  commit and say which surface moved.
- **This file carries what the NEXT session needs to START** — what the area owns,
  how a session opens, the plan, the deploy discipline, the standing knowledge. It
  is state, not history. If you find yourself writing *"what landed"*, you are
  writing in the wrong file.
- **A decision that is Bob's goes in your turn's decision items** in the shape
  `kickoffs/README.md` defines, and — because a note in a region nothing drains is
  not even a note — **anything owed by a future actor goes in a DELEGATION or a
  QUEUE row, never only in prose here.**

## The state of the ladder, as of 2026-09-14

Measured by UI-58 and carried here so a starting session does not have to re-derive
it. `UI-PLAN.md`'s body marks eight rungs DONE; the true state is **eleven of
fourteen BUILT** — U1 through U10 and U12 — with **U11 PART-BUILT** (the roster,
capabilities and invitations are built; key fingerprints and the doorbell are
ABSENT), **U13 GESTURED** (two mobile media blocks give a viewing shell; no parity
rung exists and Bob's phone test is unrecorded) and **U14 ABSENT** (two `aria-`
attributes in 18,736 lines; no keyboard or screen-reader audit, no pagination or
virtualization, no recorded token rotation).

**`UI-PLAN.md`'s body is accurate as a statement of INTENT and stale as a statement
of STATE, and its front matter says so field by field.** Read the front matter
first. Two of its Incomplete entries will actively mislead you if you read the body
alone: the *"Development is PAUSED for consolidation"* section forbids new
capability until a step that is still open, and fifty-seven UI items added
capability continuously after it; and the *"Standing dependencies"* section is
dated 2026-07-29/30 with no dispositions, at least one contradicted by the debt
register. **Where `UI-PLAN.md` and `QUEUE.md` disagree, the queue is the authority on
what was BUILT and the plan is the authority on what the PLAN was.**

**The unrowed residue is `UI-60`** — U13, U14, expertise and licences, verified
export, the doorbell, plus UI-43's undrained version acts. It is a POINTER row and
is deliberately not slot-eligible while content is the priority; decompose it into
scoped rows at the area's next activation rather than working it as one item.

## What a UI worker should know before touching `app.html`

**`civicos-ui/app.html` IS SHARED GROUND AND SEVERAL UI WORKERS MAY BE LIVE IN IT.**
Claim it BY SITE, never by file: name the region markers, the `SURFACES` keys and the
individual functions you will touch, and say explicitly which marked regions you are
NOT touching. Every UI claim in `CLAIMS.md` from UI-42 on is written that way, and
that is what let five workers share the file in one week without a conflict.

**The surface registry and the two vocabulary guards will catch you before review
does, and that is their job.** A new router must be classified in
`preauth-vocabulary.test.mjs` WALK 2; a new surface must have its `SURFACES` key and
its `ACTS_AWAITING_SURFACE` row struck in the SAME commit that surfaces the act
(`surface-registry.test.mjs` ARM A4c); and any sweep asserting the analyst's
vocabulary reaches no member must **import `civicos-ui/test/analyst-vocabulary.mjs`
rather than write a list** — `analyst-vocabulary.test.mjs` ARM C is a census that
fails on a new private ban pattern, because a fourth list coming back silently is
exactly how that defect happened.

**Three standing rules the area has paid for, each recorded against the entry that
earned it.** *Delete the false sentence; do not write a better one* — render the
record's own words or render nothing (`v73`, `v72`, `v74`). *An act with no call site
is not a built act* — this area has shipped one three times (`v50`, `v45`, `v76`).
*A control the record cannot honour is worse than no control* — ask what identity the
act is keyed on and whether THIS item carries it, never what kind it is (`v83`).

**`npm ci` IN `bio-plane/` BEFORE YOU MEASURE ANYTHING.** A fresh worktree has no
`bio-plane/node_modules` and three UI suites drive the real plane through miniflare,
so the harness reads 43 pass / 3 fail, exit 1, and **that looks exactly like damage
your own change did.** Two workers hit it independently on 2026-08-10. Run
`node civicos-ui/test/run.mjs` FROM THE REPO ROOT and read the exit status unpiped.

## Decisions for Bob

**One, and it is UI-50's, still open and still his** — the full item is at `v80` in
`CIVICOS_UI_STATE.md`, moved there from this file where it had sat since 2026-08-08.
In one line: the lookup that wrote a wrong *"changed from"* sentence into new bundles
is FIXED, so the set has stopped growing, and **the bundles that already carry one
are deliberately untouched** (D-256) pending his ruling on whether the correction
lands as an appended revision in each affected bundle or as one published report. The
recommendation on the row is to run the ENUMERATION first, which needs no ruling at
all, and to rule with the size of the *provably wrong* set in front of him. Nothing
about this gets more expensive with time.

**Nothing from UI-59 itself.** It moved prose between two files the repository
already told it to use, and every judgment it made — which items owe an entry, where
the backfill sits, what the kickoff keeps — is settled by `kickoffs/README.md` and
`CORPUS-STANDARD.md`.
