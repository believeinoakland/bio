# reevaluation (T16)

**Status** · session_01UhKRLHYErRzwuUv4CKDgXW · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

R28 (N364), entry (1). As worded, R28 needs four things my Uses do not give. My best reading follows each; the answer decides how I build R28, so I am waiting on it (entries 2–4 are done and pushed: N360 re-anchor, N359 `since`, N242's four guard outcomes classified).

(a) **Which captures a source stands behind.** `sources` Provides no read from a capture to its source, or a source to its captures, that writes nothing: `sourceOf` mints a source on first read and logs value reads. Reading: `sources` declares `source_knocks` (`source_id`, `capture_sha`) a read contract, as inquiry R40 does, and I join it. (A disclosure needs its source to exist, so every source with a move has its read knocks there.)

(b) **Rung before, after, and "since the leg's basis version".** `rungOf` answers only the current rung, with no `at`. It also refuses a machine viewer (`#memberOf` returns null, so the answer is `NO_SUCH_SOURCE`). "Read as the plane" therefore has no credential. Reading it as the founder appends `source_reads` rows whenever the founder is on a sight list: a read that writes, against my R18. Reading: I never call `rungOf` on read. My `onDisclosure` listener keeps one row per rung move it hears (rung_before ≠ rung_after): `{source, entry, rung_before, rung_after, at}`, with `at` the commit instant from my clock, because the payload carries no instant. R18 gains that table beside R25's pass position. The cause is then derived on read from those rows. (The alternative is a `sources` change: `rungOf({at})` read as the plane, with no read log.)

(c) **The leg's basis version instant.** `inquiry_basis.at` is not in inquiry R40's contract. Reading: the dependent's `bundles.last_updated` (record-core R37), the latest write of the document that holds its live basis. A move after it is a cause; one at or before it is not. R16 closes it as any cause.

(d) **"A capture a live leg rests on".** Reading: the leg's content row's capture (`content.capture_sha`, content R45). For a leg on a whole document: each capture the target registers (provenance's `register`, R48). Live is R7's (`inquiry.restsOnLive`). The detail carries both rungs and the move's instant, and the leg's grade is untouched.

(e) **The raise.** R8's `kind` is `finding` or `passage`, and a source is neither. Reading: a third kind, `source`: `{kind: "source", subject: <source id>, source: "source", since: at, detail: {rung_before, rung_after}, dependents: [{bundle_id, ord, role, state, target}]}`. It is told once per move, after the listener's own row is written. It carries no value (sources R13).

If you prefer the `sources` change in (b) (and a capture read in (a)), those are SOURCES' to build, and R28 stays `not yet met` with a `test.todo` naming it.

## J2 · COMPLETE

**Completion.** All four entries applied on `job/T16/reevaluation` (merged `tranche/T16` at B2).

**Entries applied**
1. **N364, R28** (K547, as B2 ruled all five readings). A new cause arm `source` (`CAUSE_SOURCES`), derived on read in `reevaluations` and `changesOf`.
   - The captures a leg rests on: its content row's capture, or each capture a whole-document target registers.
   - Their sources come from `source_knocks` (sources R15). A move counts when it is later than the dependent's `bundles.last_updated`, and only live legs carry the cause (R7).
   - The cause carries `rung_before`, `rung_after`, `since` (the move's instant), `source_id`, `entry` and `capture_sha`. The grade is never touched.
   - The listener `sourceMoved`, registered with `sources.onDisclosure` in the factory, keeps one row per move whose rung changed in the new table `reevaluation_source_moves` (R18). It then tells R8's listeners once, as `kind: "source"`, carrying no value.
   - `rungOf` is never called. A test replaces it with a throwing stub and shows that no table, the read log included, changes across the reads.
   - R16 closes the cause, and a later move re-opens it.
2. **N359** (R27). The `corrected` cause's `since` is now the instant of the marking act. For a contradiction inquiry's conclusion that is R36's concluding act, with its member and act.
   - The null-`since` test is re-anchored on a real takeUp → resolve path (kind `misquote`), whose instant is `r.act.at`.
   - Only a conclusion through basis-versions' own route still has no instant. There `since_why` carries contradiction's stated `why`, and no instant is invented.
   - **Report (R16):** yes, the close that matches a null `since` still has cases. A `deletion` cause always has a null `since`, and so does the basis-versions route above, which the new test closes and checks.
3. **N242** (K494 (3)): the guard's four unclassified outcomes, all mine, now classified in my code.
   - `#choiceSubject` (`is-version-choice`, three sites) now answers its refusal directly, and its success as `{ok: true, who, r}`.
   - The ground rows in `adoptVersion` (`is-version-adoptable`) moved to a module-level `groundRow`, so no `return` sits inside the region.
   - The guard now prints `arm C: UNCLASSIFIED — 0` (it was 4). Its `outcomeReturns` fell from 295 to 291. That floor is legacy-tests', to re-pin from the print.
4. **N360 / INQUIRY #5** (K545). `corrected.test.mjs` (the divided-citer test) is re-anchored: C1, the child that took the passage leg, now names the parent's passage and carries `corrected`. The divided parent and C2 carry nothing.

**`not yet met` marks my work meets:** R28 (N364). BOB strikes it.
**Check rows:** none added, moved or retired.
**`civicos-ui/` and affordances' lists:** grep for `sourceMoved`, `reevaluation_source_moves` and `choiceSubject` has no hits. No op was added or retired.
**Generated artifacts:** none staled.
**Deferred:** nothing.

**Found in other modules**
- **legacy-tests (`test/derivation-bounds.test.mjs`).** Red at base: 34 methods against its ceiling. R28 adds one more: `reevaluation/index:#sourceMoves`, with 2 reads that name no LIMIT. Both are keyed by the answer's own id lists (the captures and sources of the legs asked), as `#corrected`'s version read is. Capping them would drop moves silently, against R21. I left them unbounded and am reporting it here. The ratchet is theirs to move, or you can ask me for a stated bound.
- **legacy-tests (the DEC-49 guard).** Floor slack: `outcomeReturns` 291 and `refusalsJudged` 931 are above their floors (283 and 919). These are theirs to re-pin; my share moved `outcomeReturns` 295 → 291.
- **sources.** R15's `source_knocks` pin test is N377 (T17), as B2 says. The contract is exercised here through a real `sources`, with only capture's `pulledKnocksOf` as a stand-in.

**Tests and checks run**
- `node --test test/m/reevaluation/`: 67 pass, 0 fail, 0 todo (base: 58 pass, 1 fail).
- Modules that use reevaluation: publication 100/0 (2 todo), case-authoring 53/0, conformance 46/0, monitoring 65/0 (6 todo), scheduler 46/0 (2 todo), queue 69/0, control-plane 57/0. queue-producers has no test directory.
- Legacy suites touching reevaluation: versionnotice, versionchain, rec118-reeval-earned, severedhomes and d280-strengthbar each 1/0. derivation-bounds 0/1, red at base (above).
- `civicos-ui/check-refusal-codes.mjs`: unclassified 0.
- `checks/format.mjs`: 0 failures. `architecture.mjs`: 0 failures. `coverage.mjs`: 28 of 28 live ids named, 0 failures. `ownership.mjs`: 6 files, 0 failures.

Size (session_01UhKRLHYErRzwuUv4CKDgXW): test runs 22, module lines 1982
