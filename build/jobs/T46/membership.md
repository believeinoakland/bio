# membership (T46)

**Status** · session_01NYNAzwK9hYtCvE5CTuZxYA · depth 2 · COMPLETE · handled B3

## Record

**How the reading set was read** (mechanics §17, K2032; B1). Read whole by me: `roles/JOB.md`; `build/manifest.md`; `build/requirements/membership.md` (public and private, and R123 as B2 restated it); my entry T46-4 in `build/plan/current.md` and the opening's rules it cites; DEC-198's `refusal.HANDLE_FIXED` on PR #30; all of my module's code (`index.mjs`, `checks.mjs`, `schema.mjs`); the tests `t40-handles`, `t41-sight-words`, `t34-joining`, `module-order` and `fixture.mjs`. Read whole by helpers in this session, each told my entries, each writing me a digest citing file and line (K2032, §17 (3)): my other 22 test files and `members.test.mjs`; the public parts of my Uses (`record-grammar`, `signatures`, `record-core`, `test-support`) and `build/layers.md`'s layer 2 contract. I acted on both digests where they bore on my entries. The sources stay binding.

**Entries applied (T46-4):**
- **R129** `handleChange` (`op=handlechange`, still declared and routed) refuses every call `HANDLE_FIXED` before anything is read, whoever asks and whatever `handle` names: one answer, nothing written, no handle-history row. `#publishedWork` and `#formerly` removed (unreachable).
- **R126** `HANDLE_FIXED` is a new row, **C-96.52**, `where` `handleChange > is-handle-fixed`, translation DEC-198's sentence in DEC-149's form (B2, K2927): "Handles don't change in your group's Civicsmith: yours names your work for good, and no one else can ever take it. Nothing was changed." It is held as the row's text until the key reaches `main`. **C-96.49 `HANDLE_CHANGE_NOT_A_MEMBER`, C-96.50 and C-96.51 `HANDLE_CHANGE_UNCHECKED` are retired** and never reused; C-96.48 stands. `HANDLE_WORDS` drops `handle.fixed`, `handle.refused.unchecked` and `handle.refused.notmember`. **For promotion's stamp (T46-6): three departures (C-96.49, C-96.50, C-96.51) and one arrival (C-96.52).**
- **R125** The guard slot and its refusals stand; no act calls the guard (tested: a registered guard is never asked).
- **R16** The code already compared every member's handle whatever the status, plus the history. Now tested: a revoked member's handle, and an earlier handle in the history, stay taken at enrolment and at the check.
- **R17** The roster rows carry no `formerly` key for any caller.
- **R83** `MODULE_ORDER` gains `interface-assets`, `interface-shell`, `screens-settings`, `screens-intake`, `screens-daily` and `screens-inquiry` after `store-door`, before `control-plane`. Each is tolerated by name as not yet built and pinned by its neighbours, with K874's negative control. **N936:** the T45 negative control is re-pinned: T45's six are held to their filled paths, on disk, and are no longer tolerated. The `store-door` pin now reads `→ interface-assets`.
- **R130** `joinDoors({by, limit})` (`op=joindoors`, `by` from the stamp, `limit` from the query): `NOT_AN_ADMIN` through R84 unless R64; else `{ok, websiteKey, joinLink}`, each `{live, current, history, limit, truncated}`. `current` is the live door's `{id, capabilities, dailyCap, expiresInDays, since, by}`, its id the one its invitations' actor names. `history` is every record in order, each `{id, event, capabilities, dailyCap, expiresInDays, by, at}`, under R113's bound (200, lowered never raised, a non-positive limit floors at 1 as `hostingAccess` does). No secret, hash or invitation is selected. On a failed read it answers no door, as `courtNotice` answers no choice. It never throws.
- `PROJECT_GUARD_UNCHECKED` is unchanged (K2917).
- The R123 restatement (B2): the code comment names the member arm as a member's own check; `handleCheck` is unchanged.

**Flaws dealt with in my own module (P8):** the comments citing "fail closed, as R124" now cite no retired id. `requests-fence-facts.test.mjs`' title and message no longer name the retired R124. `index.mjs`' header now reads R4–R130. Noted, not changed (outside my entries, no failure hidden): `t35-words.test.mjs`' titles cite source line numbers (stale after any edit) and its comment counts 43 rows (46 now); a few tests pin `where` strings rather than behaviour. Deferred: none of my entries.

**Other modules (REPORT J2):**
- `publication` `test/m/publication/t41.test.mjs` R76 now red. It asserts that a member whose work is in a published case is refused `HANDLE_FIXED` naming the case through the guard (R125), and that another member's change succeeds. Under R129 every change is refused, with no `case`. Its R76 registration stands.
- `op-declarations` `t33.test.mjs` R19/R6 now red ("membership: joindoors has no spec"): START's named red until T46-51.
- Users of `handlechange` (op-grades T46-44, affordances T46-45, op-declarations T46-51): no other test of theirs turned red. Their texts still describe a changeable handle (op-grades `t41.mjs` NON_ACTS sentence, affordances `act-help.mjs`, setup-words' `handle.*` rows, control-plane's comment). Each is theirs to re-word.
- My change turns `promotion`'s R39/R45/R46 total-order test green.
- `promotion`'s `test/system/row-census.test.mjs` is red on `tranche/T46` without my change too.
- The plane bundle composes membership, so this merge stales it. I did not touch it.
- For BOB (pre-existing, not my entries): `join_doors` is declared to purge in the default form (R111 exempt). Under record-core R21's default it reads `export: admin-only`, so the stored `secret_hash` would reach an administrator's export. A ruling may want it `export: never`. Also, `#custodialBar` reads a machine stamp with a case-sensitive `startsWith(MACHINE_CLASS_PREFIX)`, where record-grammar R14's `isMachineStamp` trims and lower-cases; this matters only for a stamp the control plane never writes.

**Tests and checks run** (final, on this commit, `tranche/T46` merged):
- `node --test test/m/membership/*.test.mjs test/members.test.mjs` (in `bio-plane/`): tests 217, pass 217, fail 0. At START the same run was 211 tests with 4 fail, all inherited `MODULE_ORDER` reds, now green.
- Thirteen other modules' tests (publication, op-grades, affordances, op-declarations, control-plane, admission, plane, answer-envelope, setup-words, wizard-scripts, promotion, credentials, project-roster): tests 1527, pass 1517, fail 9. On `tranche/T46` without my change: fail 8. Differences: +op-declarations t33 R19/R6 (named), +publication t41 R76 (reported), −promotion R39/R45/R46.
- `checks/format.mjs`: 159 modules, 152 requirements files; 0 failures. `checks/architecture.mjs … membership`: 0 failures. `checks/coverage.mjs … membership`: 96 of 96 live ids named by a test; 0 failures. `checks/ownership.mjs … membership tranche/T46`: 0 failures.
- No layer tests are named in the manifest.

Size (session_01NYNAzwK9hYtCvE5CTuZxYA): test runs 12, module lines 3,729.

**B3 (CHANGE; K2928):** merged `tranche/T46` (R131 new).
- **R131** `join_doors` is declared through `record-core.declareTable` with `export: never`, and its other classes are the ones the default form gave it (`purge: exempt`, `expunge: none`, `sight: group`, `derive: stored`, `version_chain: false`; `MEMBERSHIP_DECLARED_TABLES` in `schema.mjs`). It left the default form's `exempt` list and stays in `MEMBERSHIP_EXEMPT_TABLES`, the list of what purge keeps. Every other membership table keeps the default form (`export: admin-only`).
- **Tested at my interface, through the real record-core:** `declaredTables()` holds `join_doors` once with exactly those classes. No exportable membership table holds a door's hash. A whole-store purge keeps the doors' records. Controls: every other table is `admin-only`, and R130's read still answers. corpus-export, which reads these classes and skips `export: never` tables, is layer 8, so my tests do not drive an export itself. corpus-export's own tests are green on this branch.
- **A host whose record-core offers no `declareTable`** (a test's stand-in) declares `join_doors` in the default form as before. This follows `#registerReservedIdFinding`'s precedent and is tested with its control. Without it, `project-roster`'s fixture (a stub with `declarePurge` only) turned 34 of its tests red; with it, every test of the ten modules building membership over a stub passes (2,051 of 2,051). For `project-roster` (REPORT J4): its fixture's stub may gain `declareTable` so that its runs see R131's declaration.
- `node --test test/m/membership/*.test.mjs test/members.test.mjs`: tests 219, pass 219, fail 0. Fifteen other modules (the thirteen above, plus corpus-export and record-core): tests 1723, pass 1713, fail 9. These are the same nine reds as at J3; none is new.
- format (159 modules, 152 requirements files), architecture, coverage (97 of 97), ownership (tranche/T46): 0 failures each.

Size (session_01NYNAzwK9hYtCvE5CTuZxYA): test runs 17, module lines 3,749.

## J1 · QUESTION

Two readings I am building on; neither stops the job.

(1) START: "R123 still mentions R124's change: restate it as the refusal, in this job (P8)." R123's text is in `build/requirements/membership.md`, outside my `paths`, so I read this as: the requirement text is BOB's to restate; in this job I restate R123's mentions of R124 in my code, comments and tests (the active-member `viewer` arm of `handleCheck` stays as R123 states it, its reason now "a member checking a handle", not "for R124's change"; earlier handles in the history stay `taken`, R16). Behaviour of `handleCheck` is unchanged. If you meant me to edit the requirements file, say so and name it as an allowed path.

(2) HANDLE_FIXED's translation (C-96.52): R129 gives BOB's draft "A handle is chosen when a member joins and is never changed, by the member or anyone. Nothing was changed."; your START says to write DEC-198's sentence (PR #30, `refusal.HANDLE_FIXED`: "Handles don't change in Civicsmith: yours names your work for good, and no one else can ever take it. Nothing was changed.") in DEC-149's form now. I am writing: "Handles don't change in your group's Civicsmith: yours names your work for good, and no one else can ever take it. Nothing was changed." (the START being the later and more specific instruction), held as the row's translation until the key reaches main.

## J2 · REPORT

Other modules' tests my change turns red (details in my record): (1) publication test/m/publication/t41.test.mjs R76 asserts a member with published work is refused HANDLE_FIXED naming the case through the guard (R125) and that another member's change succeeds; under R129 every change is refused, with no case. Its registration stands. Publication's to re-test. (2) op-declarations t33.test.mjs R19/R6 'membership: joindoors has no spec': your named red until T46-51. No other test of op-grades, affordances, op-declarations, control-plane, admission, plane or setup-words turned red; their texts still describe a changeable handle (op-grades t41.mjs NON_ACTS, affordances act-help.mjs, setup-words handle.* rows), each theirs to re-word. My change turns promotion's R39/R45/R46 total-order test green. Pre-existing, for a ruling: join_doors is purge-declared in record-core R21's default form, so export reads admin-only and the stored secret_hash would reach an administrator's export; export: never may be wanted. The plane bundle is staled by this merge.

## J3 · COMPLETE

T46-4 done, pushed on job/T46/membership (tranche/T46 merged). R129: handlechange refuses every call HANDLE_FIXED, new row C-96.52 (your DEC-149 form of DEC-198's sentence). C-96.49, C-96.50 and C-96.51 retired; for promotion's T46-6: 3 departures, 1 arrival. R125: slot stands, never called. R16: a revoked member's and the history's handles stay taken (tested). R17: no formerly. R83: the six L11 modules after store-door, tolerated and pinned; N936: T45 negative control re-pinned to filled paths. R130: joinDoors / op=joindoors, admin-only, no secret, R113 bound. Membership 217/217 (START: 211 with 4 inherited reds, now green). Format, architecture, coverage (96/96) and ownership: 0 failures. Other modules: see J2 REPORT. Module 3,729 lines. Details in my record.

## J4 · REPORT

project-roster: its test fixture stubs record-core with declarePurge only. Membership now declares join_doors through declareTable (R131); with no declareTable it falls back to the default form (tested), so project-roster's tests stay green. Its stub may gain declareTable so its runs see R131's declaration.
