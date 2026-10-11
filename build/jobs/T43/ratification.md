# ratification (T43)

**Status** · session_012ngwe4Kgzm9pxD9KFXVVr7 · depth 2 · WORKING · handled B1

## Completion (RATIFICATION #24, session_012ngwe4Kgzm9pxD9KFXVVr7)

**Entry applied: T43-19 (K2706).** `converted-b.test.mjs` R5 (publish, block 6b): the loop over `[2, 1]` prepended `edition: <n>` onto the previous revision's text, so the second revision carried `edition` twice and the write door refused it (promotion R38, C-2.1, `BUNDLE_MD_UNREADABLE` "duplicate top-level key 'edition' at line 3"; the fixture's `w.promote` threw). Each revision is now the pinned bytes, read once before the loop, with one `edition` key (:179–183). The assertion at :166 (now :182–186) is unchanged and passes: rule 4 (11)'s ratification red is cleared. Tests only; no code changed.

**Other fixtures writing a key twice: none.** Swept the whole suite, not a grep sample: record-grammar's parser was instrumented locally (a log line on each C-2.1 duplicate-key finding, behind an environment flag; reverted, never committed) and all 233 tests run under it: zero duplicates. The probe was proved live by running it once over the unfixed file: it named exactly `fixture.mjs:263` ← `converted-b.test.mjs:180`.

**Reading set (mechanics §17; K2032, K2700).** Read whole by this session: `build/requirements/ratification.md`; every file under `bio-plane/src/ratification/` (7) and `bio-plane/test/m/ratification/` (21); the plan's T43-19 entry, rule 4 and K2625, K2706. The 27 used modules' public parts (754 KB) were read in full by one helper agent in this session, given this entry and case-authoring's T43-12, which wrote a digest citing each statement by module, section and R id (sources binding). Its findings: R38's C-2.1 applies to creations as well as revisions (K2706), any finding refuses; no used module defines a finding `edition` key beyond "each top-level key once" (record-grammar R9); nothing in any public part touches T43-12's deletions or ratification's reads of the case document blocks. It agreed independently that `converted-b.test.mjs` was the one injection site.

**Deferred:** none. **Found in other modules:** nothing new (see users' reds below, all already accepted).

**Tests run.**
- ratification (`test/m/ratification/`): tests 233, pass 233, fail 0. `converted-b.test.mjs`: 17/17 (16/17 before the fix, :166 red).
- Users (the job's START list):
  - case-authoring: 184, pass 180, fail 4 — `carries.test.mjs`:59, :79, `preflight.test.mjs`:301, :425, each "no such table: inbox": rule 4 (12), until T43-12.
  - review: 46/46. actions: 111/111. plane (`test/m/plane/`): 184/184; `test/system/migrate-released.test.mjs`: every step PASS.
  - affordances: 232, pass 231, fail 1 — `t36.test.mjs`:55: rule 4 (10), until T43-17.
  - op-declarations: 133, pass 125, fail 8 — `t34.test.mjs`:68, :145, :307, `t37.test.mjs`:105, :177, :218, `t38.test.mjs`:76, :87: rule 4 (10), until T43-18.
  - answer-envelope: 30, pass 25, fail 5 — `catalogue-end.test.mjs`:17, `envelope.test.mjs`:63, `families.test.mjs`:49, :377, :424, each missing doorbell's family (`DOORBELL_CHECKS`, C-85/C-118): rule 4 (9), until T43-14.
  - No red outside rule 4.

**Checks (civicos-process).** format: 147 modules, 146 requirements files; 0 failures. architecture (ratification): 28 product files, 148 relative imports; 0 failures. coverage (ratification): 49 of 49 live requirement ids named by a test; 0 failures. ownership (ratification, tranche/T43): 1 files changed; 0 failures.

Size (session_012ngwe4Kgzm9pxD9KFXVVr7): test runs 6, module lines 3735
