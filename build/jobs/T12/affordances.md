# affordances (T12)

**Status** · session_019nqDEB4hQb2Jh2ENi3A6bQ · depth 2 · COMPLETE · handled B2

## J1 · COMPLETE

**Entries applied** (B1: every renamed code the `reasoned`, `JUSTIFICATION_REFUSALS` or `NON_ACTS` lists name, and `monitorpause`'s refusal):
- The lists named only one retired code. The justification family's "deliberately not in this family" list (`affordances.mjs`, the comment on `JUSTIFICATION_REFUSALS`) named the shared `NO_LABEL`, which N285 split. It now names `ENTITY_NO_LABEL`, `PROGRESSION_NO_LABEL` and `EXPERTISE_NO_LABEL`. `NO_SUCH_KNOCK` and `NO_SUCH_COMPARISON` fall under its existing `NO_SUCH_*` entry.
- The lists name none of K380's other renames, under either the old or the new name: `DETERMINATION_`/`CONSEQUENCE_`/`ESCALATION_NOT_A_PARTICIPANT`, `CONSEQUENCE_NOT_NONCOMPLIANT`, `EDGE_NOT_PROPOSED`, `PROGRESSION_VERSION_NOT_HELD`. No act list needed a new code: the layer-9 reasoned acts still refuse an absent reason `NO_REASON`, and `backing.test` drives each one.
- The `NOT_A_PARTICIPANT` at `affordances.mjs` (the roster block) and `facts.mjs`:117 is membership's `projectLeave` code. K380 did not rename it, so it stays.
- `NON_ACTS.monitorpause` (N314, K404): now "an administrator's setting over the instance's own fetching, refused NOT_AN_ADMIN to a member who is not one". It used to say "machine-directed", which stops being true once members reach the op. `RUNG_ABSENT.monitorpause` already says "an administrator's setting" and is unchanged.
- R19's test (`catalogue.test.mjs`) now checks that the three `*_NO_LABEL` codes, `NO_SUCH_KNOCK`, `NO_SUCH_COMPARISON` and `NOT_AN_ADMIN` are outside `JUSTIFICATION_REFUSALS`.
- No `not yet met` mark is met by this work. R26's mark (N231) stands, because the control plane still publishes the module-level `VOCABULARIES`, and `plane.test`'s `test.todo` names that cause.

**Tests and checks.**
- `node --test test/m/affordances/`: tests 75, pass 74, fail 0, todo 1 (R26, N231).
- `node --test test/rung-ladder.test.mjs`: 50 PASS, 0 FAIL (309 ops, 169 mutating, 51 rungs, 118 stated absences).
- `civicos-ui/check-refusal-codes.mjs`: 17 failures, before and after this change (with the change committed). The FAIL lines, census (1074), reach (818) and untranslated partition (288) are identical, so the change adds none. The failures belong to other modules: arm G's `NOT_FOUND` and `MINT_EXHAUSTED`, floor slack, the unclaimed `is-listener-registration` marker, and `gate.mjs`'s codeless refusal.
- Process checks: format 0 failures; architecture 0 failures; coverage 27 of 27 live ids, 0 failures; ownership 0 failures (no legacy line added).

**Found in other modules (REPORT, from the greps B1 asked for).**
1. legacy-ui: `civicos-ui/app.html`:17024's `entitycreate` probe still expects `NO_LABEL`, where entities now answers `ENTITY_NO_LABEL`. This is already routed (K387).
2. legacy-tests: `civicos-ui/check-refusal-codes.mjs`:3718 describes `NOT_AN_ADMIN` as "D-134: four sites", but monitoring's `pause` is now another site. This is already routed (K404: DEC-49's census).
3. No other hit in `civicos-ui/` for `NO_LABEL`, the renamed codes or `NOT_AN_ADMIN`.
4. No check row added or changed: nothing for promotion R34 to stamp (N318). I made no generated artifact stale. The plane bundle carries `affordances.mjs`, but the change is to a comment and a `NON_ACTS` sentence, and the bundle is regenerated at layer close.

Deferred: none.

Size (session_019nqDEB4hQb2Jh2ENi3A6bQ): test runs 7, module lines 2719
