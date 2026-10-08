# skills (T36)

**Status** · session_011dND59updNJT3EV6X813vM · depth 2 · WORKING · handled B1

## Completion

**Entry applied.** T36-22 (N731; K1993, K2126): R38 (c), R33's and R28's appended sentences.
- `skilldoctrine.mjs`: new `HELD_ADDRESS_ONLY`, Roles §3 rule 12's sentence verbatim (BOB's, K2126; rule 11 unchanged), the fourth member of `RESEARCH_BOUNDARY_CLAUSES` (resident, R2, R38). New `CAPTURE_CLAUSES` = [R38 (a), R38 (c)], held once. `LEGAL_LOOKUP_CLAUSES` ends with it (R33). The `action_planning` body's `capture` is now that list, the same objects (R28; it was the one (a) object). Comments re-pointed.
- `skillpack.mjs`: R1's guard in `renderPack` covers all four clauses, and its message names (c). Header and `SOURCING` comment re-pointed to rules 11 and 12.
- Every pack's version moves (R11): tested against T35's three-clause pack.
- Satisfies needs nothing more: BOB's text already names Roles §3 rule 12 and R38 (c).

**Tests** (`boundary.test.mjs`; each changed id in a test of its own):
- R38 (c): the clause is found in rule 12 and not in rule 11, and a changed word is not found. It is resident in every pack and listed by no `disclosable` entry, and it carries no control-flow authority.
- R33: the law lookup carries (a) and (c), the very resident objects.
- R28: `action_planning.body.capture` is the same objects.
- R37 R38 R1: renderPack throws when (c) is dropped or emptied.
- R11 R38: the version moves, with a same-clauses control.
- Existing R38 (a)(b) pin updated to four clauses.

**Reading set** (N739, mechanics §17). Measured: own requirements 33.5 KB, code 140.3 KB, tests 135.6 KB = 309 KB before used services, so over 300 KB. Rule (3) applied: I read these whole myself:
- my requirements;
- layer 6's row of `build/layers.md`;
- the plan entry and rules at the opening;
- K2126, K1993 and K1899's lines;
- the draft's skills section, choices and For BOB;
- Roles §3 rules 11 and 12;
- both code files (`skillpack.mjs`, `skilldoctrine.mjs`);
- the tests the entry changes: `boundary`, `lookup`, `planning` and `version`, and `fixture.mjs`.

The used services my Uses names (run-rules', record-grammar's exports) were read only where the code imports them. The change touches none of them.

A worker read the other seven suites whole: `ask`, `doctrine`, `edition`, `filing`, `pack`, `wizard`, `writing`. Its summary was about 7 KB and cited file:line for every pin. It found no assertion broken by the change. Nothing it left out mattered: every suite passes.

**Ran**:
- skills `node --test test/m/skills/`: tests 82, pass 82, fail 0.
- Users of skills (modules.json `uses`):
  - agent-worker `npm test`: tests 10, pass 10, fail 0.
  - answer-envelope + control-plane: tests 193, pass 190, fail 3. The same three fail on the tranche head without my change (stash and rerun), so they are inherited:
    - `answer-envelope/catalogue-end.test.mjs` R7/R2: red 18.
    - CHECK_FAMILIES totality: red 11, file-safety's family.
    - `control-plane/r53-routes.test.mjs`:70 R53: not named by number in rule 5 as far as I read it, but identical before my change; I take it to be red 19/20's family of ops not yet declared. BOB to confirm.
- Layer tests: none named in the manifest.

**Checks**:
- format: 135 modules, 134 requirements files, 0 failures.
- architecture: 14 product files, 66 relative imports, 0 failures.
- coverage: 38 of 38 live ids named by a test, 0 failures.
- ownership: 4 files changed by skills, 0 failures.

**Deferred**: none. The `*(not yet met: T36)*` marks on R28, R33 and R38 are BOB's to strike at merge.

**In other modules / artifacts**:
- `bio-plane/dist/bio-plane.bundled.mjs` (not_product) bundles the plane's source, these files included. It is now stale and is BOB's to regenerate at L6's close.
- agent-worker's bundle has no skills input (manifest), so it is not stale.
- No other module reads `action_planning.body.capture` (searched the repository's .mjs/.js outside dist).
- After release, a run recorded under the T35 pack meets `SKILL_VERSION_MISMATCH` on its next segment (agent-worker R48), as at every pack change.

**P6**: module 2,369 lines (`skilldoctrine.mjs` 1,754, `skillpack.mjs` 615), +18; with tests 4,388 total. Far under 4,000 for the module itself.

Size (session_011dND59updNJT3EV6X813vM): test runs 8, module lines 2369
