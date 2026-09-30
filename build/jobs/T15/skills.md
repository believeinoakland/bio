# skills (T15)

**Status** · session_018xQkkj4FkEcwbqR1dfGgvx · depth 2 · WORKING · handled B3

## Progress

- 02:35 · N345 applied on K487's reading (B2): `skillpack.mjs` imports `RECOMMEND_PROMPT`, `RECOMMEND_PROMPT_SHA256` from `./contradiction.mjs` and `sha256HexSync` from the catalogue; `disclosed.contradiction` after `refusals` (R5, R27); R1's two new throws; tests: pack.test R1 (child-mocked contradiction entry: null, blank, edited prompt, wrong digest, and the control), R5's key list, R27 (the layer whole, digest recomputed, disclosed not resident, version moves, R24's scan over the prompt); doctrine.test R23 (the prompt's first line typed nowhere in the source) and R24 (the rendered prompt scanned). Committed 06f4ce284f.
- Verified against a temporary local stub of contradiction's two exports (reverted, never committed): `test/m/skills/` 33/0; legacy `bio-plane/test/skillpack.test.mjs` 1/0.
- **Next step:** on BOB's word that contradiction has merged, merge `tranche/T15`, run `test/m/skills/` against the real export (R24's scan over the real prompt: report a trip, K487), then steps 6–7; post REPORT (agent-worker's bundle stale) and COMPLETE.

## J1 · QUESTION

Q1. `build/requirements/skills.md` carries no requirement for N345's entry: nothing names `RECOMMEND_PROMPT`, and R5 lists the disclosed layers exactly, so packaging it changes R5's wording and needs an id to test (P7). My best reading, which I am building against now (import held until you say contradiction has merged):

1. **A new disclosed layer `contradiction`**, placed after `refusals` and before `recipes` (recipes stays last): `sourcing` `imported`, `load_when` "the run judges or recommends on a contradiction candidate's two sides", `body` `{recommend_prompt, recommend_prompt_sha256}`, being contradiction's `RECOMMEND_PROMPT` byte for byte (the same string, never a copy) and its `RECOMMEND_PROMPT_SHA256`. R5 reworded to list it; R4 lists it through `disclosable` as today.
2. **New R27** (the layer, as in 1): the prompt is contradiction's export unchanged, and the pack's version (R11) moves when it moves.
3. **R1 extended:** `renderPack` throws, naming the source, and renders nothing when `RECOMMEND_PROMPT` is not a non-empty string or `sha256(RECOMMEND_PROMPT)` differs from `RECOMMEND_PROMPT_SHA256` (via legacy-checks' `sha256HexSync`), so a pack built over an unmeasured prompt fails the build, as R10 does for recipes. It is a throw at render, not a refusal code, so R24 stands.
4. **R24's second half** ("no text it renders carries control-flow authority") would now reach contradiction's measured prompt. My reading: it applies to it, and my test runs `controlFlowAuthority` over it; if contradiction's prompt trips the scan (an output instruction such as "one object per pair" does not; "repeat"/"until" would), I report it rather than narrow R24. Tell me if you would rather scope R24 to the pack's authored text.
5. **Not packaged: `JUDGEMENT_PROMPT`.** contradiction's Suggestion says the recommender's prompt is packaged "as the judgement's prompt is", but the pack holds no judgement prompt today (agent-worker renders it from `contradiction.mjs` directly, if at all). My reading: only `RECOMMEND_PROMPT`, as the entry says. If you want `JUDGEMENT_PROMPT` beside it in the same layer (with `JUDGEMENT_PROMPT_SHA256` and R1's same check), it is two lines and one test; say so.

Where `RECOMMEND_PROMPT` will be exported from: I will import it from contradiction's public entry once merged (`bio-plane/src/contradiction.mjs`, where `JUDGEMENT_PROMPT` is today, unless CONTRADICTION puts it in `contradiction/index.mjs`); `uses` already carries the edge (K481).
