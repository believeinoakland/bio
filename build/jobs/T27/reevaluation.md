# reevaluation (T27)

**Status** · session_01KA6UG6rXYyJAWoe5sPuf8x · depth 2 · COMPLETE · handled B2

## Completion

**Entry applied: N520** (DEC-116 items 3, 7; B1; J1 answered by B2, K1270): R8, R16, R30.
- **R30 registration.** `registerDocket(module, {withdrawals, contested})`: one registration, refusals through `membership`'s `listenerRefusal` (`LISTENER_MALFORMED`, `LISTENER_DECLARED`), as R26's. The pages are read once per answer, in the shapes J1 states and B2 confirmed (`{withdrawals, cursor}`, `{contested, cursor}`; each withdrawal carrying `findings: [{bundle_id, sha, edition}]` and `entry`, with `<case>#<seq>` kept only as a fallback).
- **R30 (a) `withdrawal`.** A live leg (R7, `inquiry.restsOnLive`) on a pinned member finding at the pinned sha carries it. The leg's sha is that of the edition it names (`target_edition` → `publishedRegistry`'s `bundle_sha`), or the finding's live head when it names none. `since` is the signing instant; the cause names the case, the edition, the withdrawn editions, the entry, the finding and the sha.
- **R30 (b) `contested`.** Each member finding a contesting entry names carries it as its own target (R17's precedent), `since` the filing instant. `reevaluations` places a finding's `weakened` and `contested` causes in one obligation.
- **R30 listing and telling.** `docketDependents({after, limit, viewer})` lists (dependent, entry) in that order, with `after`/`cursor` `<dependent>#<entry>`, limit 1–200 (default 200), and closed causes left out. `docketActed({kind, case, entry})` tells R8's listeners once after commit, as `kind: "withdrawal"`/`"contested"` with the arm's dependents for that entry. It writes nothing and never throws; an unknown kind tells nothing.
- **R30 recovery read.** `changesOf` answers both arms.
- **R16.** A project carries `wp_retraction` for each withdrawal of an edition of a case it owns (`project` from the docket), `since` the signing instant, its detail naming the case, the editions and the entry.
- **R16/R30 `docket_absent`.** With nothing registered, every `reevaluations`, `changesOf` and `docketDependents` answer (and `docketActed`'s) states `docket_absent` with a why; a page that cannot be read states `docket_read: false` (R21).
- **R8.** Gains the two kinds through `docketActed`. `CAUSE_SOURCES` gains `withdrawal` and `contested` (exported `DOCKET_KINDS`). C-10.1's `REEVAL_SOURCES` is unchanged.
- **R18** holds: both arms are derived on read and no table was added.
- **Improvement in the module (R20).** The R27–R29 arms dropped a dependent the viewer may not see before the targeted walk. So a target whose only dependents were out of view was never walked, and the answer omitted `out_of_view: true`. They now read every dependent and the walk withholds it, as R30's arm does. The test in `attribution.test.mjs` (R29 R28 R20) fails without this change and passes with it.
- **Catalogue rows added:** none (no `awaiting stamp` row).
- **N502/N508 re-scan:** nothing found. The module's store mentions are the historical extraction note and the live `src/plane/store.mjs` op map.

**Deferred:** none.

**Other modules:** the plane's bundle `bio-plane/dist/bio-plane.bundled.mjs` is stale (its inputs include `src/reevaluation/`). It was not regenerated: that is BOB's at the layer close (manifest §14). For `docket` (L8): call `docketActed` after the withdrawal or contesting act commits (its R13), and fill `registerDocket` in the shapes above.

**Tests run:**
- `bio-plane/test/m/reevaluation/`: tests 101, pass 101, fail 0. New: `docket.test.mjs` (10 tests: R30, R16, R8, R9, R19, R20, R21), and one in `attribution.test.mjs`.
- Users of R8/R16/R30: publication 98/0, ratification 199/0, case-authoring 100/0, conformance 54/0, monitoring 99/0, scheduler 66/0, affordances 148/0, queue-producers 70/0, control-plane 128/0, plane 55/0, `test/system/migrate-released.test.mjs` 1/0 (no skip). `docket` has no tests yet.

**Checks:** format: 92 modules, 91 requirements files; 0 failures · architecture: 15 product files, 61 relative imports; 0 failures · coverage: 30 of 30 live requirement ids named by a test; 0 failures · ownership: 4 files changed by reevaluation between tranche/T27 and HEAD; 0 failures.

Size (session_01KA6UG6rXYyJAWoe5sPuf8x): test runs 9, module lines 2505

## J1 · QUESTION

R30's registration shape (docket R13 fills it; docket is built after me). R30 (a) needs, for a withdrawn edition, its member findings at the sha the edition pinned, and docket R13's `withdrawals` lists "case, owning project, the editions it names, the signing instant, its seq" with no findings. Nothing in my Uses maps a case edition to its members at their pins (`publishedCaseRegistry` carries editions only), so my best reading, which I am building now:

- `withdrawals({after, limit})` → `{withdrawals: [{case, project, editions: [n, …], findings: [{bundle_id, sha, edition}], at, seq, entry}], cursor}`: `findings` is each member finding of each withdrawn edition at its pin (`edition` the case edition it is a member of), `at` the signing instant, `entry` the docket entry's id (default `<case>#<seq>` when absent).
- `contested({after, limit})` → `{contested: [{case, edition, findings: [{bundle_id, sha}], at, entry}], cursor}`.
- `cursor` a string or null; a page is read until the cursor is null, repeats, or a page is empty (R26's `cases` pattern).

Other readings in this build:
- A leg rests on finding F "at the sha that edition pinned" when the edition of F it names (`target_edition`) was published with that `bundle_sha` (`publishedRegistry`), or, naming none, when F's live head is at that sha.
- `contested` is a cause on the member finding itself: its obligation's `target` is the finding, as R17's `weakened` is, so `recordReevaluation({dependent: F, target: F, source: "contested"})` closes it.
- `docket_absent` (with a why) is stated on every `reevaluations`, `changesOf` and `docketDependents` answer while nothing is registered, since both arms apply to any target. A failed page read states `docket_read: false`.
- `docketActed`'s dependents: for a withdrawal, the live legs on that entry's pinned findings (`{bundle_id, ord, role, state, target}`, the plane's view, R28's precedent); for a contesting entry, its member findings. R16's project half is not told there, because it is R16's cause and not R30's arm. An unknown kind tells nothing and answers `{ok: true, told: false}`.

If docket R13 should carry `findings` on a withdrawal, that is a requirement change for docket, not for me. Please confirm or correct the shape.

## J2 · COMPLETE

N520 applied: R30 (registerDocket; withdrawal and contested causes, derived on read, in the shapes B2 confirmed; docketDependents; docketActed telling R8's listeners after the act), R16's withdrawal half (wp_retraction on the owning project) and R8's two kinds; docket_absent stated while nothing is registered. Improvement: R27–R29 now state out_of_view on a targeted read whose only dependents are out of view (R20). No catalogue rows added. reevaluation 101/0; every user module green; the four checks report 0 failures (coverage 30/30). Plane bundle stale (not regenerated). Details in the record.
