# action-replies (T46)

**Status** · session_01LcXMRtUf4XFLrQnWKinY3e · depth 2 · WORKING · handled B1

## Completion

**Read, whole:** `build/requirements/action-replies.md`; the public parts of `actions`, `action-clocks`, `action-grammar`, `case-authoring` (with its R70–R73), `membership`, `record-core`, `record-grammar`; layer 9's contract in `build/layers.md`; the plan's rules and entry T46-35; this module's own code (`index.mjs`, `checks.mjs`, `schema.mjs`) and tests (all five files), whole (P20, rule 2).

**Entries applied (T46-35):**
- **R5** (N912): `bearingProposalLabel` is now `record-grammar`'s `proposalLabel(who, "bearing")`; this module's own `PROPOSAL_SAYS` sentences over `lawProposalState` are deleted. The act's answer and `bearingsOf`'s proposals carry that label whole.
- **R6** (N932): the code already refused in R6's order (`AROSE_FROM_REFUSED` before `NO_SUCH_PROJECT`, a `{project}` judged by the author's sight through `membership.noSuchProject`; `arisenFrom`'s three refusals); no code change, tests added naming R6 (order with every later fault present, author's sight vs viewer's, a project seen only at `EXISTENCE`, `arisenFrom`'s three refusals with controls).
- **R7** (N913, DEC-194): C-150.1–C-150.6 take their translations from `words.json`'s `refusal.<CODE>`, read by key through `ACTION_REPLY_WORDS` in `checks.mjs` (membership's `HANDLE_WORDS` pattern); codes, numbers and `where`s unmoved; `BEARING_REFUSED` re-worded here, its one minting site; C-150.7 `AROSE_FROM_REFUSED` keeps its own. (The plan line says "5 rows"; R7 names six and six are applied.)
- **R8** (K2964): each open-request row answers `replied` (a boolean: true when any `received` entry is recorded), beside `answers`; `case-authoring` R70's row check accepts every row.

**Own code reviewed (P8):** no flaw needing a change found beyond the entries. One noted, not changed: C-150.7's `where` names `#arising > is-arising-shape`, while the DEC-49 region sits in `aroseFromLink` (and `arisenFrom` raises the code outside any region); moving a `where` is a row change R7 does not ask for, so it is left for a later job (deferred: outside this entry, a row census change).

**Observation for BOB (not another module's flaw):** `words.json`'s `refusal.BEARING_REFUSED` does not state `action-grammar` R24's 1-to-50 count bound, so an empty layout (or 51 claims) is refused with a sentence that does not name why; the refusal's `detail` and `findings` still name it. Applied as R7 requires; reported.

**Other modules / artifacts:** the plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`) is staled by this change (rule 5 (4), regenerated at the layer's close). `test/system/row-census.test.mjs` now also lists C-150.1–C-150.6 as changed (rule 5 (2), until T47's stamp). No other module changed.

**Tests and checks:**
- `node --test bio-plane/test/m/action-replies/`: tests 23, pass 23, fail 0 (new `t46.test.mjs`: R5, R6 ×3, R7 ×2; `open.test.mjs`: R8, R3's rows with `replied`).
- Users of the services changed: `plan-work` pass 40 fail 0; `case-authoring` pass 210 fail 0; `answer-envelope` pass 32 fail 0; `instance-setup/places`, `queue-producers/arrivals`, `action-grammar/t45` all pass.
- `format`: 159 modules, 158 requirements files; 0 failures. `architecture action-replies`: 9 product files, 25 relative imports; 0 failures. `coverage action-replies`: 8 of 8 live ids named by a test; 0 failures. `ownership action-replies tranche/T46`: 5 files changed; 0 failures. `run.mjs` over the product: architecture 2957 files, 0 failures; coverage's 29 failures are other modules' (rule 5 (1)), none this module's.

Size (session_01LcXMRtUf4XFLrQnWKinY3e): test runs 9, module lines 586
