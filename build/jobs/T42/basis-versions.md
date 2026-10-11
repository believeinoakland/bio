# basis-versions (T42)

**Status** · session_01AkVF4j1J6wBNaS7xV4FvCJ · depth 2 · WORKING · handled B3

## Completion

**Read** (mechanics §17; START measured 729 KB, over 300). I read these whole:
- `requirements/basis-versions.md`
- the plan's T42-16 entry, `draft-T42-reqs.md` §N834, K2496 and K2608
- the code the entry changes: `src/basis-versions/index.mjs` (1,844 lines)
- `test/m/basis-versions/fixture.mjs` and `registration.test.mjs`
- the services R49 uses: promotion's step check context (`promotion/index.mjs` 352–372, 520–535 and 770–840); inquiry's `biasNotInForce` (R61, for its form) and, after B4, its real `machinePassageUnchecked` (R62)

A worker read the rest of the module whole: `checks.mjs`, `grammar.mjs`, `schema.mjs`, `text.mjs` and every other test file, about 330 KB. It wrote a summary of about 6 KB, each statement citing file:line, covering:
- the leg fields from `versionsIn`
- how a machine author is recognised
- C-25's numbering (the highest is C-25.35, and the sets are pinned by tests)
- each test file's ids and calling idioms
- the points that bear on R49

I did not read layer 6's row of `layers.md` separately.

**Entries applied.** T42-16 (N834, K2496; readings K2652), R49:
- `onMachinePassage(module, fn)` takes one registration, and refuses a malformed or second one through `listenerRefusal`, as R40 does.
- R6's check of a promotion by anyone but a machine (a blank author is asked; a replay is not) calls `fn({legs, author, viewer: author})` once. It asks over each leg of every version the revision adds, `narrow`'s version included. When a held version that a machine authored moves to `accepted`, it asks over that version's legs.
- Each leg goes to `fn` in inquiry R62's shape plus its `version`. `ord` is the leg's row in `basis_version_legs`.
- A refusal from `fn` (`ok: false`) is returned unchanged and nothing is written. A throw, or any other answer (a Promise included), is refused through `inquiry.machinePassageUnchecked`.
- `versionAccept`'s `preview` asks `fn` directly, because it does not promote.
- A machine's `appendVersion` is never asked. With nothing registered, no leg is refused.
- New `test/m/basis-versions/machine-passage.test.mjs`: 9 tests, each naming R49, with negative controls. Negative control on the code itself: with the check arm disabled, 7 of the 9 fail.

**Deferred.** None.

**Found outside this module.**
1. Users' suites (P11), on the tranche after inquiry's merge: 20 suites, 4 with reds. Each red is either the same on the commit before my change or comes from inputs this job did not touch:
   - `test/m/reevaluation/source.test.mjs` :35–:147, 7 tests: the fixture's `sourceOf` is refused `NO_SUCH_SOURCE` (C-121.1).
   - `test/m/publication/sources.test.mjs` :59, :75, :104, :142, :153, 5 tests: the fixture's knock is refused `NO_SUCH_SOURCE` (C-121.1).
   - `test/m/answer-envelope/catalogue-end.test.mjs`:17 (assertion :27): rule 4 (6).
   - `agent-worker/test/requirements.test.mjs` R45, 2 checks: the agent-worker bundle is stale from agent-model's `model.mjs` and `signin.mjs` and agent-worker's own `index.mjs` and `ops.mjs`. These came in with the tranche merge; none are this module's inputs. It is BOB's to regenerate at layer close.
   - `test/system/migrate-released.test.mjs`: 1 test, also red on the commit before my change. It looks like rule 4 (7), `ai_ceilings`; I did not read its message.
   - The other 15 suites are green: strength, contradiction, run-productions, skills, question-explorer, investigation, case-tensions, project-stage, ratification, case-authoring, review, affordances, queue-producers, store-door, control-plane, and plane's `test/m`.
2. Generated artifacts: this source change stales the plane bundle and `case-checker/program.mjs` (rule 4 (10)). I did not regenerate them.
3. Promotion will need to stamp nothing new for this module: R49 adds no catalogue row. C-2.20 is inquiry's, and C-104.32 is run-productions'.

**Tests and checks.**
- `node --test test/m/basis-versions/` (with inquiry merged): 145 pass, 0 fail.
- Users' suites: as above.
- `manifest.md` names no layer tests.
- `format`: 147 modules, 146 requirements files; 0 failures.
- `architecture basis-versions`: 27 product files, 96 relative imports; 0 failures.
- `coverage basis-versions`: 46 of 46 live requirement ids named by a test; 0 failures.
- `ownership basis-versions tranche/T42`: 3 files; 0 failures.

Size (session_01AkVF4j1J6wBNaS7xV4FvCJ): test runs 10, module lines 3760

## J1 · QUESTION

R49 implemented on my best reading; four points I settled, and I'm carrying on with them unless you say otherwise:
1. The leg handed to `fn` is inquiry R62's shape plus the version: `{version, ord, target, content_id?, extent_capture?, extent_*?}`. `ord` is the leg's row in `basis_version_legs` (R3's precedent), and a field is absent when the row doesn't carry it.
2. The accept arm is a rule of R6's check: any promotion by a non-machine that moves a held version a machine authored (the version's own `author`) into `accepted`. That covers `versionAccept` and also a raw `op=promote` that flips the state, so the arm can't be bypassed. A `preview` (R14) asks `fn` directly, because it doesn't promote. So a real accept asks once, and a preview asks once.
3. "Author is not a machine": only `isMachineIdentity(author)` is exempt. A promotion with a blank author is asked (fail closed). A replay is skipped, as all of R6 is.
4. The registration slot is R40's form (`listenerRefusal`). The unchecked refusal is `{...machinePassageUnchecked(detail, {legs}), ok:false, reason: code, findings}`.
Blocking only on inquiry R62's export `machinePassageUnchecked`: I'm testing against a local stub that is never committed. I'll merge and re-run when your CHANGE says inquiry is merged.
