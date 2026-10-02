# strength (T22)

**Status** · session_01N3ZMZGDNGoYFfvWbCxSRaf · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

Four readings I am building on; I carry on meanwhile. Only (2) could change what I build.

1. R5's count is of the hunch legs the answer itself names: the top-level legs (the live basis, the version's legs, the candidate's legs), not hunch legs inside a sub-inquiry the walk inherits from (those are already inert in that inquiry's own pair and are not named here). Key `hunches_left_out` (an integer, 0 when none) at the top of `strengthOf`, `inquiryStrength`, `versionStrength`, `candidatePair` (beside `pair` and `error`) and the pair R17 registers.
2. R5's "withheld as R6 says": only `inquiryStrength` withholds members per R6, so only its count leaves out a hunch whose target the viewer may not see. `versionStrength` today withholds no member inside a visible answer (R7–R10 do not ask it to; its `hunches`, `graded`, `ungraded` and the pair name every leg), so its count equals its `hunches` list. `strengthOf` and `candidatePair` take no viewer. If you want `versionStrength` to withhold unseen legs, that is a change to R7–R10 beyond R5.
3. R29 applies `levels` at every depth of the walk, the corroboration judged among the legs of the basis the leg is in (a sub-inquiry's own basis below the top). The pair ignores the viewer (a record fact, R6's rule that a derivation does not change with its reader); R30's read applies it (a withheld leg never corroborates and is not answered).
4. R30, read strictly: a corroborating testimony leg is on an observation `levels` states at `cover` or `name` (one `levels` is silent on does not corroborate), counted, with both observations' register authors known and different (an unknown author does not corroborate); a corroborating document leg is counted (graded after R1's cap, not a hunch) and its target is neither an inquiry nor an authored observation; an origin read cut at R12's limit does not establish independence, so that leg does not corroborate.

## J2 · REPORT

Reds and stale artifacts from strength's T22 change (branch `job/T22/strength` @ the commit after J1), for you to accept by name or route (P4).

1. **New red, another module's test (DEC-88's predicted caller):** `bio-plane/test/m/case-authoring/members.test.mjs`:129 (the test at :98, "R6: the project's bar is read once…") calls `strengthBarSet({capture: "A", connection: "A", author: "root"})` with no reason and asserts `ok: true`; it now answers `BAR_NO_REASON` (C-107.3). The fix is case-authoring's (L8): send a `reason`. No other new red in the whole `bio-plane/test/m` (4,864 tests: 46 fail, the 45 of the baseline, all on your accepted list, plus this one).
2. **Caller grep** (`strengthBarSet(`, `strengthbar` over `bio-plane/`, `agent-worker/`, `civicos-ui/`): no other caller sets a bar. `strengthbar` stays in `RUNG_ABSENT` (`bio-plane/src/affordances.mjs`), affordances' L11 job; `test/m/affordances/` shows no new red. No UI or agent-worker file names the op.
3. **Row census (accepted red 3):** C-107.3 `BAR_NO_REASON` is a new row of `STRENGTH_BAR_CHECKS`; my record names it `awaiting stamp`. No other row changed (H10 and H12 needed none).
4. **Stale generated artifact:** `bio-plane/dist/bio-plane.bundled.mjs` (and its `.bundle.json`) is stale by my change under `bio-plane/src/strength/`; `test/system/fleetbundles.test.mjs` fails on it and passes with the tranche's `src/strength/` restored. I regenerated nothing.
5. **Answers that gained keys** (additive, no other module's test broke): `hunches_left_out` on `strengthOf`, `inquiryStrength`, `versionStrength`, `candidatePair` (not on its `{pair: null, error}` failure) and the pair R17 registers (inquiry R28/R42 carry it as part of the pair); `levels` on `strengthOf`, `versionStrength` and `candidatePair` only when a caller gives levels. New service `testimonyCorroboration` (R30) for ratification R35. Users' suites: run-productions 39/0, skills 44/0, reevaluation 82/0, ratification 181/0, case-authoring 79/1 (item 1), review 33/0, conformance 54/0, consequences 30/0, filings 58/0, action-plans 43/0, control-plane 100/2 (`doorbell.test.mjs`:310 and `catalogue-end.test.mjs`:15, accepted until L11).
