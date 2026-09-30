# control-plane (T16)

**Status** · session_01Lo4UbhM2msU4EuN9zSJ4eS · depth 2 · WORKING · handled B4

## J1 · QUESTION

Readings I am building on now. Only (1) needs a ruling that may reach another module; (2) is for AFFORDANCES #8 to agree.

1. **R36's "a refusal of either leaves neither written" cannot hold strictly with capture's `pullKnock` as built.** `pullKnock` is async: it awaits the evidence store and the profile, then writes the receipt, the knock's `pulled` row and the actor in its own `record.transact`. record-core's `transact` is synchronous, so no caller can hold one transaction across the pull and the promotion. My reading, built now, in the record store's door (my `dispatch.mjs` composition, a route of mine beside capture's untouched `inboxpull`): (a) read the knock; (b) run the promotion first as a dry run inside `transact`, rolled back by a thrown sentinel, over the same package with a provisional document; its refusal answers and nothing is written (this is where a real refusal lands: no recorded group C-64.1, a mint exhausted, a malformed knock); (c) `pullKnock({knockId, by, at})`; its refusal answers and nothing is written (R65); (d) promote the real document in `transact`. The residue: only a store fault or a race between (b) and (d) leaves a pulled knock without its bundle; the answer then says so, and a repeat of the pull (capture answers `existed: true` with the stored document) promotes it, since the route promotes whenever `provenance.homeOf(sha)` finds no bundle holding the capture. Strict atomicity needs a seam in capture, e.g. `pullKnock({knockId, by, at, within})` calling `within(document)` inside its `transact` (a refusal rolls the pull back). Rule whether you want that seam (a CHANGE for capture) or accept the residue.
   The bundle: `INFO-<year>-NNNN-doorbell-knock`, `information@2` at `collected`, the puller's id as `author` (and the session's `actorIdentity`/`actorViewer`, as op=promote stamps them), `data/provenance.json` holding capture's document, the bytes as a blob at the document's `file`, one register row; capture-requests R38's shape. No contact anywhere (R70).

2. **The op table, for AFFORDANCES #8 (R3, R7, R12).** Mutating, both session sets, a `NEEDS` row: `inboxpull` (contribute; `classes` admin, member with `machineClasses: []`, so only a session reaches it: R65's member-session fence), `reattest`, `captureaccount`, `sourcedisclose`, `sourcelink`, `sourceconsent`, `sourceconsentwithdraw` (each contribute; classes admin, member, probe), `signerregister`, `signerrevoke` (null, as `signeradd`; session only: `machineClasses: []`). Reads, a `NEEDS` row null (K516's precedent, so each can be named in `NON_ACTS`): `knocksof`, `pulledknocks` (session only, `machineClasses: []`, R67/R72), `lateattestations`, `captureaccounts`, `sourceof`, `sourcerung`, `sourcereadlog`, `sourcepublishable`, `publishpreflight` (write-free, `mutating: false`; publish's classes and stamps). `knockerconsent`: public (`classes: null`), no `NEEDS` row, as `knock`; pinned to `bio` (R5). So the gated set affordances must name is exactly those 18 (every op above except `knockerconsent`), and the mutating ones needing a rung or `RUNG_ABSENT` are the nine above plus `knockerconsent`.

3. **`inboxresolve` with `status: "pulled"`** (instance-setup's "Mark as taken up") is routed as `op=inboxpull`: read from the POST body before admission, and then every gate, stamp and answer is `inboxpull`'s (so a bearer is refused `CLASS_FORBIDDEN`, as `inboxpull`). The other statuses are unchanged.

4. **N363:** `src/tasks/checks.mjs` is not on the tranche, so importing it now fails the module's load; I add `M_TASKS` when your CHANGE says tasks merged.

## J2 · REPORT

**R36 cannot be met while provenance's register rules refuse capture R65's own document.** Measured over a real record store (node:sqlite, the tranche's modules): a knock pulled by capture's `pullKnock`, its document then promoted as an `information` bundle at `collected`, is refused `PROVENANCE_REGISTER_REFUSED` (C-103.1) with two C-18.1 findings from `src/provenance/register-checks.mjs`:
- :206 `capture.grade 'null' is not one of: A, B, C` — R65's document carries `grade: null` with `grade_basis: "CAPTURE_RECEIVED_NOT_FETCHED"` (provenance R51's doorbell route, K539);
- :216 `origin.kind must be one of: named_request, sweep, member` (`ORIGIN_KINDS`, :36) — R65's document carries `origin: {kind: "doorbell", knock_id}` (K539).

So no pulled knock can be filed as a bundle by any caller; capture R65 says the control plane promotes it. The register rules need the doorbell arm: a null grade with R51's `grade_basis` (as the authored arm, :195–205, already admits a null grade), and `doorbell` among the origin kinds. That is provenance's code (or, if you rule the document wrong, capture's). A CHANGE to either is yours to open.

My side is built (J1's reading): my route runs the promotion as a dry run first, so today the pull is refused with that finding and nothing is written: no knock pulled, no receipt, no bundle. I test R36's orchestration with capture real and the promotion's answer controlled, and R36's end-to-end filing as a `test.todo` naming this cause, until the fix merges; then I run it against the real modules.

## Completion

**Entries applied** (plan layer 11; START B1; K558 (B2), K559 (B3), K560 (B4)):
1. **R36, the doorbell's pull** (`src/control-plane/pull.mjs`, new; routed in `dispatch.mjs`). `op=inboxpull` reaches the record store's own route `inboxpullfile` (beside capture's `inboxpull`, untouched), which runs K559's order: the knock read, and any knock that cannot be pulled answered by `pullKnock`'s own refusal; the promotion as a dry run over the same package in a rolled-back `transact`; `pullKnock({knockId, by, at})`; the promotion of the pulled document with its id in one `transact`. The bundle is capture-requests R38's shape: `INFO-<year>-NNNN-doorbell-knock`, `information@2` at `collected`, the puller its `author` (with op=promote's `actorMemberId`, `actorIdentity`, `actorViewer`), capture's document as `data/provenance.json`, the bytes as a blob at the document's `file`, one register row; no contact anywhere (capture R70). A promotion that fails after the pull (a fault or a refusal, caught) answers `PROMOTE_FAILED` at 502 with `pulled` and says a repeated pull files it; a repeated pull promotes when `provenance.homeOf` finds no bundle holding the capture, and answers the holding bundle when one does. The pull's refusals answer at their `status` hint. Today every pull is refused by the dry run with provenance's C-18.1 findings and nothing is written (N381, K560).
2. **`inboxresolve` with `status: "pulled"`** (instance-setup's "Mark as taken up", `setup.mjs`:1328–1332) is routed as `op=inboxpull` before any gate, so it meets the pull's fence, stamps, route and answer; other statuses are unchanged.
3. **Routes, `NEEDS` rows and stamps for the new ops**, exactly K558's table: capture's `inboxpull`, `knocksof`, `pulledknocks` (a session's alone: `machineClasses: []`), `reattest`, `lateattestations`, `captureaccount`, `captureaccounts`; sources' `sourcedisclose`, `sourcelink`, `sourceconsent`, `sourceconsentwithdraw`, `sourceof`, `sourcerung`, `sourcereadlog`, `sourcepublishable`, and the public `knockerconsent` (pinned to `bio`; `source` the connecting address and `now` the instant, stamped as the knock's; only its four fields passed; a rate refusal 429 as the knock's, any other failure 403; sources' rows now read by the door, `M_SOURCES`); membership's `signerregister`, `signerrevoke` (a session's alone, `by` from the session, routed in the store door to `signerRegisterOwn`/`signerRevokeOwn`, the query's `by` over the body's); case-authoring's `publishpreflight` (write-free, `mutating: false`, op=publish's classes, `viewer` and `author`, its `project` classified for R27). op=publish's body carries `selfAttested` whole. Writes: `contribute` (the capture and sources acts), null (the own-key acts); reads: null rows. The lists are `OWN_KEY_ACTIONS`, `CAPTURE_MEMBER_ACTIONS`, `SOURCE_ACTIONS`, `SOURCE_READS` in `ops.mjs`, in both session sets.
4. **The stale comment** at `index.mjs`:605–615 corrected: since N357 both spellings carry the founder's sight; the viewer stays bare `admin`.
5. **N363:** `M_TASKS` waits for your CHANGE (tasks not merged; B3 (4)).
Per K558 the store door does not dispatch `sourcesOps` (N379): the source ops are routed and stamped at the Worker door and tested there.

**`not yet met` marks:** none met in full. R36's orchestration is met and tested; its filing with the real promotion is a `test.todo` naming N381, so R36's "(not yet met: N364)" stays until N381, with its N380 mark.

**Check rows:** none added, moved or retired.

**Found in other modules:**
1. provenance: its register rules refuse capture R65's document (`src/provenance/register-checks.mjs`:206, :216): N381 (J2, K560).
2. legacy-tests: `test/machine-attest.test.mjs`:187 (its census) now finds `reattest`, `lateattestations`, `signerregister`, `signerrevoke` unaccounted; they need driving or naming there. `test/affordances.test.mjs`:220 and `test/rung-ladder.test.mjs`:123, :136, :148 fail until AFFORDANCES #8's K558 table merges (they read my new gated and mutating ops). All five were green on `tranche/T16`. Of the 62 legacy files that read my tables, the other 57 answer the same with and without my change (48 pass, 9 fail on both).
3. The DEC-49 guard (`civicos-ui/check-refusal-codes.mjs`): the same 19 failing verdicts with and without my change.
4. Generated artifact: `bio-plane/dist/bio-plane.bundled.mjs` is stale (control-plane's source changed); not rebuilt.
5. Greps: `civicos-ui/test/publication-entry.test.mjs`:624 (a vocabulary guard naming `publishpreflight`; unaffected); `bio-plane/src/affordances.mjs`:7, :2143 (the deferred `publishpreflight`, affordances' R7/R29); no other hit for any new op or name.
6. For N379: the store door could carry `sourcesOps` as one spread in `controlPlaneRoutes` (`dispatch.mjs`), as it carries the own-key routes.

**Deferred:** N363's `M_TASKS` (tasks' merge); strictly one act (N380, capture's seam).

**Flaws fixed in my module:** the stale comment (entry 4).

**Tests and checks:**
- `node --test bio-plane/test/m/control-plane/`: 69 tests, 68 pass, 0 fail, 1 todo (R36's filing, N381). New `doorbell.test.mjs`, 12. Negative controls, each restored: no `by` on sources' acts, 1 fail; the pull admitting bearers, 3; no dry run, 3; no `inboxresolve` routing, 1; no viewer on sources' reads, 1; knockerconsent refusals as success, 1; the whole body passed, 1; no home check, 1.
- `node --test bio-plane/test/m/` in two chunks: 3101 tests, 3079 pass, 0 fail, 22 todo.
- `format`: 0 failures. `architecture control-plane`: 15 files, 91 imports, 0 failures. `coverage control-plane`: 36 of 36. `ownership control-plane tranche/T16`: 7 files, legacy 0/0, 0 failures.

Size (session_01Lo4UbhM2msU4EuN9zSJ4eS): test runs 31, module lines 6601

## J3 · COMPLETE

Job complete at job/T16/control-plane (record: Completion). Applied: R36's pull as K559 orders it (dry run, pullKnock, promotion; residue answered and refiled by a repeated pull), refused today by the dry run with nothing written (N381, K560; its filing a test.todo naming N381); inboxresolve 'pulled' routed as inboxpull; K558's table (routes, NEEDS rows, stamps) for capture's, sources', membership's own-key and case-authoring's new ops, knockerconsent public and pinned; the stale comment at index.mjs:605-615. Waiting: N363's M_TASKS on your CHANGE. Reports: legacy-tests machine-attest.test.mjs:187 (four new ops unaccounted); affordances.test.mjs:220 and rung-ladder.test.mjs:123/136/148 red until AFFORDANCES #8 merges; plane bundle stale. Module 68 pass 0 fail 1 todo; test/m 3079 pass 0 fail 22 todo; four checks 0 failures.
