# steps (T46)

**Status** · session_01J3TzHfT2qWvkrKK2z2Ktcd · depth 2 · RUNNING until 2026-10-12T05:56:24Z (users' tests) · handled B0

## Completion

**Entries applied.** T46-12 (N899), R12: `stepsDue` reads at most `DUE_READ_MAX` (1,000) of the member's dated steps not closed, in step order, and at most 1,000 of her reminders due by that day, in the order she asked them; each read takes 1,001 rows, and when either holds more than 1,000 the answer is `{ok, due, truncated: true}`, otherwise `{ok, due}` with no `truncated`. `DUE_READ_MAX` is exported. Nothing else in R12 or R29 changed. The Private Uses part of the entry (`jurisdictions`, `calc-grammar`, `connection-grammar`, not `inquiry`) is requirement text, BOB's; the code already imports exactly those and nothing of `inquiry` (`index.mjs` lines 32–44), so no code change was owed for it.

**Reading.** Read whole myself: `build/requirements/steps.md`, START B1, my plan entry, my code (`index.mjs`, `schema.mjs`, `checks.mjs`) and every test file under `bio-plane/test/m/steps/`. The used modules' public parts, and the public parts of `notice-producers` and `action-clocks` (the later users of `stepsDue`), were over the 600 KB limit. A helper in my session read them in full and wrote me a digest that cites each section (K2032, mechanics §17 (3)).

**My readings** (stated, not questions; a CHANGE if BOB reads otherwise):
- "Dated steps not ended" is read as not closed, so neither `ended` nor `set_aside`. This is R12's existing "not ended" as the code already applied it (`CLOSED`).
- Steps a due holder holds (R29), and dated steps not yet past their date, are among the rows read, so they count toward the 1,000. `truncated: true` can therefore come with fewer than 1,000 items in `due`, even none. The test states this.

**Flaws found in my own module.** None beyond the entry. The unflagged 1,000 limits it replaces were the flaw N899 names.

**Found in other modules** (also in my REPORT):
- `connection-grammar`: `isRecordId` is exported (`shape.mjs:33`, `index.mjs:8`) and used by steps, standards, hypotheses, law-relations, explore and contradiction, but no requirement in its public part states it as a service (only `derivedId`, R11). It is a requirement gap there (P5), not a code fault.
- `notice-producers` R1 already expects each producer's `truncated` in `facts`. `stepsDue` now gives it one to read; carrying it into `facts` is notice-producers' own work, and I report it so it is not missed.

**Generated artifacts.** I changed plane source, so the plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`) is stale until the layer close regenerates it. I did not write it.

**Tests and checks.**
- `node --test bio-plane/test/m/steps/`: 45 pass, 0 fail. New: "R12 (T46): …", with controls at 1,000 exactly, an ended step, a reminder not yet due, and another member's steps. Test: 1,001 dated steps gives `truncated: true`; with 1,000, none. The same for reminders.
- Users of steps, on this branch:
  - Pass with 0 fail: ai-runs 87, run-productions 58, capture-requests 108, question-explorer 28, investigation 32, action-clocks 66, notice-producers 102, answer-envelope 32.
  - Failing: affordances 232 pass, 2 fail; op-declarations 134 pass, 6 fail; control-plane 221 pass, 2 fail; plane 210 pass, 1 fail.
  - Each of those failing tests fails identically on `origin/tranche/T46` without my change. All are about other modules' op maps and registries (local-facts, filing-templates, ACT_HELP, PR registries). They are inherited reds, none of them steps'.
- `checks/format.mjs`: 159 modules, 152 requirements files; 0 failures.
- `checks/architecture.mjs . steps`: 14 product files, 38 relative imports; 0 failures.
- `checks/coverage.mjs . steps`: 29 of 29 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs . steps tranche/T46`: 3 files changed; 0 failures.

Size (session_01J3TzHfT2qWvkrKK2z2Ktcd): test runs 7, module lines 1710
