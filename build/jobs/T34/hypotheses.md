# hypotheses (T34)

**Status** · session_012e5rWA13zjo2PKghCh3QRg · depth 2 · WORKING · handled B2

## J1 · QUESTION

Two points on T34-30, hypotheses R6's calculation arm. I am carrying on with both on my best reading.

(1) The `uses` edge. `build/requirements/hypotheses.md` Uses now names `calculations` (`gradeFactsOf`, its R30), but `build/modules.json` still lists hypotheses' uses as record-grammar, record-core, membership, promotion, connection-grammar and explore. To ask the read itself, as R6 says (and R6 says the arm no longer asks nothing when no read is wired), the module imports `calculationsOf` from `../calculations/index.mjs` and reaches the host's one instance lazily, the same way it reaches `explore`. The plane already builds calculations before hypotheses (`plane/store.mjs` ~:193 and ~:204), so no plane change is needed. `checks/architecture.mjs` will refuse that import until `calculations` is in hypotheses' `uses`. My best reading: BOB adds `"calculations"` to hypotheses' `uses` in `modules.json` on `tranche/T34`. calculations is layer 5, so the edge goes down the order (P4). `inquiry` stays out of `uses`: this module reads the inquiry only through record-core's `bundleInfo`, and imports nothing of inquiry's. If you would rather keep the edge out, I fall back to a `calculations` dependency that the plane must pass. That would be a plane change, which is not mine, and without it the arm refuses every `CALC-` leg `LEG_NOT_REDERIVED`.

(2) "An input whose reference is a derived connection id". `gradeFactsOf` answers each input as `{name, kind, ref, grade, why}`. A table's `ref` (its canonical sha256) and a figure's `ref` (a content id) are 64 lowercase hex, the same form as a derived connection id. So is a frozen set's or a draw's sha. My best reading:
- A hypothesis id among the strings of any input's `ref` (of any kind) is refused `HYPOTHESIS_NOT_A_LEG`.
- A 64-hex `ref` is read as a derived connection only when the input's kind is not `table`, `figure`, `set`, `draw`, `money` or `calculation`, whose references by definition name a table, a passage, a frozen set or draw, money facts or a calculation.
- Such an input is judged as a leg on it through `explore.rederive`, with the leg's inquiry as `scope`. Because `gradeFactsOf` carries no derivation today, it is refused `LEG_NOT_REDERIVED` (fail closed).
- A nested `calculation` input is not walked. calculations R4 already refuses a hypothesis input at creation, and R6 names only the leg's own calculation's inputs.

Also confirming the scope reading of the START finding: `#judgeDerived` passes `scope: {inquiry: <the promoted bundle's id>}` (promotion's check context `bundleId`). `legRefusals` gains an optional `inquiry`; without one, no scope is passed.

## J2 · REPORT

Findings in other modules from T34-30. Each is a red or a gap that my changes to hypotheses' provided service cause or expose. None is mine to change.

1. **affordances** (`src/affordances/t33.mjs` ~:56–57, and `JUSTIFICATION_REFUSALS`). `hypothesisrevise` and `hypothesiswithdraw` are graded `reasoned` against `NO_REASON`. hypotheses R2 now answers `HYPOTHESIS_NO_REASON` (C-134.7, N608), so `test/m/affordances/t33-backing.test.mjs:212` ("R19: hypotheses' hypothesisrevise and hypothesiswithdraw … JUSTIFICATION_REFUSALS") is red until `HYPOTHESIS_NO_REASON` is in that list. Also, `hypothesesOps` now serves `notewrite`, `notes` and `noteturn` (hypotheses R7, R11–R13), which have no grading yet, so `test/m/affordances/t33.test.mjs:135` ("R40 R12: each new module's op map holds exactly the ops graded for it") is red.
2. **op-declarations** (`src/op-declarations/index.mjs` ~:133, the `hypotheses` family, `actor: BODY("by")`). The family needs `notewrite: "member"`, `noteturn: "member"` and `notes: "read"`, with the viewer stamped in the query for `notes`. A note is only a member's act: a machine is refused `MACHINE_CANNOT_NOTE`.
3. **control-plane** (`test/m/control-plane/r53-routes.test.mjs:58`, R53). The three note ops have no spec and no `OP_STAMPS` entry yet, so this test is red.
4. **Row census** (promotion's `test/system/row-census.test.mjs`, already red at the base). My rows awaiting T35's stamp:
   - renamed: C-134.5 `NO_STATEMENT` → `HYPOTHESIS_NO_STATEMENT`, and C-134.7 `NO_REASON` → `HYPOTHESIS_NO_REASON`;
   - added: C-134.13 to C-134.18 (`MACHINE_CANNOT_NOTE`, `NOTE_NO_TEXT`, `NOTE_TOO_LONG`, `NO_SUCH_NOTE`, `NOTE_TURN_UNKNOWN`, `NOTE_TURN_NOT_MADE`).
   My COMPLETE names them `awaiting stamp` (plan Rules (5) item 4).
5. **A requirements point for BOB, not a red.** A note holds up to 131,072 bytes (R11, never cut). When it is turned into a hunch (R13), `hold` stores the statement trimmed and cut at `STATEMENT_MAX` (4,000 characters), as R1's code always has. R1 names no refusal for a statement that is too long, so a long note's hunch keeps only its first 4,000 characters. I left it as R1 states it. If BOB wants such a turn refused rather than cut, that is a new R1 refusal, such as `HYPOTHESIS_TOO_LONG`.
6. **Generated artifact.** The plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`, `not_product`) is stale from `src/hypotheses/` and is regenerated at layer close.
