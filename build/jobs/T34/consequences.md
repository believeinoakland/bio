# consequences (T34)

**Status** · session_01RaoeTVfrUWUHf3SRHH852X · depth 2 · COMPLETE · handled B1

## Completion

**Entries applied.** T34-49 whole:
- R2 (N576 as widened, K1649): whether a calculation operand is held and visible to the author is read through `calculations.calcStatusOf` (its R31), and its grade is the `capture` of `gradeFactsOf` (its R30). An operand not held, or not visible to the author, is an operand not in the record (R4, `not_in_record`), answered word for word as an absent one and synchronously (nothing waits on `read`). An operand the author may see takes its value from `calculations.read` under the key, as before.
- R15: a calculation operand leaves `computation.operands` exactly when `calcStatusOf` answers it not `visible` to the viewer. The interim fail-closed reading through `gradeFactsOf` is gone, so no member viewer that calculations admits has the operand withheld.
- R16 (N600): `#seesPerson` reads `people.sourceLinkSight(person)` alone. `null` (no link held) leaves the capture's sight to decide; a list admits only its members. The `sourceLinksOf` fallback is removed. A person withheld for a link is answered exactly as for a capture the viewer may not see. If people is absent altogether, the person is withheld (fail closed, since whether a link is held cannot be known).
- Reds cleared: `computed.test.mjs`:176 is inverted (alice, and pat too, are answered the part whole; K1795). `person.test.mjs`:84, the interim test, is retired, along with its stand-in for `sourceLinkSight` (K1791). Two R16 tests replace it, run against the real people module: no link held; a person withheld for a link answered identically to one withheld for a capture; several links admitting their intersection. Also added: R2's test of the synchronous reads (grade from `gradeFactsOf`; not visible to the author means not in the record) and R15's test (withheld exactly when not visible).
- Fixture: the unused `people:` stand-in option was removed (affordances' `backing.test.mjs`, which imports this fixture, still passes 21/21).
- DEC-149: no member-facing string added; none met.

**Deferred.** None.

**Found in other modules.** None.

**Tests and checks.**
- `node --test bio-plane/test/m/consequences/*.test.mjs`: tests 41, pass 41, fail 0 (baseline before the change: 38 tests, 36 pass, 2 fail, the two named reds).
- `node --test bio-plane/test/m/affordances/backing.test.mjs` (uses this fixture): 21 pass, 0 fail.
- No layer tests are named in `build/manifest.md`. No service I provide changed.
- format: 127 modules, 126 requirements files; 0 failures.
- architecture: 11 product files, 49 relative imports; 0 failures.
- coverage: 16 of 16 live requirement ids named by a test; 0 failures.
- ownership: 5 files changed by consequences between tranche/T34 and HEAD; 0 failures.

Size (session_01RaoeTVfrUWUHf3SRHH852X): test runs 7, module lines 1443
