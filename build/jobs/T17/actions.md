# actions (T17)

**Status** · session_01NCrn5QviMeTSZwRUNYvqjR · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

N396 (DEC-13): R1 names the two refusals in passing ("a `request_for_comment` naming no inquiry as an `advances` leg or no clock entry"), but nothing states what counts as naming an inquiry, that the audit reports it, or that the window's length is not enforced and the GAO precedent is carried as a citation (today only `bio-checks.mjs` holds `RFC_RESPONSE_WINDOW_PRECEDENT`). Proposed, in my wording, as a new id in the Provides' write section:

- **R44** (N396, DEC-13) A `request_for_comment` names the specific inquiries it put to its subject and states the response window it gave: at least one `action_basis` leg of kind `advances` whose target is an inquiry, and at least one `clock[]` entry (which carries its basis as every entry does, R7, R35). A `rests_on` leg, or an `advances` leg onto anything but an inquiry, is not a disclosed inquiry. A creation or revision missing either is refused `ACTION_BASIS_REFUSED` (R1), its findings naming each missing part under C-2.10, and the audit reports the same findings (R37); another kind is not asked. The window's length is the group's: no range is enforced, and `RFC_RESPONSE_WINDOW_PRECEDENT` (`{min_days: 7, max_days: 30, source, enforced: false}`, the GAO agency-comment protocol) is exported by this module as a citation a surface may show, never compared against a date. A non-response to it is recorded with its date (R15, R34).

My best reading, and what I am building meanwhile: the rule stays where it runs today (legacy-checks' `actionBasisFindings`, imported); this module re-exports `RFC_RESPONSE_WINDOW_PRECEDENT` beside its other re-exported vocabularies (R40's pattern), since the definition cannot move while legacy-checks' own finding text reads it and the old suites import it from there. Tests go in `test/m/actions/t17.test.mjs`, titled R44 (with R1, R37).

## J2 · COMPLETE

**Entries applied.** Layer 9, N396 (K573), R44 as worded by BOB (K603, B2):
- `src/actions/checks.mjs` re-exports `RFC_RESPONSE_WINDOW_PRECEDENT` from legacy-checks beside the other re-exported vocabularies (R40's pattern); the header comment says why its definition stays there. The rule itself runs as before (legacy-checks' `actionBasisFindings`, at the write and in the audit).
- `test/m/actions/t17.test.mjs`, 7 tests, each titled R44 (with R1, R10, R15, R29, R34, R37 where it proves them), over the module's own fixture: the write through promotion, the audit through `audit`, the read through `actionRead`. Negative controls run: `if (!disclosed.length)` → `if (false)` in `actionBasisFindings` fails 4 of the 7; `if (!clock.length)` → `if (false)` fails 1; each restored byte-identical (sha256 checked).

**Old suite, `test/action-loop.test.mjs`: which arm each new test carries (for legacy-tests).**
- §8 "request_for_comment is in the published suite" → "R44 R10 another kind is not asked…" (`kinds()`, `actionKinds(null)`); also read.test R32/R40.
- §8 "naming ZERO inquiries is refused BY NAME", "the refusal says WHY … nothing to answer", "the WRITE refuses it too" → "R44 R1 R37 a request for comment naming no inquiry is refused at the write and reported by the audit, by name".
- §8 "NAMES the inquiry … is accepted", "it promotes", "'we contacted them' and 'we put this claim to them' are different rows" → "R44 R1 R29 a request for comment naming the inquiry it put, with its window, is accepted…" (plus: a revision dropping the leg is refused).
- §8 "NO authored response window is refused" → "R44 R1 R37 a request for comment stating no response window…" (catalogue and write, and both-missing naming each part).
- §8 "a window OUTSIDE the 7-30 day precedent is accepted", "the precedent is CARRIED with its source, marked as not enforced" → "R44 the window's length is the group's…" (five dates from 1 day to a year; precedent read from actions' export).
- §5 "a no_response carrying bytes is refused", "a NON-RESPONSE is recorded with its date" → "R44 R15 R34 a non-response to a request for comment is recorded with its date…".
- New arms the old suite lacked: a `rests_on` leg or an `advances` leg onto a document is not a disclosed inquiry (R44 test 2).
- The old suite's other arms (§1–§7, §9, §10) are covered by `test/m/actions/` as B1 lists (R12–R17, R25, R26, R34, R37, R40): for legacy-tests, not re-tested. Not carried: §3's source-text arm ("holds NO state list of its own", reading `STORE_SRC`) and §2's `SCHEMA_SRC` index regex (P7: source text); §1's `op=conclude` drive belongs to inquiry, not this module; §5a's clock-pin arms are C-11.1's, carried by read.test R37 (past-due finding) and write.test R7 (a past pending entry lands).

**Deferred.** None in this module. Moving `actionBasisFindings` and the precedent's definition here waits on C-2.10's catalogue move (B2); their readers in legacy-checks' finding text, `affordances` and the old `lead`/`theme` suites still import them from legacy-checks.

**Found in another module.** None.

**Tests and checks.** `node --test bio-plane/test/m/actions/`: tests 47, pass 47, fail 0 (after merging `tranche/T17`). Old `node bio-plane/test/action-loop.test.mjs`: 81 pass, 0 fail (unchanged by the re-export). `format`: 72 modules, 67 requirements files; 0 failures. `architecture . actions`: 10 product files, 36 relative imports; 0 failures. `coverage . actions`: 44 of 44 live requirement ids named by a test; 0 failures. `ownership . actions tranche/T17`: 3 files changed; legacy-store 0/0, legacy-checks 0/0; 0 failures.

Size (session_01NCrn5QviMeTSZwRUNYvqjR): test runs 8, module lines 3501
