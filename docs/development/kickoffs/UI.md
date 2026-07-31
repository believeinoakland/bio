# Area UI: the member-facing application

Refreshed 2026-07-31 to the parallel-development model (`PARALLELISM.md`,
`CLAIMS.md`, `INTERFACES.md`). The old paste-ready kickoff block and its three
grant slots are gone: a session no longer carries secrets in its prompt, and
`CLAUDE.md` plus this file are everything it needs to start. The plan below — the
framework-consolidation steps — is UI's own and is unchanged.

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
