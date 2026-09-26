# skills — requirements

**Status** · DRAFT by a drafting worker for BOB #42, 2026-09-26 (P18), from a reading of the code; for Bob's approval (a product module, P17). Layer 6. Code today (measured on `tranche/T3` @ `062e69f6`): `bio-plane/src/skillpack.mjs` 519 lines (187 without comments and blanks) and `bio-plane/src/skilldoctrine.mjs` 1,108 (635). Both already sit at this module's paths; nothing moves in from `store.mjs`, `schema.mjs` or `index.mjs`. One catalogue row moves in from `legacy-checks`: C-22.7 (`build/extraction/skills.md`). Callers: `store.mjs` `aiRunOpen` calls `checkSkillVersion` (`ai-runs`' after extraction); `agent-worker`'s tests import `reportsAs`. Nothing in production renders the pack (`agent-worker`, Open for Bob 1). Not yet met: R10 (SK-5), R21 (Open for Bob 1). Measured 2026-09-26: `skillpack.test.mjs` 47 pass, 2 fail (F3, F4); `skilldoctrine.test.mjs` 42 pass, 1 fail (E3), all three because `CLAUDE.md` no longer holds the sentences they pin (R21); `skillprohibitions` 30/0, `skillsequencing` 27/0.

**Size (P6).** 1,627 lines (822 without comments and blanks), plus a 26-line catalogue row. Its four suites and their controls are 3,488 lines. Far under the 4,000 at which BOB reports a module; a job reads both files whole with the public parts of `ai-runs` and the catalogue rows it imports.

## Public

### Purpose

The instructions an AI run works under: the doctrine pack. It renders, from what the plane publishes and from the modules that enforce each word, a resident layer every run holds from its first token (the objective, the machine/member boundary, the four-level rule, the absence vocabulary) and progressively disclosed layers a run loads when its work needs them (the judgement clauses, the prohibitions, the deployment order, vocabularies, acts, bounds, refusals, recipes). The pack's version is derived from what was rendered, so two runs under different instructions are distinguishable in the record. It holds no gate: every fence it names is code elsewhere, and a model that ignored every word of it would get past nothing (§14b.4). Its one refusal is that a run must name the version it runs under.

### Provides

Terms. **published** is the plane's own answer to `op=affordances` with no target, `{catalog, vocabularies, capture_acts}`, passed in unchanged. **catalogue** is the check catalogue's module namespace (every `*_CHECKS` family). A **layer** is `{load_when, sourcing, body}`; `sourcing` is one of `authored`, `imported`, `driven`, `absent`. Every function here is pure.

**`renderPack(published, catalogue)`** → the pack `{id, edition, resident, disclosed, sourcing, version}`.
- **R1** Throws an `Error` naming the missing source, and renders nothing, when `published.vocabularies` is absent or has no keys, `published.catalog` is absent or empty, `machineFences(catalogue)` is empty, `memberOnlyActs(catalog)` is empty, or the imported levels or absence states are empty. An empty layer is never rendered as a rendered one.
- **R2** `resident` has exactly `objective`, `boundary`, `four_level`, `absence` and `disclosable`. `objective.text` is the objective sentence and `boundary.rule` the boundary sentence (`INVESTIGATIVE-SESSION.md` §2, §4); `four_level` carries the four-level rule, the search-completeness rule, the levels (`OBSERVATION_LEVELS`) and the answer shape `["level","state","searched","not_searched"]`; `absence.states` is `OBSERVATION_STATES`. Each member carries its source and its `sourcing` label.
- **R3** `boundary.fences` is `machineFences(catalogue)` and `boundary.member_only_acts` is `memberOnlyActs(catalog)`; `boundary.fences_note` states that the fences shown are only those with a canned translation, and the pack paraphrases none.
- **R4** `disclosable` lists every key of `disclosed` with its `load_when`, and nothing of any body.
- **R5** `disclosed` holds the judgement layers (R14–R20: `composition`, `description`, `search`, `absence`, `prohibitions`, `deployment_sequence`, `judgement_boundary`), then `vocabularies` (body: `published.vocabularies`, unchanged), `acts` (`{catalog, capture_acts}`, `capture_acts` `[]` when not a list), `bounds` (`RUN_BOUNDS`, `RUN_ENDINGS`), `refusals` (every `AI_RUN_CHECKS` code as `{check, says}`, `says` the canned translation verbatim) and `recipes`. Every layer has a non-empty `load_when` and a `sourcing`.
- **R6** `version` is `packVersion(pack)`; `id` is `investigative-session`, `edition` the authored doctrine edition.

**`machineFences(catalogue)`** → `[{code, family, check, says}]`, never throws.
- **R7** Every row of every family whose name ends `_CHECKS` whose code starts `MACHINE_CANNOT_` and carries a non-empty `translation`; `says` is that translation verbatim, `check` the row's C-number or `null`; sorted by code. A family or row of another shape is skipped.

**`memberOnlyActs(catalog)`** → `[{id, label, mode, prompt}]`, never throws.
- **R8** Every act whose `mode` is a string other than `machine`, sorted by `id`; `label` and `prompt` `null` when absent; a non-list gives `[]`.

**The recipes layer.**
- **R9** Until R10 is met, `recipes` has `load_when` `"never, in this edition"`, `sourcing` `absent`, `body` `[]` and a non-empty `absent_because`: the absence is stated in the pack itself.
- **R10** `recipes` carries multi-step paths as data, each step naming a surface id and an act; a recipe naming a surface or act the product does not publish fails the build. *(not yet met: SK-5; waits on a surface registry the plane publishes)*

**`packVersion(pack)`** → `"investigative-session@<edition>+<digest>"`, the digest 16 lowercase hex characters.
- **R11** Computed over the pack without its `version` field, in canonical form (keys sorted at every depth). The same pack gives the same string; a change to any rendered word, including a published vocabulary word, gives a different digest. It is an identity digest: nothing gates on it.

**`checkSkillVersion(version)`** → `null` when acceptable, else `{ok:false, code:"AI_RUN_SKILL_VERSION_UNNAMED", check:"C-22.7", translation, detail}`; never throws.
- **R12** A non-string, empty or all-blank value is refused. A trimmed value that is not `<pack>@<edition>` with no whitespace and exactly one `@` (a bare `"3"`, say) is refused, its `detail` quoting at most 60 characters of it. Any well-formed value is accepted, including one this module never rendered, so a rerun under a newer pack can record it.

**`parseSkillVersion(version)`**
- **R13** Returns `{pack, edition, digest}` (`digest` `null` when there is no `+`) for a value R12 accepts, and `null` for one it refuses; never throws.

**The judgement doctrine** (`skilldoctrine.mjs`), exported as data.
- **R14** `DEFERRED_ROWS` and `JUDGED_ROWS` are the two columns of `INVESTIGATIVE-SESSION.md` §14b.4's table, verbatim and in order. The skill's authority is exactly `JUDGED_ROWS`.
- **R15** Every clause of `CLAUSES` has `judges` ⊆ `JUDGED_ROWS` and `defers` ⊆ `DEFERRED_ROWS`; the union of all `defers` is all of `DEFERRED_ROWS`; each clause has a non-empty `enforced_by` (C-numbers read from the catalogue by key, never typed, except C-2.8, which has no keyed row) or a non-empty `unenforced_because`.
- **R16** `controlFlowAuthority(text)` returns the names of the control-flow patterns the text carries (a count or bound on passes, sub-sessions, fetches, attempts, rounds, versions or searches; a termination condition; the termination decision handed to the reader; self-assessed recall as a stopping rule; a loop written as an instruction), `[]` for a non-string. It returns `[]` for every clause's `decides` and every text field of every prohibition and of the deployment record, and a non-empty list for a text that states a pass budget or a stopping rule.
- **R17** `PROHIBITIONS` holds five items (no generated justification; no single confidence score; no connection-density ranking; machine-proposed connections never presented as connections; nothing is boilerplate), each with `text` and `because` found verbatim in its `source`, `also_named_in` found in `INVESTIGATIVE-SESSION.md`, and a non-empty `does_not_reach`. `PERMITTED_AUTO_COMPOSITION` (assembling a member's own prior words, stopping at the first new word) is carried beside them and is not a sixth prohibition.
- **R18** `DEPLOYMENT_SEQUENCE.order` is `["check", "investigate", "extract"]`, `first_deployed_mode` is its first member, `verification_recorded` is `null` until a verified live run is recorded, and the record holds no flag, predicate or decision: `enforced_by` is empty and `GATE_ADDRESS` names where the gate is (`agent-worker`'s `MODES` and `CONTROL_FLOW["gate-mode"]`).
- **R19** `absenceByLevel()` has one entry per `OBSERVATION_LEVELS` key, in that order: `states_when_absent` is that level's fact (meaning: "no meaning derived"; content: "nothing extracted"; document: "no document"; internet: "nobody looked"), pairwise distinct, `null` for a level the doctrine holds no fact for; `ask_next` the next level, `null` for the last; `logged_as` the level; `reported_as` `reportsAs(level)`; and the states split by `DEFINITIVE_STATES` into `licenses_a_conclusion` and `licenses_nothing`.
- **R20** `reportsAs(level)` → the member of `SUGGEST_LEVELS` equal to `level` or to `level + "s"`, else `null`; never throws.

**`JUDGEMENT_VERSION`**, `SKILL_PACK_ID`, `DOCTRINE_EDITION`, the authored sentences and their `AUTHORED_SOURCES`, `TABLE_SOURCE`, `SURVEY_SOURCE`, `SEQUENCING_SOURCE`, `FACTS_SOURCE` are exported constants.

## Private

### Uses

- `ai-runs` (through `airun.mjs`): `OBSERVATION_LEVELS`, `OBSERVATION_STATES`, `DEFINITIVE_STATES`, `RUN_BOUNDS`, `RUN_ENDINGS`, `AI_RUN_CHECKS`. The first three move to `observation-log` at its extraction (its map, §1), which adds `observation-log` to this module's `uses` *(not declared in `modules.json` today)*.
- `legacy-checks`: `SUGGEST_LEVELS`, `SUGGEST_CHECKS`, `MACHINE_FENCE_CHECKS`, `EARNED_GRADE_SOURCES`, `VERSION_STRENGTH_INERT_SOURCES`, `BASIS_ROLES`, `VERSION_STRENGTH_CHECKS`, `BASIS_VERSION_CHECKS`, and the whole namespace as `renderPack`'s `catalogue`. As each family moves to its module (K6), this module imports it from there instead; those modules (`basis-versions`, `strength`, `inquiry`) are earlier in layer 6.

### Invariants

- **R21** Every authored sentence is found, through the normaliser, in the document its source names, and that document is canon (`requirements/README.md`). *(not yet met: the four-level rule, the search-completeness rule and the four absence facts cite `CLAUDE.md`, rewritten 2026-09-25; Open for Bob 1)*
- **R22** Pure: no storage, network, clock or randomness; the same inputs render the same pack byte for byte.
- **R23** No member of an imported or driven vocabulary appears in this module's source as a string literal (outside comments); the one published token it names, the `machine` act mode, is the spelling the plane computes it with.
- **R24** It holds no gate: nothing here refuses anything but R12's one code, and no text it renders carries control-flow authority (R16).
- **R25** The C-22.7 row moves here as an invariant with its test (K6), its code, number and translation unchanged.
- **R26** No place is named in its behaviour or rendered text.

### Satisfies

- `docs/development/INVESTIGATIVE-SESSION.md` §2 (the objective; CHECK first), §4 (the fence), §11 (the run records its skill version), §14 (bias minimisation on top of the fence), §14a (the doctrine layer, versioned), §14b.1 (progressive disclosure; reports, not reading), §14b.4 (scripted and judged; the prohibition set), §14b.5 (nothing is boilerplate), §3 (D-220, versions as versions).
- `docs/development/ASSISTANT-PILOT.md` §1 (the layers by drift rate; the refusal surfaced verbatim, never paraphrased; recipes as validated data).
- `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` §3 rules 1, 3, 4, 5, 9 and 10; §4 (the skill pack); §7.3 point 7 and §8 (the extract mode not deployed).
- `docs/architecture/BIO_Content_Framework_v0_10.md` Part II §14.3 (the four-level search and which absence).
- DEC-24, DEC-49, DEC-55, DEC-60, DEC-61, D-82, D-129.

### Suggestions

- **Tests that read later modules.** `skillsequencing.test.mjs` dereferences `agent-worker/src/harness.mjs`, and `skillpack.test.mjs` A10 reads `index.mjs`'s `decorateAct`; both are later in the order (P4). Proposed (BOB's): the MODES-equals-order check moves to `agent-worker`'s tests (its R44), which use this module; A10 moves with `control-plane`'s op table.
- Tests live under `bio-plane/test/m/skills/`: move the four `skill*.test.mjs` suites and their controls there; `machinefences-dec49.test.mjs` imports `machineFences` and stays with `legacy-tests` until the catalogue's fence rows are extracted.
- The `recipes` sentence and `skillpack.mjs`'s header say recipes wait on a surface registry that "no plane op publishes"; the registry now exists in `civicos-ui` (`ASSISTANT-PILOT.md` Status). What R10 needs is that registry published by the plane.

## Open for Bob

1. **In which words does the AI read the four-level rule?** The pack's resident rule ("Absence at one level is not evidence of absence at the next"; "NEVER ASSUME THE LOWER LEVELS ARE COMPLETE.") and its four absence facts are quoted from the old `CLAUDE.md`, which the new process replaced; three tests now fail. The canon states your rule of 2026-08-04 in the Content Framework, Part II §14.3, in slightly different words ("absence at one level is not evidence of absence at the next"; "Nothing derived may only mean nothing was extracted; …"). *Recommendation:* quote the Content Framework's sentences verbatim and cite §14.3, so the pack's doctrine rests on canon; the rule itself does not change.
