# inquiry (T42)

**Status** · session_01EDm9ED7cpaUXzcsWKrLJar · depth 2 · COMPLETE · handled B2

## Reading (mechanics §17, K2304)

The reading set measured 901 KB, over 300 KB. I read these whole myself: `build/requirements/inquiry.md`; layer 6's row of `build/layers.md`; the plan's entry T42-12; K2496, K2526, K2608 and K2644; `draft-T42-reqs.md` sections N830, N834 and N837; `bio-plane/src/inquiry/index.mjs` and `checks.mjs` (the code the entry changes); `person-warning.test.mjs`, `projects.test.mjs` and `fixture.mjs` (the tests it changes and their fixture); and the used services the entry names: retrieval R6 and R78 with `registerSearchDecoration` and `#decorateHits`, membership R81 (`listenerRefusal`) and entities R6 (`entitiesByAlias`). A worker of mine read the rest of the module whole: `contradiction.mjs`, `grammar.mjs`, `schema.mjs`, `text.mjs` and the other 25 test files. It wrote a summary of about 2,000 words, each statement citing a file and line. Its findings bore on the work:
- C-2.20 cannot go into `INQUIRY_CONTRADICTION_CHECKS` (contradiction.test.mjs:264-277 pins it), so it has a table of its own.
- A reorder must not read as a change (promotion.test.mjs:91-97).
- `dispose`, `ground` and `divide` promote with member authors, so an empty leg delta must not call `fn`.
- The fixture's default retrieval is a stand-in, so the registration is guarded.

## Entries applied

- **T42-12 (N834, K2496, K2648): R62.**
  - `onMachinePassage(module, fn)` is a one-registration slot. Its refusals go through `listenerRefusal`.
  - R11's check calls `fn` after the bias arm (R61), inside the non-replay basis arm, so it runs before the subject, supersession, cycle and contradiction arms.
  - It asks about the legs the revision adds or changes, each as `{ord, target, content_id?, extent_capture?, extent_*?}`. Each leg is compared against the held document's legs by passage, as a multiset with `ord` ignored. When nothing is added or changed, `fn` is not called.
  - A replay is not asked, and neither is an author with a machine identity. An empty author is asked. `viewer` is the author.
  - A refusal from `fn` is answered unchanged. A throw, a promise or any other answer is refused through `machinePassageUnchecked`, the one pure spelling: C-2.20 `MACHINE_PASSAGE_UNCHECKED`, row `INQUIRY_PASSAGE_CHECKS`, with BOB's draft translation. The refusal carries the asked ords as `legs`.
  - The four readings in J1 were adopted in B2 (K2648) and match the code.
- **T42-12 (N830, K2644): R60.** At start, `inquiryOf` registers with `retrieval.registerSearchDecoration("inquiry", …)`. The decoration is synchronous and answers one entry per hit: a question's row gets `projectsOf(id, viewer)`, which is `projects` or `projects: null` with `projects_undetermined`; any other row gets null. Neither key is in R6's hit. If retrieval offers no such registration (a stand-in), it is skipped.
- **T42-12 (N837, K2526): R63** `personFacts` is named in its comment as R63. While I tested it I found and fixed a flaw in this module:
  - **The flaw:** the text was folded with its punctuation stripped (`master's` became `master s`, `J.` became `J`). entities folds an alias keeping its inner punctuation, so a person whose alias holds an apostrophe or a full stop was never found, and no warning was given (R59).
  - **The fix:** runs are now the text's whitespace-separated words, and each run is asked both as written and with edge punctuation trimmed (`sign?` becomes `sign`). Each run is asked once, case-folded. The 8-word and 120-word bounds count these words.
  - **Also:** the per-id lookup is now inside its own try, so a failing read leaves what was found standing and never throws.

## Deferred

None.

## Found in other modules

- `promotion` (L2) stamps the new row C-2.20 `MACHINE_PASSAGE_UNCHECKED` (draft-T42-reqs N834, Users). I did not write it.
- No generated artifact is made stale by this job beyond the `bio-plane` bundle, which BOB regenerates at layer close.

## Tests and checks

- New `machine-passage.test.mjs`, 7 tests on R62:
  - the slot's refusals;
  - a leg not taken up is refused unchanged and nothing is written;
  - another member's acceptance does not count, and her own acceptance lands the leg (the negative control);
  - a held or moved leg is not asked, an added duplicate is asked, and a changed part is asked;
  - 7 malformed answers each give C-2.20;
  - a machine, a replay and nothing registered are each not asked, with a member as the negative control;
  - an empty author is asked;
  - `machinePassageUnchecked` is pure, and `extra` never replaces its fields.
- `projects.test.mjs`, +2 tests on R60's search row:
  - the shown project is answered and a hidden one never is;
  - a non-question row gains no key, and `ids` mode has no hits;
  - a second registration is `DECORATION_DECLARED`;
  - a failed R14 read gives null with why.
- `person-warning.test.mjs`, +3 tests on R63:
  - each source, each once by id, including an alias with an apostrophe (red before the fix);
  - the 8-word and 120-word bounds, with 9-word and word-121 negative controls;
  - a non-person and an unknown id are left out, a failed alias read leaves the subject and ids standing, and it never throws.
- inquiry: 206 tests, 205 pass, 0 fail, 1 todo (R31, MK-5, as before).
- Users' suites (P11), the 33 modules whose uses name inquiry, plus retrieval:
  - Green: hypotheses 47, citation 78, basis-versions 136, strength 143, contradiction 120, ai-runs 81, run-productions 54, capture-requests 108, question-explorer 27, intent 82, investigation 28, docket 59, project-stage 23, ratification 233, case-authoring 181, conformance 87, consequences 41, actions 109, action-plans 63, scheduler 129, affordances 232, queue-producers 84, notice-producers 90, queue 136 (+ `conclude-project` 1), op-declarations 128, store-door 43, control-plane 216, plane 166, retrieval 175.
  - Red, the same tests by name on `origin/tranche/T42` without this change (compared in a separate checkout), so none is this job's:
    - reevaluation 7 (R28 arms);
    - publication 5 (R2 `caseDocumentFacts`, R51 ×3, R52);
    - case-disclosures 1 (R7 `material_attestations`, `carries.test.mjs`; rule 4 (14));
    - answer-envelope 1 (`catalogue-end`, rule 4 (6));
    - `test/system/migrate-released.test.mjs` red as a whole on both (rule 4 (7)).
    - The reevaluation and publication reds are not named in rule 4 as I read it. BOB, please check them; they are red on the tranche itself.
- Checks: format 0 failures; architecture 0 failures; coverage 54 of 54 live ids, 0 failures; ownership 0 failures (6 files, after the final commit).

Size (session_01EDm9ED7cpaUXzcsWKrLJar): test runs 20, module lines 3783

## J1 · QUESTION

R62, four readings I am building on (carrying on; none blocks):
1. **Unchanged leg.** A leg is unchanged when the held document holds a leg naming the same passage: same `target`, `content_id`, `extent_capture` and every `extent_*` (matched as a multiset, ord ignored, as R12 keys its carry-forward by target and extent, never by ord). A leg whose role, grade or note alone changed is not asked: the rule is about the passage cited as hers.
2. **Nothing to ask.** When the revision adds or changes no leg, `fn` is not called (so a throwing `fn` never refuses a promotion that cites nothing new).
3. **Replay.** A migration replay (`pkg.replay`) is exempt, as every other judging arm of R11 is: the record's history is held verbatim.
4. **viewer.** The promotion carries no viewer of its own; `viewer` is the promotion's author, as R11's calculation and bias arms read it. An empty author is asked (only a machine identity is not), failing closed.
