# entities (T48)

**Status** · session_012L9wEk9N3XmRcXHwxLBwXH · depth 2 · WORKING · handled B2

## J1 · QUESTION

R53's row. The code's one row today is action-grammar's C-117.28 (`where` actions `#proceedingRefusal`), with an actions-only sentence ("An action belongs to a proceeding…"). Under K231/K275 (the earliest module in the order holds the helper and the row; R36's NO_SUCH_ENTITY precedent, progressions' C-100.12 giving way) my best reading, which I am building on:
(1) entities holds the one row, C-91.9 `NOT_A_PROCEEDING` in `ENTITY_CHECKS`, `where` `src/entities/index.mjs notAProceeding > is-proceeding-kind`;
(2) its sentence names no act, so it reads true for events, lines, actions and following: "This is asked of a proceeding, such as a case before a court or a board, and the subject named is registered as another kind. Name the proceeding itself. Nothing was written." (BOB's to reword; the UX stream's to revise);
(3) `notAProceeding(detail, extra?)` answers `{ok:false, reason, code, check, translation, detail, ...extra}`, `extra` never replacing those (R36's shape), a fixed default detail when none is given; it writes nothing and never throws;
(4) C-117.28 is retired in action-grammar's own job (not mine; I touch no other module). Until then the code is held by two checks.mjs files; that is a REPORT for you to place (rule 5 (2), or a CHANGE to action-grammar).
Say if any of (1)–(4) is wrong.

## Completion

**Read, whole:** `build/requirements/entities.md` (public and private parts). My entry T48-82, the plan's "Rules at the opening" and the users' entries T48-83 and T48-48 in `build/plan/current.md`. Every file of my code (`index.mjs`, `checks.mjs`, `schema.mjs`). The test fixture `fixture.mjs`, `contract.test.mjs` and `registry.test.mjs` (P20). **How the set was read (K2032, §17 (3)):** BOB measured the set at 700 KB, over 600 KB. I read my requirements, code and the files above whole myself. Two helpers in this session were each given my entry and its notes, read their parts in full, and wrote digests citing each section: (1) the other ten test files under `test/m/entities/`, and (2) the public parts of record-grammar, jurisdictions, civil-time, connection-grammar, id-spaces, record-core, membership, provenance, extraction and content, with `build/layers.md`'s layer-5 contract. Neither digest names a flaw in the code. The test flaws they noted are in (Deferred).

**Entries applied:** T48-82 (K231, K275, K3207; B2 ANSWER, K3243).
- R53: `notAProceeding(detail?, extra?)`, module-level in `index.mjs` and exported with `NOT_A_PROCEEDING_DETAIL`. It answers `{ok: false, reason: "NOT_A_PROCEEDING", code, check, translation, detail}`.
  - `detail` is the caller's sentence, or a fixed default when none is given.
  - `extra` adds a caller's own fields (such as `entity_id` or `kind`) and never replaces the answer's own fields (R36's rule).
  - It writes nothing and never throws.
  - The code is minted only in its DEC-49 region `is-proceeding-kind`.
- Its one row: **C-91.9 `NOT_A_PROCEEDING`** in `ENTITY_CHECKS`, with `where` `src/entities/index.mjs notAProceeding > is-proceeding-kind`. The translation is BOB's interim wording (B2): "This is asked of a proceeding, such as a case before a court or a board, and the subject named is registered as another kind. Name the proceeding itself. Nothing was written." New in T48 layer 5, **awaiting stamp** (T49's).
- Users re-point in their own jobs: events R52, lines R23, actions R104 and following R31. action-grammar's C-117.28 is retired by its own T48-46 (B2 (4)).

**Tests:** `test/m/entities/t48.test.mjs`, four tests named R53:
- The row: its number, `where`, translation word for word, frozen, no place (R31), no DEC-149 word, no act named. Control: unique among this module's checks, apart from C-91.4 and C-91.5.
- The answer: its code and sentence, the caller's detail, and the fixed default for eight non-sentences. Control: two callers get one code with two details, and it is distinct from `NO_SUCH_ENTITY` and `NO_ENTITY`.
- `extra`: it adds and never replaces, and six hostile extras do not make it throw.
- It writes nothing. The condition it names (held, of another kind) is shown through `has`, `readEntity` and `proceedingOf`.

R53's "control: each caller's refusal equals it" is each caller's own test, in its re-pointing job.

**Deferred:** test flaws the digest noted in my older tests, none affecting a requirement's verdict:
- dec149 R25/R31 and idmatch R25 scan only `IDSPACE_CHECKS` translations. My new row is covered by its own test.
- naming R19, t33 R48 and t35 R51 also assert query-plan text.
- t33 R9's last `grade_if_resolved` assertion is vacuous (R17 is covered in naming-convert).

These are left for a later entities job. This one is a one-requirement provider job that events and lines wait on.

**Found in another module:**
- The row census (`test/system/row-census.test.mjs`) reads `CENSUS MOVED: arrived with no record: C-91.9 NOT_A_PROCEEDING`. This is accepted under rule 5 (2) until T49's stamp; the record names the row above as awaiting stamp.
- `NOT_A_PROCEEDING` is held by both C-91.9 and action-grammar's C-117.28 until T48-46. That window is accepted by name (B2).
- The answer-envelope families test passed only after `npm ci` in `bio-plane/src/journey-check`. Without it the file fails at import (`playwright-core`); this is environment only.

**Tests and checks run:**
- entities: `node --test test/m/entities/`: 99 pass, 0 fail.
- Users: events, lines, actions, following, connections, progressions, intent: 568 pass, 0 fail, the same with my change reverted.
- answer-envelope and affordances: 4 fail, the same 4 with my change reverted (affordances `ACT_HELP` R48 ×2 and the R14 `DISCLOSURE_DUE` test, rule 5 (6)). `families.test.mjs` passes 1/0 once journey-check's packages are installed.
- `checks/format.mjs`: 0 failures. `architecture.mjs … entities`: 0 failures. `coverage.mjs … entities`: 53 of 53; 0 failures. `ownership.mjs … entities tranche/T48`: 0 failures.
- `checks/run.mjs`: format 0, architecture 0 (product-wide), channels 0. Coverage shows 45 failures, none of them entities': other modules' T48 ids under rule 5 (1).

Size (session_012L9wEk9N3XmRcXHwxLBwXH): test runs 12, module lines 2053
