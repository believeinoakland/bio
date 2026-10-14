# inquiry (T48)

**Status** · session_01Hz97U1FS7Ei861sY2S4h4N · depth 2 · WORKING · handled B1

## Record

**Entry applied.** T48-26 (N1012, K3092, K3102; K231): R64. R11's check refuses every revision of an inquiry whose held state is `divided` (a promotion with a base, not a migration replay), first among its arms and decided on the held head, with `DIVIDED_CANNOT_RESTRUCTURE`; nothing is written. One code, one site: the new exported pure `dividedCannotRestructure(detail, extra?)` (DEC-49 region `is-divided-closed`) mints it for both R64's check and `ground` (R27, re-pointed; its order unchanged). The answer carries `target`, `from: "divided"` and `code`; the check's answer also names `children` (the held `division.into`) and its detail says to work on the child that carries the part meant. No catalogue row. `divide`'s own write of the parent (from a non-divided head), its children's creation and every revision of a child land.

**Reading.** Requirements and all six code files read whole by me (P20). The reading set was over 600 KB (K2700), so per K2032 two helpers in this session read in full and digested, citing file:line: (1) every file under `bio-plane/test/m/inquiry/` (30 files); (2) the public parts of `promotion`, `citation`, `leg-earning`, `inquiry-grammar` and the relevant parts of `record-core` (head, readFile, transact), citation's `sever` code and its `sever-inquiry` test, and every other module's code and tests that write a divided question. I read the fixture, `ground.test.mjs` and the first half of `divide.test.mjs` whole myself. No flaw found in the module needing a fix in this job.

**Tests.** New `bio-plane/test/m/inquiry/divided-closed.test.mjs` (6 tests, R64 and R27): a revision shaped as citation's sever (the leg's reference marked `severed`) is refused, and the head, bytes and `inquiry_basis` are unchanged; `ground` answers the same code from the same helper (deepEqual against the helper); every other door refused (reinstate, leg added, conclusion, grouping, the same bytes); controls: the same sever lands on an open question, a child's revision lands, divide lands; a replay is not asked; the helper's purity. Confirmed red without the change.
- `node --test bio-plane/test/m/inquiry/`: tests 212, pass 211, fail 0, todo 1 (R31, MK-5, standing).
- Users' tests (helper run over leg-earning and the 34 modules using inquiry): all green except affordances, answer-envelope, capture-requests, control-plane, op-declarations, scheduler, `test/conclude-project.test.mjs`; those run on this branch and on `origin/tranche/T48` without the change give the same `pass 918, fail 29` both ways: inherited, none mine (op tables, sign-in, plane).
- No layer tests are named in the manifest.

**Checks** (process repository): `format` 0 failures; `architecture inquiry` 0 failures; `coverage inquiry` 55 of 55 live ids, 0 failures; `ownership inquiry tranche/T48` 0 failures; `run.mjs` over the product: architecture 0 failures (3287 files), format 0, channels 0; coverage 37 failures, none in inquiry (other modules' ids, the accepted reds).

**Found in other modules (REPORT).**
- `citation` (R1, R15; later in the order): its `sever-inquiry` relay test uses a stub step; with R64 the real answer to a sever of a divided question also carries `target`, `from: "divided"` and `children`, relayed with `project`, `handle`, `drift` (`#edgeTransition` :357). Its job confirms the relay with a real divided question (R64's test sentence).
- `basis-versions` (`#moveVersionState`, `appendVersion` through `#repromote`, `narrow`), `run-productions` (:534) and `reevaluation` `adoptVersion` (:2860) write an inquiry with no state guard of their own; on a divided question they are now refused `DIVIDED_CANNOT_RESTRUCTURE` and relay it (reevaluation already filters divided holders, :2353-2374). No test of theirs writes a divided question; their requirements may want to name the refusal.
- Generated artifacts: the plane bundle and `program.mjs` are staled by this source change (accepted red, rule 5.5); not regenerated here (mechanics §14).

**Deferred.** None.

Size (session_01Hz97U1FS7Ei861sY2S4h4N): test runs 5, module lines 3825
