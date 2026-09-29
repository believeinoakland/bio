# conformance (T12)

**Status** · session_01ETXy3wuGNZAj21rDumMzpi · depth 2 · COMPLETE · handled B2

## J1 · REPORT

R19 and R20 are pushed on `job/T12/conformance` @ 6c0ed5d174, ready for early merge (B1): `noSuchDetermination(determinationId, extra?)` and `determinationSuperseded(determinationId, supersededBy, extra?)` are exported from `bio-plane/src/conformance/index.mjs` (module-level functions, never throwing, writing nothing; `extra` never replaces a fixed field). Rows: `NO_SUCH_DETERMINATION` C-113.15 (`where` names `noSuchDetermination`), `DETERMINATION_SUPERSEDED` C-113.23 (new; `where` names `determinationSuperseded`). R9 and R7's second supersession answer through them. For consequences, actions and escalation: `import { noSuchDetermination, determinationSuperseded } from "../conformance/index.mjs"`; R20's `superseded_by` is what the caller passes (null when it cannot read the successor).

Also in this push: renames `DETERMINATION_NOT_A_PARTICIPANT` (C-113.3) and `NO_SUCH_COMPARISON` (C-113.20); C-113.9 (`NO_SUCH_STANDARD`) and C-113.18 (`ALREADY_SUPERSEDED`) retired, numbers unused. R1's `NO_SUCH_STANDARD` answers through `standards.noSuchStandard` when present, else a local stand-in answering R17's worded shape with standards' own row C-112.10 (so no conformance row carries the code); it goes when your CHANGE brings standards' helper. For N318 (promotion R34, next tranche): one row added (C-113.23), C-113.9 and C-113.18 retired, C-113.3 and C-113.20 renamed.

Tests: `node --test test/m/conformance/` 36 pass, 0 fail (new `helpers.test.mjs` for R19/R20). Checks: format, architecture, coverage (20/20) 0 failures; ownership 1 failure, `build/requirements/conformance.md`: striking my own R7, R18, R19, R20 marks (as K395). R1's mark stays until standards' helper is merged. Continuing with the rest of the job (UI/affordances grep, remaining review).

## J2 · COMPLETE

**Entries applied** (on `job/T12/conformance` @ 71f92ff7ea, tranche/T12 merged in after B2):
- **N309, N312 · R19, R20.** `noSuchDetermination(determinationId, extra?)` and `determinationSuperseded(determinationId, supersededBy, extra?)` are module-level exports of `src/conformance/index.mjs`. Each code has one site and one row: `NO_SUCH_DETERMINATION` C-113.15 and `DETERMINATION_SUPERSEDED` C-113.23 (new), each `where` naming its function. The helpers never throw and write nothing, and `extra` never replaces a fixed field. R9 answers through R19, with `determination` in place of the old `id` field. R7's supersession of an absent or unseen determination answers through R19, and its second supersession through R20. Merged early (K400).
- **R1, R18 · renames (K380).** `DETERMINATION_NOT_A_PARTICIPANT` (C-113.3) and `NO_SUCH_COMPARISON` (C-113.20, its site `refuseNoSuchComparison`).
- **R1 · `NO_SUCH_STANDARD` through standards R17.** It now calls `standards.noSuchStandard` directly (B2), and the local stand-in is gone.
- **Retired, numbers not reused:** C-113.9 (`NO_SUCH_STANDARD`) and C-113.18 (`ALREADY_SUPERSEDED`). C-114.1, C-116.3 and C-116.4 belong to consequences and escalation.
- **Marks.** R7, R18, R19 and R20 were struck (J1, accepted in K400). R1's `*(not yet met: N309)*` is now met; I left it for you to strike, as B2 asks.

**Deferred:** none.

**Found in other modules and artifacts:**
- **DEC-49 guard (legacy-tests).** `node civicos-ui/check-refusal-codes.mjs --strict` shows 24 failures on the merged tree, down from 27 on tranche/T12 before this job. Conformance's sites for `ALREADY_SUPERSEDED`, `NOT_A_PARTICIPANT`, `NO_SUCH_PROPOSAL` and `NO_SUCH_STANDARD` are gone. Arm G still counts two codes whose other sites are in modules running beside me: `NO_SUCH_DETERMINATION` (consequences:71, escalation:498) and `DETERMINATION_SUPERSEDED` (actions:548 `#breachRefusal`, escalation:503). Both clear when those jobs call R19/R20 and retire C-114.1, C-116.3 and C-116.4. The guard's floors (census, rows, regions and the rest) are legacy-tests' to re-pin.
- **Promotion (N318, next tranche).** Stamp C-113.23 (added), C-113.9 and C-113.18 (retired), and C-113.3 and C-113.20 (renamed).
- **Generated artifact.** `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` are stale for `src/conformance/checks.mjs` and `index.mjs`. They are yours to rebuild at layer close.
- **`civicos-ui/` and affordances.** No hits for any code I added, renamed or retired. The only `NO_SUCH_PROPOSAL` matches are in history comments in `check-refusal-codes.mjs` (census and reach notes), not code. Consequences keeps its own `ALREADY_SUPERSEDED` (C-114.15, a revised consequence part), which is a different condition.

**Tests and checks** (on the merged tree @ 71f92ff7ea):
- `node --test test/m/conformance/`: tests 36, pass 36, fail 0, todo 0. The new `helpers.test.mjs` covers R19 and R20. R1 now checks deep equality with `noSuchStandard(id)`.
- Users of conformance and standards: standards 18/0, consequences 24/0, actions 37/0, filings 34/0, escalation 28/0. `test/refusal-wire.test.mjs` 1/0.
- `format`: 0 failures. `architecture`: 8 product files, 0 failures. `coverage`: 20 of 20 live ids, 0 failures. `ownership`: 3 files, 0 failures.

Size (session_01ETXy3wuGNZAj21rDumMzpi): test runs 12, module lines 1256
