# case-check (T45)

**Status** · session_0147VSsrfyRUc6H7GZeANVWi · depth 2 · COMPLETE · handled B5

## J1 · QUESTION

My readings, building on them now (none blocks me; answer only where you differ):
1. **The check's id.** Prefix `CHK`, minted opaque through `record-core.mintOpaqueId("CHK", year, "", taken)` inside R1's transaction, as case-authoring mints `CASE` and `WCD`. No `ID_TABLE` change (record-grammar is layer 1, closed); the Uses' "allocId (a check's opaque id)" read as that.
2. **`void`'s `why`** is a list of every cause that holds, in R2's order (`document_replaced` first). `member_moved` names each member `{bundle_id, pinned, current}`. With `document_replaced` the lapse reads are not asked (the checked text is gone). R5's key: `key` is the first cause's (`case.check.void.<why>`), `keys` one per cause.
3. **R1's repeat.** To find the edition before writing, R1 runs `publishCase` once in a savepoint it rolls back (R18), reads R2 over that edition's latest check, and answers it `existed: true` when `held`; otherwise it runs `publishCase` again for real and records the check. Order: R1's machine/authority refusals come from the pre-flight (`first`), so the repeat is reached only when `ready`.
4. **`published`** wins over `void` and `held`: a `published_cases` row for the check's case edition answers `published` with the edition.
5. **Purge (R4).** `case_checks` declared `{keys: [], whole: "NOT EXISTS (published_cases of that case edition)"}`, classes as `declarePurge`'s default: cleared with the unsigned preparations, kept beside a ratified edition (where it reads `published`).
6. **The fence (R2)** uses `publication.hasCaseStanding` over the stored document of the check's case edition; when none is stored it is asked of a stand-in document naming the check's own `project` (recorded on the row), so a replaced or purged preparation never opens the read.
7. **Rows, family C-148:** C-148.1 `NO_SUCH_CASE` (R2's fence and an absent case) and C-148.2 `NO_ID` (R3). No row for any state (R5). `src/gate.mjs`'s aggregate of check tables is not mine: I will REPORT that it should list `CASE_CHECK_CHECKS`.
8. **`publishcheck`'s op arm** gathers `case-authoring.calculationsAtPublication` first, as `publishcase` does, and passes its facts to both the pre-flight and the act.

## J2 · QUESTION

One more reading (not replacing J1; it does not block me). R2: "A void check stays void when its cause is undone." By construction this holds for `document_replaced` (a stored preparation never returns to an earlier `doc_sha`) and `member_moved` (a new version never returns to the pinned `bundle_sha`). The three lapse reads (case-carriage R4, R5, R13) are asked at each read, as the commit asks them; a lapse later undone (a consent given again, a flag closed, a mark restored) reads `held` again, and nothing latches it, because R2 writes nothing and a check row is never rewritten (R4). My reading: keep it so (a commit at that moment would also succeed, so the check is honest), and R2's sentence reads "…when its cause is undone, for a replaced preparation or a moved member". If you want a latch instead, it needs a write at the read (R2 forbids) or an append-only void log written by a later act; tell me which.

## J3 · QUESTION

Replaces J1 item 3 only (K2829's other readings unchanged; not blocking). Testing against the real case-authoring showed that "the latest check of that edition reads held" alone would answer an *edited* act (a new statement over the same members, same case edition) with the old check, so the edit would never be prepared. My reading now: a repeat is the same act, held: the latest check of that edition reads `held` AND was made from the same inputs (a SHA-256 of the act's arguments as canonical JSON, the viewer stamp left out, the author kept), recorded on the check as `inputs_sha`. Any other act prepares again and records a new check, which voids the earlier one (`document_replaced`). R1's sentence would read "A repeat of the same act while…".

## J4 · QUESTION

On B3 (K2831), before I build it: the latch as ruled leaves no real check `held`. Evidence follows, with options.

**What the providers can answer.** All three lapse reads I may use answer only "now". `case-carriage.acceptedWorkLapsed(fm, signer)` and `marksLapsed(fm)` take no instant. `sourcesLapsed(text, at)` takes one instant, which cannot rule out a lapse *between* two instants. The append-only histories exist, but none is a read contract I may use: case-carriage's marks and withdrawals (its R12) and `document_copies`; `sources`' consents; `accepted-work`'s flags. `sources` and `accepted-work` are not in my Uses at all.

**The consequence.** A real preparation always carries `materials:` rows: every member document is carried whole as `included: true`. I measured this against the real case-authoring. So under B3, `marks_lapsed` can never be ruled out, and every real check reads `undetermined` from the moment it is made. `conformance` R2 could then never rest on a held check: D24 is unreachable until a history read exists.

**Already latched without any provider change** (I am building these now):
- `member_moved`: a bundle's `bundle_sha` is the digest of its `bundle.md`, so a revert *returns* to the pinned sha. I latch with record-core's `bundles.row_version` (one per commit, R37/R41), pinned at the check. Any commit since then is a move.
- `document_replaced`: preparations only move forward.

**Options for the three lapse causes:**
- (a) As ruled: each reads `undetermined` unless the document states no row of its block. Fail closed, but no real check is ever `held`, so D24 is unusable in T45.
- (b) **Recommended.** T46 entry: case-carriage gains `…LapsedSince(fm, since)` over its append-only histories (marks and withdrawals, document copies; consents through `sources`; flags through `accepted-work`). Until it lands, each lapse cause is judged "now" and the gap is named in R2 and in my COMPLETE. A lapse undone in between is the one case missed, and the commit itself still re-reads all three, so nothing is published on a lapsed consent.
- (c) As (b), but until T46 a check older than its last lapse-read instant… not workable: there is no instant to compare against.

I am carrying on with everything else, building the lapse reads under (b), behind one switch, so (a) is a one-line change if you choose it.

## J5 · COMPLETE

**T45-22 applied: R1–R5, built fresh.** Readings as ruled: K2829 (J1), J3's `inputs_sha` repeat, and K2833 (J4, option (b)). Branch `job/T45/case-check`, merged with `tranche/T45` after B5 (case-authoring and publication in).

**Files added; BOB adds them to `modules.json` (plan rule 3):**
- `paths`: `bio-plane/src/case-check/` (`index.mjs`, `schema.mjs`, `checks.mjs`; 417 lines in all).
- `tests`: `bio-plane/test/m/case-check/` (`fixture.mjs`, `hold.test.mjs`, `state.test.mjs`, `versions.test.mjs`, `invariants.test.mjs`, `real.test.mjs`).

**What is built.**
- **R1** `checkAndHold`, all in one transaction:
  - Runs the pre-flight (case-authoring R34). When it is not ready, answers `{ok: false, ready: false, first, blockers}` with the leading refusal's fields, writing nothing.
  - Runs a dry `publishCase` (its R18) to learn the case edition.
  - A repeat of the same act while held answers `existed: true`. The act's identity is `inputs_sha`, a SHA-256 of its canonical inputs, the viewer stamp left out.
  - Otherwise `publishCase` stores the preparation, and the check is recorded in table `case_checks`: `CHK` opaque id, `doc_sha`, members, `member_rows` (each member's `row_version`), `checked_at`, `by`, `inputs_sha`.
- **R2** `caseCheckOf`: states `published` > `void` (`why` lists every cause in R2's order, with `moved`, `key` and `keys`) > `held`. Any failed read is `undetermined`, never `held`. Fenced through `publication.hasCaseStanding`, the absent case's answer is C-148.1. Never throws.
- **R3** `heldFindingVersions`: only the latest check of an edition, and only while held. C-148.2 `NO_ID`.
- **R4** Append-only. Purge declared `{keys: [], whole: …}`: cleared unless the edition is ratified.
- **R5** Keys `case.check.held`, `case.check.void.<why>`, `case.check.undetermined`. No refusal row for any state.
- **Ops** (`caseCheckOps`): `publishcheck` gathers `calculationsAtPublication` first and reads `aiCred` as `publishpreflight` does. `casecheck` with no stamp is fenced as no one.

**Deferred.** The latch for the three lapse causes waits for case-carriage's `…LapsedSince` reads (T46, N907, K2833). Until then they are judged at the read, and a test states the gap. Every provider read is "now" only: `sourcesLapsed` takes one instant; `acceptedWorkLapsed` and `marksLapsed` take none.

**Found in other modules (REPORT):**
- (1) `promotion`'s `src/gate.mjs` should list `CASE_CHECK_CHECKS` (C-148.1, C-148.2): T46's stamp, N902 (B2).
- (2) `plane` composes `caseCheckOps` (ops `publishcheck`, `casecheck`) and creates `caseCheckOf` at start (T45-47).
- (3) `op-declarations` and `op-grades`/`affordances` specify and grade `publishcheck` (mutating, graded as `publish`) and `casecheck` (a read) (T45-45, T45-38/39).
- (4) A note on case-authoring R7: an unpublished case cannot be named, so a held preparation whose member moves is re-checked as a new case id. That is case-authoring's derivation as ruled; no change asked.

**Tests and checks.**
- `node --test test/m/case-check/*.test.mjs` (in `bio-plane/`): `ℹ pass 31`, `ℹ fail 0`. Three of those run against the real case-authoring, publication and case-carriage.
- `format`: `153 modules, 152 requirements files; 0 failures`.
- With the paths above entered in `modules.json` locally (not committed):
  - `architecture`: `9 product files, 24 relative imports …; 0 failures`.
  - `coverage`: `5 of 5 live requirement ids named by a test; 0 failures`.
  - `ownership`: `10 files changed by case-check between tranche/T45 and HEAD; 0 failures`.
  - Without the entry, ownership and coverage fail only on those paths.

Size (session_0147VSsrfyRUc6H7GZeANVWi): test runs 16, module lines 417
