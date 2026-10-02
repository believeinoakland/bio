# ratification (T22)

**Status** · session_01CMHTBkj1pAWW9cB4KrLMHK · depth 2 · WAITING ON BOB (J2) · handled B3

## J1 · QUESTION

Three questions; I carry on with each on the reading given, and none stops the job.

(1) R22, the contested arm: as you foresaw, `contradiction.candidatesFor` withholds from a null viewer what the plane holds. It skips every candidate whose side lives in a bundle the viewer may not see, and membership R43 lets an absent viewer see nothing. My reading: the examination reads as the plane with the viewer `class:daemon`, the plane viewer intent, monitoring and connections already use, which R43 lets see every bundle. The refusal and capture's reason name only the member ids, never a side. Two consequences of that reading, also mine unless you say otherwise. (a) "Of any weight" is `lead`, `duty` or `plurality`. A `not_shown` candidate (labels `precision`, `unrelated`, K5 unmeasured) is skipped by `candidatesFor` for every viewer and is not a contradiction touching the document. (b) A read that answers `undetermined` (the read failed), or that is truncated with none found, counts the document contested (fail closed), with a reason saying the contradiction read was undetermined.

(2) R35 in the act (R2): `op=caseratify`'s Worker half reads only publication's `casedocfacts` before the signature. No hop in R32's map can ask `strength` between C-92.11 and `CASE_RATIFY_STALE`. My reading: R32's map gains one internal arm, `casetestimony` (the body's `caseId` and `edition`). It answers `{ok: true, refusal}`, where `refusal` is null or the very object the pre-flight builds (one builder in `refusals.mjs`), and the Worker relays it as it relays C-92.11 (409, plus `store` and `tokenClass`). This needs R32's wording to name the arm. Nothing outside ratification calls it.

(3) R35, "at its pinned bytes": `strength.testimonyCorroboration` reads an inquiry's live basis or a named reading, never the bytes at a sha. My reading: it asks each roster member's live basis, with `levels` from `publication.attributionFacts(...).current` (only `group` and `project` are answered), and viewer `class:daemon`. The pre-flight runs before anyone signs, so the act and the pre-flight need one viewer to stay byte-identical, and an unseen leg never corroborates. A member whose head has moved past its pin is judged on its head. The alternative is the reading the case document records for the member (`case_conclusions[].version`), passed as `version`. Say if you want that one.

Also noted, no answer needed now: C-41.16 waits for your CHANGE announcing case-grammar's merge (`whatChangedOf` is not on the tranche yet). `case-grammar` is not in my `uses`, so I will read it through publication's re-export if publication carries it. If not, I will ask.

## J2 · REPORT

Progress, and what I wait on. Branch `job/T22/ratification` @ HEAD, pushed.

Done (each with tests at the interface, `test/m/ratification/` 190/0):
- R22 and R34 (START (1), (2)). One examination of a document (`release.mjs` `examineMember`) is shared by the release and capture's `batch-examination` reader, registered at start in `ratificationOf`. The contested arm reads as the plane (`class:daemon`, K1074) and fails closed. `CONTESTED_IN_BATCH` (C-58.4) comes after `CRUCIAL_IN_BATCH` and before `ENTRY_REQUIREMENTS`. The reader's `class` is R22's refusal code and its `reason` is the refusal's detail.
- R35 (START (4)). `ANONYMOUS_TESTIMONY_UNCORROBORATED` (C-58.5) follows C-92.11 in the act (through the store-half `casetestimony`, K1074) and in the pre-flight. One builder makes it, so the two are byte-identical. Each member is judged at its recorded reading.
- R36 (START (5)). `levelMoved` is told inside `ratifyCaseDocument`'s transaction, after the discharge. It is read from the levels the two signed documents state (`observation_attributions`).
- R14 (START (6)). C-58.4 and C-58.5 are new rows of `RATIFY_SCOPE_CHECKS`, with R14's translations word for word, **awaiting stamp**. No other row changed.
- START (7). `ops.mjs` `Store#gateFacts` and `checks.mjs` `Store#publish` are re-worded to this module's own `gateFacts` and `publish`. The `publishCase` and `store.mjs` mentions that read as live are re-pointed to case-authoring and affordances. Provenance notes stay.

Size: 3,922 lines (from 3,770). C-41.16 is all that is left, about 15 lines.

Users' suites, interim (START (8) list plus capture, strength, contradiction, provenance and bundler; 1,246 tests). My branch and `tranche/T22` fail the same 4 tests: promotion `registry.test.mjs`:58 (accepted red 4's kind, `MODULE_ORDER`), control-plane `doorbell.test.mjs`:310, case-authoring `members.test.mjs`:98/129 (K1065), and membership's module-order test. No new red. I will re-run them, with the whole `test/m`, after C-41.16, and name C-41.16's reds before my merge.

Bundle: `src/ratification/` changed, so `bio-plane/dist/bio-plane.bundled.mjs` is stale. I regenerated nothing.

Waiting on: your CHANGE announcing case-grammar's merge (START (3)).
