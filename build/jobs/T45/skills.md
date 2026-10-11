# skills (T45)

**Status** · session_01Y1gCFWV8D7jsn2qWspkB6T · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

R46's input: `reading-guides.procedureGuidesFor` (its R13) is not built yet (its job has only started), so its answer's shape is not fixed. My best reading, which I am building on now:

1. As R40 does for `guideFor`, this module imports nothing of it: the run's caller passes `procedureGuidesFor`'s answer to `renderPack(published, { procedure_guides })`. I accept the answer as `{kind, guides: [{guide, origin}], label}` (R13: the profile's guide first, then the group's approved ones, each with its origin; `label` the legal-information label keyed `guide.procedure.legalinfo`), or a list of such answers (one per action kind the run concerns). Each guide is rendered as `{kind, guide: <id>, origin, items}`, the items only (`{route, expect?, citation}`), and the layer carries the answer's `label` unchanged. No guide passed: a stated absence in R9's form.
2. R16 runs over every string field of every item (`route`, `expect`, `citation`); a hit throws naming the guide and the item, and nothing renders (R40's form). R4 (`checkGuide`) is not run here: R46 names only R16, and R13 narrows R4 for procedures anyway.
3. Placement: `action_drafting` after `interface_translation` (R45), and `procedure_guide` straight after `action_drafting`, so the action layers sit together, before `wizard_scripts`.

If reading-guides' job settles another shape, I will match it when you merge tranche/T45 into my branch (a CHANGE).

## J2 · COMPLETE

**Entries applied.** T45-13 (N858, N861, N887), on B2's answer (K2820):
- R28: `ACTION_SOURCE` is `BIO_Action_v0_2.md`; the `action_planning` layer carries v0.2 §4 rules 1, 2, 4, 7, 9, 10, 12, 13, 16, 19 and 21, each heading and sentence a span of its rule's paragraph (R21's normaliser); `load_when` adds "or re-examines a plan after a recorded response". R29's rule-12 clause is v0.2 rule 12's (the hostile-response branch, and "A packet never says "you have a claim" nor whether a protection applies").
- R30: the `filing_drafting` layer carries rules 1, 3, 11, 13 and 14 (v0.1's 7 now 14; rule 3's record check added).
- Every quoted rule is held once, frozen, in `ACTION_RULE_TABLE` (§4 order); `ACTION_RULES`, `FILING_RULES` and `ACTION_DRAFTING_RULES` select from it by number, so the three layers carry the same objects. Rule 3's sentences with a place's name in their examples are left out (R26); spans stop before them.
- R45: `actionDraftingLayer(catalog)`, in `disclosed` after `interface_translation`: authored, R45's `load_when`, rules 1, 2, 3, 9, 12, 16, 19, 21, `mode` run-rules' `DRAFT_MODE.mode`, `acts.drafts` `textcheck`, `infractiondraft`, `bearingdraft` (each `defined_by` `agent-worker R76`, named once as a selector). None published: a stated absence (R9's form). Some published: a missing one throws naming it (R1).
- R46: `procedureGuideLayer(answers)`, straight after `action_drafting`. `renderPack(published, { procedure_guides })` takes `procedureGuidesFor`'s answer `{kind, guides: [{guide, origin, items}], label}`, or a list of them. Each guide renders as `{kind, guide, origin, items}` in the answer's order, the label carried unchanged, `sourcing` `guide`. R16 runs over every item's `route`, `expect` and `citation`; a hit throws naming the guide and the item. With none passed, a stated absence. Nothing of reading-guides is imported.
- `skillpack.mjs`: `SOURCING` gains `action_drafting`, `action_drafting_unpublished`, `procedure_guide`, `procedure_guide_none`; the v0.1 comments re-pointed.

**Read.** I read my requirements, both source files and every test file under `bio-plane/test/m/skills/` whole (P20). I also read, whole, `BIO_Action_v0_2.md`, draft-lower §6 and §8, K2780/K2781/K2787/K2783, layer 6's contract and the public parts of all ten modules in my Uses.

**Flaws fixed in my module (P8).** Three stale comments:
- the resident layer was called "four members" (it has five);
- the sourcing header said authored doctrine was "four sentences", and did not name the `guide` kind;
- comments still pointed at `BIO_Action_v0_1.md`.

**Deferred.** None.

**Found in other modules.**
- `agent-worker` (T45-15) and `plane`: to load R46 the caller passes `procedureGuidesFor`'s answer as `renderPack`'s `procedure_guides` option, as it passes `reading_guides` for R40. agent-worker R77 reads the `action_drafting` layer by that key.
- The plane bundle (`bio-plane/dist`) is stale, as every merge makes it (rule 4 (5)). No other generated artifact reads skills: agent-worker's bundle has no skills input since T18.

**Tests and checks.**
- Tranche merged @ 99df16ba94.
- `node --test bio-plane/test/m/skills/*.test.mjs`: tests 113, pass 113, fail 0. This clears K2783's two reds, `planning.test.mjs` R28 and `filing.test.mjs` R30.
- New `action.test.mjs`: 8 tests naming R45 and R46, each throw with its control. `planning`, `filing`, `pack` (R5 order) and `translation` (R39's neighbour) were updated.
- Users:
  - investigation, answer-envelope, control-plane: 286 tests, 285 pass, 1 fail. The fail is the inherited R53 "every op T33's owners' maps serve…" (rule 4 (12), duties' ops until T45-45/38/39). It fails the same with my change stashed.
  - agent-worker (`test/*.test.mjs`): 14 pass, 0 fail.
- format: 0 failures. architecture: 0 failures. coverage: 46 of 46, 0 failures. ownership: 0 failures.

Size (session_01Y1gCFWV8D7jsn2qWspkB6T): test runs 14, module lines 3032
