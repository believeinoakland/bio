# Diagnosis R9: re-walk 8, area B (five open items)

Source: `build/plan/walk-T51-rewalk8/B.md`. Code read on `tranche/T51` (the `src` tree is the same at c6d62e5 and 678639d). Reproductions run in a scratch worktree (removed): Miniflare for items 2-4 through the counting door, module level for items 1 and 5. Nothing in `/home/user/bio` changed except this file. No live contact. No act was refused.

Certainty words: Certain = reproduced or an unambiguous code path. Where I could not settle a point I say what I read, what I ran and what would settle it.

## 1. G112 still: Sign step after a reload loses the set-time fields

Owner: **case-authoring** (the draft and the pre-flight); screens-publish only for the empty Bias box. **Certain** (reproduced).

(1) Cause, step by step.
- Reload: the ceremony builds the request in `screens-publish/ceremony.mjs:95-98` (`args` = `P.caseArgs` = `{draft, project}` (`parts.mjs:276`) plus `ui.attestedBody`, which is empty after a reload; `tieAttested: true` added when the draft's record says prepared, :94-98). `biasAcknowledgement` is added only from the Bias box at press time (`parts.mjs:303`, `attested`), and the box is drawn from `ui.attested ? mine.bias : copy.authored.biasAcknowledgement` (`ceremony.mjs:294`). The draft never holds a bias: the ceremony's `publish` body carries it (`ceremony.mjs:543-553`), `DRAFT_FIELDS` would keep it (`case-authoring/index.mjs:186-188`) but nothing writes it back to the draft, so `copy.authored.biasAcknowledgement` is empty and the box comes back empty (the walker saw this).
- `publishPreflight` (`index.mjs:1590`) takes the draft's stored fields (`#withDraft`, :395-412: no bias), then round 8's fix `#tieAttestedInPreparation` (:1736-1758) adds `tieAttested: true` from the stored unsigned document. That is the whole fix; it restores the tie half only.
- `#publishCase` in preflight mode refuses at `index.mjs:709-711` (`if (!back) NO_BIAS_ACKNOWLEDGEMENT`; `back = str(biasAcknowledgement)`, :690). No document text results (`answer.ok` false, :1604), so `ratify = {reached: false}` (:1607-1611), `publish_at` is null with `PUBLISH_AT_NOT_REACHED_SENTENCE` (:1904-1906), and the screen draws "not reached" (`ceremony.mjs:372-385`).
- The stored unsigned document does hold the bias (`bias_acknowledgement` in its frontmatter, written at :733), so it is recoverable the way the ties are.

Reproduction (scratch `zz-diag1`, real `publishCase` then `publishPreflight`; the draft holds no bias, the prepare call carries it):
```
PREPARED true
RELOAD first= NO_BIAS_ACKNOWLEDGEMENT publish_at= null editions.prepared= 1
RETYPED first= null publish_at= {"offered":true,"zone":"America/Halifax","source":"local-facts"}
AssertionError: actual: { ok: false, reason: 'NO_BIAS_ACKNOWLEDGEMENT' ... } expected: null
```
Same as the walker (first NO_BIAS_ACKNOWLEDGEMENT, publish_at null; retyping the bias restores it).

(2) Why the tests missed it. `r8-prepared-preflight.test.mjs` builds every call from `AUTHORED`, which carries `biasAcknowledgement`, and its draft case puts the bias in the draft (`kept` from `args`, test lines 128-130). The live ceremony never puts the bias in the draft. Seam section F used the same fixtures. Neither prepares with the bias only in the `publish` call, then reloads with `{draft, project}`.

(3) Failing-first proposal. `bio-plane/test/m/case-authoring/r8-prepared-preflight.test.mjs`, new test: draft stored without `biasAcknowledgement`; `publishCase({draft, project, tieAttested: true, biasAcknowledgement})`; then `publishPreflight({draft, project, viewer, author})`: `first` is null, `publish_at.offered` true (red now: `NO_BIAS_ACKNOWLEDGEMENT`, null). Control: an unprepared draft without bias still answers `NO_BIAS_ACKNOWLEDGEMENT`; a call that sends a bias keeps its own (a changed bias is judged as sent). Door half in seam section F (`r8-seam-misc.mjs`): `ceremonyPreflight(e, {tied: false})` where the edition was prepared with the bias typed in the ceremony. Screen half (screens-publish): after a reload the Bias box shows the stored bias, or the Sign step needs none.
Fix shape (for the owner): read `bias_acknowledgement` from the stored unsigned document in the same helper, only when the call sends none, in the rolled-back run only. The same question applies to every other field the ceremony sends only at prepare (`tensionsDisclosed`, `selfAttested`; `parts.mjs:289-303`): the walker's retyped check did not resend them and `first` was null, but the owner should check `blockers` for them (not tested).

(4) Platform: **L** (done) and **P** (reload a prepared edition's Ceremony).

## 2. G120: one `caseratify` is 4.1-4.6 s against the 2 s act bar

Owner: **ratification** (`ratification/ops.mjs`), with the heavy reads in **control-plane/plane** (`image`, `list`, `ratifygate`, `casegate`). **Certain** for the structure (reproduced with the counting door); the per-hop live cost is the platform's and was not measured here.

(1) What the act now does (`ops.mjs`, reproduced with `r8-caseratify-calls.test.mjs` and `R8_DEBUG=1`; 61 awaited calls, 21 to the object, 40 R2 from the Worker, chain 25):
- Gate phase (`tGate` at :71, `stated("gate")` at :218), five object levels in a row: `casedocfacts` (:111) -> `casetestimony`, `caseapproval`, `casegate` together (:139, already concurrent) -> per sitting member `gatefacts` -> `image` + `list` together -> `ratifygate` (`prepareFinding`, :519-557; members run together, :201). The sitting here has 2 members (events: `gatefacts` x2, `image` x2, `list` x2, `ratifygate` x2), so the identical `list` (every bundle id of the record) is read twice and posted back whole to `ratifygate`. Live: `gate` 1.1 s (hops 101, 196, 214, 441-457, 401 ms; `image`, `list`, `ratifygate` are 4x the 100 ms floor).
- Commit: one object call (:233-251), `commit` 134 ms.
- Copy: `copyMaterialsDetailed` (:338) and each member's copy together (:259-269); locally 14 R2 calls (6 head, 2 CAPTURES.get, 6 put) in 2 groups; live `copy` 731 ms.
- Assemble: item 3, 1.7-2.3 s.
- Reuse: `reusedparts` per member, still **one after another** (loop at :282-291, `await reuseCheck` in a `for`), 188-202 ms live. That loop is the only remaining serial per-member step.
Walker's phases sum to 3.91 s of 4.12 s; the rest is session/reauth/REAUTH_DUE hops outside the phases.

The 2 s bar is out of reach by concurrency alone: the five-level gate chain plus assemble's 11 awaited levels (item 3) cost about 3 s at live hop cost. What would reduce it: one object call that returns what `gatefacts`/`image`/`list` return for all members (the store half already runs the gate in `ratifygate`), reading `list` once per request, starting `copy` before the gate completes is NOT allowed (copy follows commit), and the item-3 changes. A decision on whether 2 s is the bar for this act is Bob's (K4354/K4599); this is a finding, not a fix.

(2) Why the tests missed it. `r8-caseratify-calls.test.mjs` asserts the chain is at most 25 calls and the independent reads are together; Miniflare answers each hop in about a millisecond, so no test sees a time; the 2 s bar was read once live. The live per-route cost of `image`, `list` and `ratifygate` (which grow with the record) has no test because the test record is nearly empty (`list` 1.6 KB locally).

(3) Failing-first proposal: `ratification/r8-chain.test.mjs` plus `control-plane/r8-caseratify-calls.test.mjs`: with a two-member sitting, `list` is asked once (red: 2) and the object-call depth of the gate phase is at most 4 (red: 5); reuse checks of members run together (peak 2, red: 1). Time cannot be asserted locally.

(4) Platform: **L** for counts (done), **P** for time. A live read of `Server-Timing` with per-route `in-` entries after the change.

## 3. G121: the case file's assembly, R2 calls and concurrency

Owner: **public-read** (`publication/worker.mjs` assembly, `public-read/casefile.mjs`). **Certain** (counted locally, one-finding case, 12 files).

(1) Calls made by `assembleCaseContainer` (`publication/worker.mjs:208`), from the event log of the reproduction:
- Object calls (4, serial): `recordcasefile` building (:222), `casefilefacts` (:255), `recordcasemanifest` (:545), `recordcasefile` built (:226).
- R2 calls (26): `PUBLISHED.get` x2 (reading the finding's bytes and one more, together, `casefile.mjs` prefetch in groups of `CASEFILE_GROUP`); `head` x12 and `put` x10 for the 12 files (:534-535, two already held); manifest `head` + `put` (:553).
- The copy phase before it adds 14 R2 calls (`head` x6, `CAPTURES.get` x2, `put` x6).
So the assembly makes 26 R2 and 4 object calls; `caseratify` as a whole 40 R2 (copy 14 + assemble 26) and 21 object calls.

Concurrent? Within a step yes (G121's fix is in: `Promise.all` over groups of 8 at :534-535; prefetch at `casefile.mjs:~110-116`). Between steps no: the longest awaited chain in the assembly is 11 levels: ledger -> facts -> get -> (head -> put) group 1 -> (head -> put) group 2 -> record manifest -> manifest head -> manifest put -> ledger. Seven of those are R2 levels; with four object hops (~0.4 s) the walker's 1.7-2.3 s implies about 0.2-0.3 s per R2 level live (derived, not measured). The remaining serial costs:
- 12 files in groups of 8 means two barriers, each waits for its slowest `head` then `put` (:534-535).
- `head` before every `put` of content-addressed bytes is a level that a plain `put` would not need.
- Manifest `head` + `put` (:553) run after `recordcasemanifest`, one after the other.
- The `building` ledger call (:222) completes before `casefilefacts` starts.

(2) Why missed: the test asserts peak concurrency at least 6 and chain at most 25, both met (peak 8, chain 25); no assertion on the number of R2 levels, and Miniflare's R2 is a millisecond.

(3) Failing-first proposal: `public-read/r8-assemble.test.mjs` (module) with a recording R2 stand-in: for 12 files the number of sequential R2 levels is at most 3 (red: 7), and the same set of keys is written (golden). Door confirmation in `r8-caseratify-calls.test.mjs`: assembly depth.

(4) Platform: **L** done; **P** after (`assemble;dur`).

## 4. NEW: `caseratify` answer is 761 KB (refusal 705 KB)

Owner: **control-plane** (`phase-clock.mjs`, the measure); the live cause: **Cause unknown**, see below. The measure itself is **Certain**.

(1) What the number is. `bytes;dur` is not the size of the answer sent to the member. `control-plane/phase-clock.mjs:12, 105, 127-139` define it as the length of the object's answer bodies the door read to their end, summed over the request (`counted()` wraps every object `fetch`, :145-157). The answer a member's screen receives is 5,075 bytes in the local reproduction (keys: `container` 1,280, `sitting` 2,501, `next` 242, rest small), and nothing in it grows with the record. The member's screen does not need the 761 KB; it is not sent to it. The cost it points to is real: those bodies are read and parsed by the Worker (`body;dur` 314-343 ms of the act).

Local per-route sum of those bodies for the same act (scratch print in `counted()`): `casedocfacts` 20.7 KB, `gatefacts` 2.6 + 1.4, `list` 1.6 x 2, `image` 8.1 + 18.3, `caseratify` 26.9, `casefilefacts` 24.0, others under 0.2: about 105 KB. `casedocfacts` returns the whole document (18.8 KB, of which `required_strength` 10.9 KB) and is read again inside `casegate` (`ratification/index.mjs:545`); `caseratify` answers 26.9 KB to the Worker, of which the Worker uses a few fields.

Live is 761 KB, about 7x. What I could not settle: the 409 refusal is 705 KB and the refusal returns before any `prepareFinding` (`ops.mjs:182-197` before :201), so those 705 KB were read by `session`, `reauthdue`, `casedocfacts`, `casetestimony`, `caseapproval` and `casegate` (locally 21 KB in all) or by door reads before them. I read `caseDocumentFacts` (`publication/index.mjs:1771`), `attributionFacts` (`case-tensions/index.mjs:519`), `testimonyReach` (`basis-versions/index.mjs:821`, bounded) and found nothing unbounded. The 56 KB difference between the success and the refusal fits the post-gate reads, which in a record with many bundles should be larger (`list` and the registries `gatefacts` returns scale with the record, and are read once per member). To settle it: add the per-route byte count the clock already has (`counted()` knows `route` and `n`) as a Server-Timing entry (for example `bytes-<route>`), redeploy, and read one refusal. That is a one-line change in control-plane and a P probe.

(2) Why missed: `bytes;dur` was added in round 8 as a diagnostic (R128) and has no test that reads per-route sizes; test records are tiny.

(3) Failing-first proposal: `control-plane/r8-phase-clock.test.mjs`: a counted request states bytes per route (`in-bytes` entries, capped by METRIC_MAX), asserted against known sizes of a stub object answer.

(4) Platform: **P** (the number can only be named live); **L** for the entry.

Certainty: measure Certain; live content **Cause unknown**.

## 5. NEW: `tabledeclare` on a comma CSV answered `SOURCE_NOT_READ` in 2 of 6 calls

Owner: **calculations**. Code path **Certain**; the transient trigger **Cause unknown** (one candidate fits all of what I could test; stated below).

(1) Every condition that answers `SOURCE_NOT_READ` (`calculations/index.mjs`):
- :563, `src.fault` from `#sourceRows` (:490-529). Three faults: a sheet range with truncated or unread cells (:495-499); and at :526-528, `typeof text !== "string"`, with two messages: for `csv` true "the CSV file's own bytes are not held ..." (the walker's text), otherwise `source_text_held`.
- :574, `scanCsv` error on the text.
- :578, one cell per line against a wider header.
The walker's text is :527, so `csv` was true (`#isCsv`, :487-492, true when the reading records container format `csv`) and `text` stayed null. For a csv document `text` is set only at :520-525: `ev.get(row.capture_sha)` then `obj.text()`, inside `try { ... } catch { text = null }` (:521-524). So it is null when `evidenceStore()` is null (:1939 record-core; no bucket bound), when `get` returns null, or when `get`/`text()` throws. The catch discards the error, so a throw and a missing key are the same answer, and nothing is logged.

Tested (scratch `zz-diag5`, real `declareTable` over the walker's 18,098-row file):
```
store.get throws once   -> CALL1 SOURCE_NOT_READ "the CSV file's own bytes are not held, and a table is made from the file ..."  CALL2 ok 18098
store.get null once     -> CALL1 SOURCE_NOT_READ (same text)                                                                  CALL2 ok 18098
```
So one failed or empty read of the held bytes gives exactly the walker's answer and the next call succeeds.

Tested and excluded as the cause of this answer: a document read in pieces / a reading that has not recorded its container or is partial. With the container absent (`captureFormat: text`) and the bytes held, `#isCsv` is false and the table is made from the reading's index: `ok`, 18,100 rows (rewalk7's header-as-data shape), not `SOURCE_NOT_READ`. With the container `csv` and units partial: `ok`, 18,098 rows. So a race with a reading tick can produce a wrong table (a hazard of its own: `declareTable` takes its source shape from a state the reading may still be changing) but not this refusal. Multipart storage is also excluded for these files: the part size is 8 MiB (`acquisition/index.mjs:1333`), so a 324-360 KB file is one object put whole; `keepWhole`/`keepPast` apply to larger files only. Nothing deletes a capture's object (`grep` for deletes: only the self-test's own key, `setup.mjs:3284`). The evidence prefix comes from `#ownNamespace()` (`plane/store.mjs:780`), which is stable for the object's life (object-age rose across the walker's calls, so it was one instance).

What remains: a one-off failure of the bucket read inside the object, swallowed at :521-524. I cannot tell from the code whether the read returned null or threw, and the walker's record cannot either. To settle it: log the swallowed outcome (null vs error text) at :521-524 and read the next occurrence; or retry the read once.

(2) Why missed: `r8-source.test.mjs` tests "bytes never held" (permanent) and the happy path; no test makes the store fail once.

(3) Failing-first proposal: `calculations/r8-source.test.mjs`: a store whose `get` fails once (throw, and null): `declareTable` on the held CSV answers ok (red: `SOURCE_NOT_READ`), and the swallowed cause is in the answer or the log; control (kept): bytes never held still answers `SOURCE_NOT_READ`. Through the door: `tabledeclare` in the control-plane seam for the same file. Also a test that an in-progress reading does not change the table (the 18,100 shape) once the module reads the format from the file rather than from the reading.

(4) Platform: **L** (the failing store); **P** only to learn the live cause.
