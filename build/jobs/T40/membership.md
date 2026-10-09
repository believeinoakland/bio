# membership (T40)

**Status** · session_01McN1vbMjCkAoS6fsP6jmCx · depth 2 · COMPLETE · handled B2

## Completion (MEMBERSHIP #31)

**Reading set** (mechanics §17, K2304). Measured with my tests: requirements 57 KB, own code 218 KB, own tests 313 KB, plus the used modules' Purposes and named services: about 600 KB, over 300 KB, so step (3). Read whole myself: `build/requirements/membership.md`; layer 2's row of `build/layers.md`; the code my entry changes, `index.mjs`, `checks.mjs` and `schema.mjs`, all three whole; the tests I changed, `module-order.test.mjs`, `roster.test.mjs` and `fixture.mjs`, whole; and the used services my Uses names: record-core R21, R34, R35, R37 and R68, record-grammar R13 and R15, and the Purposes of record-core, record-grammar, signatures and test-support. `requests-fence-facts.test.mjs` was read in its R54–R56 tests and the R115 test I changed. A worker read the other 20 test files whole (every other file under `test/m/membership/`, and `test/members.test.mjs`). It wrote an 8 KB summary for this task, every statement citing file:line: the order pins, the C-96 numbers held, the R55 refusal's asserted fields, the enrolment refusal order, the no-write snapshots, the purge declarations and the fixture's helpers. Nothing it left out mattered: the one red the run found (op-declarations, below) lies outside the set. Also read: the plan's T40-M entry and "Rules at the opening", K657, K2373, K2376, K2394, K2395, K2404, DEC-184, DEC-186, `words.json`'s `handle.*` entries, and credentials' R54–R57 lines on `notTheOwner`.

**Entries applied** (T40-M; N812, N797, N799; B2's CHANGE, K2404):
- **R122** `notTheOwner(by, projectId, extra?)` is a module-level function in R84's shape: `{ok, reason, code, check, translation, by, project, detail}`, with `extra` beside and never replacing those, and `remedy`/`message` as R84 has them. It is the one site for C-56.2, whose `where` moved to `notTheOwner > is-not-the-owner`; the words are unchanged. **R55**: `projectAuthority`'s owner refusal is answered through it, with `act` and `needs`. Its detail is now `notTheOwner`'s fixed sentence, and it gains `by`.
- **R83**: `MODULE_ORDER` names `ai-use` between `run-rules` and `ai-runs`. The test pins its place and tolerates it by name as not yet built until T40-7. This clears rule 4 item 5: the base run's six MODULE_ORDER reds (membership, promotion, standards, t9) are green on this branch.
- **R123** `handleCheck({invite, handle, viewer})` and `op=handlecheck`:
  - It answers a live invitation or an active member's viewer. Anything else gets R15's `NO_SUCH_INVITATION`, byte for byte.
  - The window allows 60 checks in any 10 minutes per invitation hash or member (two buckets, a paused check not counted). Past it, `HANDLE_CHECK_PAUSED` with `stated` and `retryAfter` (whole seconds), before the handle is read.
  - The answer is `free`, `taken` (with the smallest free `-n` suggestion, or null) or `not_allowed`. For `not_allowed`, `problems` lists `{problem: "length", min, max}`, `{problem: "start"}` and `{problem: "characters", characters}`.
  - `words` is `{key, en}`, verbatim from `words.json`. It writes only `handle_check_window`.
- **R124** `handleChange({handle, by})` and `op=handlechange`:
  - Refusals in this order, each writing nothing: `HANDLE_CHANGE_NOT_A_MEMBER`, `NO_HANDLE`, `BAD_HANDLE`, `HANDLE_FIXED` (with `case` and `edition`, translation `handle.fixed`), `HANDLE_CHANGE_UNCHECKED`, `HANDLE_TAKEN`. Then `{ok, unchanged}` for the current handle.
  - Otherwise, in one act, the handle changes and a row goes into the new `handle_history` table (`member_id`, `from_handle`, `to_handle`, `at`). It answers `{ok, handle, formerly}`.
  - Earlier handles are taken for every other member, at enrolment too (**R16**), and free to their own member.
- **R125** `registerHandleGuard(module, fn)`: one registration, refusals through R81. It is called synchronously before any write. Only null passes; `{case}` is fixed. A throw, a promise, `{unreadable}` or anything else is unchecked: fail closed.
- **R126**: C-96.48 `HANDLE_CHECK_PAUSED`, C-96.49 `HANDLE_CHANGE_NOT_A_MEMBER`, C-96.50 `HANDLE_FIXED`, C-96.51 `HANDLE_CHANGE_UNCHECKED` (BOB's draft words). `HANDLE_WORDS` holds the four `words.json` texts.
- **R17**: every roster row carries `formerly`, latest first, the current handle left out, `[]` for none.
- **R57**: the handle history is append-only.
- **R115**: `handle_history` and `handle_check_window` are declared exempt from purge with the members.
- **R127** `joinedParticipants(projectId)` → `[{member, owner, since}]` for `joined` and `leaving` participants, whatever the member's status, in member-id order. `since` comes from the new column `project_participants.joined_at`, written by the act that joins: creation (`projectClaimOwner`), `projectJoin` (a row already joined keeps its instant) and R118's `rescue`. It is NULL for rows joined before, never back-filled. An unknown or malformed id gives `[]`.

**Tests.**
- New `t40-handles.test.mjs`: 18 tests naming R16, R17, R55, R57 and R122–R127 explicitly, each with a negative control (K874). Each new id is checked against its whole stated behaviour, including the no-write snapshots, byte-identical misses, the window's 60th check and its recovery after `retryAfter`, the stamps' sources, and `words.json` read by key.
- Updated `module-order.test.mjs` (R83: `ai-use`) and `requests-fence-facts.test.mjs` (R115: the two new exempt tables).

**Ran.**
- `node --test test/m/membership/`: tests 186, pass 186, fail 0.
- `node test/members.test.mjs` (the plane under miniflare): 95 pass, 0 fail.
- The users' suites: every module using membership (86) is under `test/m/**`, so the whole of `test/m/**` and the 10 users' test files outside it ran, mine against `tranche/T40` @ the START:

  | run | tests | pass | fail | skipped |
  | --- | --- | --- | --- | --- |
  | this branch | 9,188 | 9,160 | 16 | 1 |
  | `tranche/T40` | 9,170 | 9,138 | 20 | 1 |

  - Six base reds are cleared by R83.
  - 11 reds are in both runs, the rule 4 reds: row census, case-disclosures/case-authoring PR #14/#15 and words, reading-pipeline's T40-4a pins, filings.
  - Four reds are only on this branch:
    - Three pass when run alone: `capture-requests/plane.test.mjs` 5/0, `doc-clean/measure.test.mjs` 1/0, and the capture-sources N295 plane test. They are load-timing reds; the base run had its own plane flakes of the same kind.
    - One is real: `op-declarations/t33.test.mjs` R19, "membership: handlecheck has no spec" (below).
- After the R127 change, `test/m/project-roster/`, `test/m/credentials/`, `test/m/promotion/` and `test/m/membership/` ran again: 475 pass, 0 fail.
- No layer tests are named in `build/manifest.md`.
- Checks (civicos-process), all 0 failures:
  - `format`: 140 modules, 139 requirements files.
  - `architecture`: membership 28 product files, 73 relative imports.
  - `coverage`: membership 94 of 94 live ids.
  - `ownership`: 7 files changed by membership between `tranche/T40` and HEAD.

**Deferred.** None. The `*(not yet met: T40)*` marks are BOB's to strike at the merge.

**Found in other modules / owed elsewhere** (REPORT J1):
1. op-declarations `t33.test.mjs` R19 is red from this merge until T40-23: membership's ops map now serves `handlecheck` and `handlechange`, which have no spec until op-declarations' R42 declares them in L11. Admission R3/R22 (T40-18a), affordances, op-grades and control-plane's routes (R70) are owed the same ops in L11.
2. Rows awaiting promotion's stamp (T40-4): C-56.2's `where` moved, and C-96.48–C-96.51 are new.
3. The generated plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`) carries membership's source, so it is stale (rule 4 item 7). I did not write it (§14).
4. P6: membership is 3,621 lines (`src/membership/`, all three files), up from 3,306 + ~250 planned.

Size (session_01McN1vbMjCkAoS6fsP6jmCx): test runs 16, module lines 3621

## J1 · REPORT

(1) op-declarations t33.test.mjs R19 red from this merge until T40-23: membership's ops map serves handlecheck and handlechange, which have no spec until op-declarations R42 (L11). Admission R3/R22 (T40-18a), affordances, op-grades and control-plane R70 owe the same ops in L11. (2) Rows awaiting promotion's stamp (T40-4): C-56.2's where moved to notTheOwner > is-not-the-owner; new C-96.48 HANDLE_CHECK_PAUSED, C-96.49 HANDLE_CHANGE_NOT_A_MEMBER, C-96.50 HANDLE_FIXED, C-96.51 HANDLE_CHANGE_UNCHECKED. (3) The plane bundle is stale (rule 4 item 7); not written by me. (4) P6: membership is now 3,621 lines.

## J2 · COMPLETE

T40-M applied, with B2's R127. R122 notTheOwner (R84's shape; C-56.2 minted there); R55 answers through it. R83 names ai-use (clears rule 4 item 5). R123 handleCheck with its 60/10-min window. R124 handleChange with handle_history: earlier handles reserved for their member (the first reading of DEC-186); fails closed with no guard. R125 registerHandleGuard. R126 C-96.48-.51. R16, R17 formerly, R57. R127 joinedParticipants, with joined_at recorded by the joining act. Membership 186/0; members.test 95/0. Full test/m: 16 red on this branch vs 20 on tranche/T40: six MODULE_ORDER reds cleared; one new real red (op-declarations R19, owed by T40-23, see J1); three load flakes that pass alone. Checks: format, architecture, coverage 94/94, ownership 7 files, all 0 failures. Record: build/jobs/T40/membership.md on job/T40/membership.
