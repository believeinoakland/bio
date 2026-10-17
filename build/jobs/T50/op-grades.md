# op-grades (T50)

**Status** · session_0123Ja8xLuQ1vCztuMojXSJ7 · depth 2 · WORKING · handled B1

## J1 · REPORT

Found outside op-grades, and decisions made in this job for `build/rulings.md` (P17; BOB records them).

1. **affordances, `test/m/affordances/t33-backing.test.mjs`** (two R19 tests, around lines 190 and 360) pins `membertie` as `reasoned` with refusal NO_NOTE. R47 (T50) makes it `reversible`, since `membertiewithdraw` takes it back, so both tests fail from this merge. Not edited: the affordances job (T50-19) owns those pins.
2. **control-plane, `test/m/control-plane/totality.test.mjs` R2, R41**: its `stale` list names T50's fifteen new R45 ops, which the control plane's table does not carry yet. It goes green when op-declarations (T50-24) declares them; the merge order already puts that after op-grades. Not edited.
3. **Requirement text (yours):** R2 still lists `planopen` among the undetermined RUNG_ABSENT ops (K732); R47 moves it to RUNGS and the test follows R47. R3's undetermined tally is 109 now, down from 110. R3's enumerated "21" is stale in the same way.
4. **Words by key (R44):** the fifteen new NON_ACTS reasons are source strings, as the module's other NON_ACTS reasons are (unkeyed, none read by a member). None is in `words-reads.json`. If the design wants them keyed, the design lane supplies the keys; I wrote no inline English where a key was asked for.

Decisions (P17), each made in this job and reported as done:
- (a) R46's MARKS is derived from registry@7be06eb4cb, kit@7be06eb4cb and the grades as they stand. Validated first against fa3c8b7e8e: 128 of 128 matched the module's MARKS. The result is 130 rows, and notewrite is the only one that departs from the kit (DEC-300 (5)).
- (b) membertie's grade is edited in `./t33.mjs`, its op's own table, not overridden in `./t50.mjs`.
- (c) planopen and wizarddraft are in `./t50.mjs` RUNGS and removed from index.mjs RUNG_ABSENT.
- (d) "labelled" is re-spelled "labeled" in every string literal of op-grades and its tests (comments left as written; plan rule 6 (3)).
- (e) Beyond the R-amended pins: owners' REASON_CODE drops membertie, and TAKEN_BACK_BY gains membertie → membertiewithdraw.
- (f) No pull request opened (JOB step 1: "Open no pull request").
- (g) Pre-existing reds, identical on a clean HEAD worktree and not from this job: 14 in affordances, control-plane, wizard-scripts, screens-action, screens-daily and screens-settings; 22 in op-declarations, interface-shell, screens-intake, screens-investigate and plane.
