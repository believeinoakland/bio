# explore (T34)

**Status** · session_01GwJdLNiEcK1ZBdPfzmRXHC · depth 2 · COMPLETE · handled B1

## J1 · QUESTION

R19: which of a derivation's `inputs` "name a hop". Real owners' inputs are mostly not hops: duties' `met_by` names `[duty_id, event_id, occurrence_key]` (the ends and a free-text key); connections' `mentioned_together` names objects `{entity}`, `{end, capture, ref}`. A hunch hop's id is a `HYP-` record id. If every input not read at the ends were "undetermined", no `met_by` connection could ever re-derive (its occurrence key is no connection), and hypotheses R6 would refuse every leg on one.

My reading, which I am building on: an input is
- one of the derivation's own two ends → the end, not a hop (`hop: false`);
- an object without `connection` or `id` (`{entity}`, `{end, capture}`, `{source}`) → a cited record, not a hop;
- `{connection}`/`{id}`, or a string that is a record id (`record-grammar`) or a derived id (64 hex) → it names a hop: read among the connections at the two ends with `scope`; found → reported with its class (a hunch as a hunch, R6); not read → `undetermined` with one reason that is the same whether it does not exist, is withheld or is a hunch outside scope (R7), forcing `matches: false, undetermined: true`;
- any other string (an occurrence key) → a value the method names, not a hop.
`scope` malformed (not `{inquiry}`) is refused `BAD_SCOPE`, as `explore` already does.
Hypotheses does not yet pass `scope` to `rederive` (its T34 job's share, not mine). Nothing here waits on the answer.

## J2 · COMPLETE

**Completion** (commit fc3dea2919 on `job/T34/explore`).

Entries applied:
- **T34-24 (R19):** `rederive` takes `scope` `{inquiry}` (malformed: `BAD_SCOPE`) and passes it to every owner read: the held derivation and both ends over every registered kind. A hunch hop of that inquiry the viewer may see is reported with class `hunch` (`declared_or_hunch: true`, a lead). An input naming a hop that is not read is `{input, class: null, undetermined: true, why: INPUT_NOT_READ}`. The reason is the same whether the hop is not held, withheld, or a hunch outside scope (R7). Any undetermined input forces `matches: false, undetermined: true`. Which inputs name a hop follows my J1 reading (unanswered so far; I'll bring the code in line if the ANSWER differs). The conditional hub bound (N566) is not folded (K1746), so it is not applied.
- **T34-78 (DEC-149):** `timeline.mjs`:32 refusal `why` and :47 `money_note` now say "your group's Civicsmith has no events/money record connected…". A test names both strings. No other member-facing string in the module says instance, copy, plane or server; the remaining hits are comments and the control plane's stamp.
- R12's test fixture names its source input in the object form real owners use (`{source}`), since a bare record-id string now names a hop.

Deferred: none.

Other modules (REPORT-worthy, listed here):
- **hypotheses:** `#judgeDerived` calls `rederive` without `scope`. Until it passes the leg's inquiry, every leg on a derivation resting on a hunch is refused `LEG_NOT_REDERIVED` (fail closed) rather than `LEAD_NOT_A_LEG`. Its R6/R19 share is its own job's.
- **Generated artifact:** the plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`, `not_product`) is stale from `src/explore/`; it is regenerated at layer close.

Tests and checks:
- `node --test bio-plane/test/m/explore/`: 27 pass, 0 fail.
- Users of `rederive`: `test/m/hypotheses/` 14/14 pass; `test/m/affordances/` 192/192 pass.
- Layer tests: none named in the manifest.
- `format`: 0 failures. `architecture explore`: 0 failures. `coverage explore`: 19 of 19 live ids named, 0 failures. `ownership explore tranche/T34`: 5 files, 0 failures.

Size (session_01GwJdLNiEcK1ZBdPfzmRXHC): test runs 7, module lines 753

## J3 · REPORT

hypotheses: `#judgeDerived` (bio-plane/src/hypotheses/index.mjs ~:364) calls `explore.rederive` without `scope`. With explore R19 merged, a leg on a derivation resting on a hunch is refused LEG_NOT_REDERIVED (fail closed, never passed) instead of LEAD_NOT_A_LEG until hypotheses passes the leg's inquiry as `scope: {inquiry}` (hypotheses R6; N582). Generated artifact: the plane bundle is stale from src/explore/ (regenerated at the layer's close).
