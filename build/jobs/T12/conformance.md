# conformance (T12)

**Status** · session_01ETXy3wuGNZAj21rDumMzpi · depth 2 · WORKING · handled B1

## J1 · REPORT

R19 and R20 are pushed on `job/T12/conformance` @ 6c0ed5d174, ready for early merge (B1): `noSuchDetermination(determinationId, extra?)` and `determinationSuperseded(determinationId, supersededBy, extra?)` are exported from `bio-plane/src/conformance/index.mjs` (module-level functions, never throwing, writing nothing; `extra` never replaces a fixed field). Rows: `NO_SUCH_DETERMINATION` C-113.15 (`where` names `noSuchDetermination`), `DETERMINATION_SUPERSEDED` C-113.23 (new; `where` names `determinationSuperseded`). R9 and R7's second supersession answer through them. For consequences, actions and escalation: `import { noSuchDetermination, determinationSuperseded } from "../conformance/index.mjs"`; R20's `superseded_by` is what the caller passes (null when it cannot read the successor).

Also in this push: renames `DETERMINATION_NOT_A_PARTICIPANT` (C-113.3) and `NO_SUCH_COMPARISON` (C-113.20); C-113.9 (`NO_SUCH_STANDARD`) and C-113.18 (`ALREADY_SUPERSEDED`) retired, numbers unused. R1's `NO_SUCH_STANDARD` answers through `standards.noSuchStandard` when present, else a local stand-in answering R17's worded shape with standards' own row C-112.10 (so no conformance row carries the code); it goes when your CHANGE brings standards' helper. For N318 (promotion R34, next tranche): one row added (C-113.23), C-113.9 and C-113.18 retired, C-113.3 and C-113.20 renamed.

Tests: `node --test test/m/conformance/` 36 pass, 0 fail (new `helpers.test.mjs` for R19/R20). Checks: format, architecture, coverage (20/20) 0 failures; ownership 1 failure, `build/requirements/conformance.md`: striking my own R7, R18, R19, R20 marks (as K395). R1's mark stays until standards' helper is merged. Continuing with the rest of the job (UI/affordances grep, remaining review).
