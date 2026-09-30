# skills (T15)

**Status** · session_018xQkkj4FkEcwbqR1dfGgvx · depth 2 · COMPLETE · handled B4

## Progress

- 02:35 · N345 applied on K487's reading (B2): `skillpack.mjs` imports `RECOMMEND_PROMPT`, `RECOMMEND_PROMPT_SHA256` from `./contradiction.mjs` and `sha256HexSync` from the catalogue; `disclosed.contradiction` after `refusals` (R5, R27); R1's two new throws; tests: pack.test R1 (child-mocked contradiction entry: null, blank, edited prompt, wrong digest, and the control), R5's key list, R27 (the layer whole, digest recomputed, disclosed not resident, version moves, R24's scan over the prompt); doctrine.test R23 (the prompt's first line typed nowhere in the source) and R24 (the rendered prompt scanned). Committed 06f4ce284f.
- Verified against a temporary local stub of contradiction's two exports (reverted, never committed): `test/m/skills/` 33/0; legacy `bio-plane/test/skillpack.test.mjs` 1/0.
- **Next step:** on BOB's word that contradiction has merged, merge `tranche/T15`, run `test/m/skills/` against the real export (R24's scan over the real prompt: report a trip, K487), then steps 6–7; post REPORT (agent-worker's bundle stale) and COMPLETE.

## Completion

**Entries applied.** N345 (plan layer 6): contradiction's `RECOMMEND_PROMPT` packaged into the skill pack as the disclosed `contradiction` layer after `refusals` (R5, R27; K487), imported from `bio-plane/src/contradiction.mjs` with `RECOMMEND_PROMPT_SHA256`, digest checked with the catalogue's `sha256HexSync` (R1). Per J2's reading (contradiction merged with the digest `null`, R41 unmeasured, K488): while the digest is null the layer is a stated absence (`absent`, "never, in this edition", body `{}`, `absent_because`), as recipes' is (R9), so the pack still renders for every run; once the digest is set, the prompt and digest are carried `imported` under K487's `load_when`, and R1 throws on a prompt the digest does not measure. R1 always throws on an absent or blank prompt. If BOB rules R1 strict instead (J2), the revert is two lines.

**`not yet met` marks my work meets** (K460): R5's `contradiction` layer (the layer is rendered in both forms). R27: met in its absent form today and in its measured form through a child that mocks a measured digest; its imported form is reachable in the product only when contradiction's R41 is measured, so R27's mark may stay until then — BOB's to judge.

**Deferred.** None of skills'. Contradiction's R41 (the measurement) is the one thing that turns the layer on.

**Reported (REPORT J3).** agent-worker's bundle stale (its requirements.test R45: `skillpack.mjs` changed); BOB rebuilds. No check row added, moved or retired (nothing for promotion to stamp). `civicos-ui/` and affordances' lists: no hit for anything added.

**Tests and checks.**
- `node --test bio-plane/test/m/skills/`: 33 pass, 0 fail (was 31/0 before N345).
- legacy `bio-plane/test/skillpack.test.mjs`: 1 pass, 0 fail.
- agent-worker suites against the tranche without and with this change (FAIL counts): agent-worker 5/5, cascade 0/0, fanout 3/3, harness 4/4, versions 2/2, wire-vocabulary 0/0, requirements 0/2 — the two new are R45's stale-bundle arms (reported); the others are red on the tranche already and not skills'.
- `checks/format.mjs`: 0 failures; `architecture.mjs bio skills`: 0 failures; `coverage.mjs bio skills`: 27 of 27 live ids named, 0 failures; `ownership.mjs bio skills tranche/T15`: 4 files, legacy-checks 0 added, 0 failures.

Size (session_018xQkkj4FkEcwbqR1dfGgvx): test runs 9, module lines 1531

## J1 · QUESTION

Q1. `build/requirements/skills.md` carries no requirement for N345's entry: nothing names `RECOMMEND_PROMPT`, and R5 lists the disclosed layers exactly, so packaging it changes R5's wording and needs an id to test (P7). My best reading, which I am building against now (import held until you say contradiction has merged):

1. **A new disclosed layer `contradiction`**, placed after `refusals` and before `recipes` (recipes stays last): `sourcing` `imported`, `load_when` "the run judges or recommends on a contradiction candidate's two sides", `body` `{recommend_prompt, recommend_prompt_sha256}`, being contradiction's `RECOMMEND_PROMPT` byte for byte (the same string, never a copy) and its `RECOMMEND_PROMPT_SHA256`. R5 reworded to list it; R4 lists it through `disclosable` as today.
2. **New R27** (the layer, as in 1): the prompt is contradiction's export unchanged, and the pack's version (R11) moves when it moves.
3. **R1 extended:** `renderPack` throws, naming the source, and renders nothing when `RECOMMEND_PROMPT` is not a non-empty string or `sha256(RECOMMEND_PROMPT)` differs from `RECOMMEND_PROMPT_SHA256` (via legacy-checks' `sha256HexSync`), so a pack built over an unmeasured prompt fails the build, as R10 does for recipes. It is a throw at render, not a refusal code, so R24 stands.
4. **R24's second half** ("no text it renders carries control-flow authority") would now reach contradiction's measured prompt. My reading: it applies to it, and my test runs `controlFlowAuthority` over it; if contradiction's prompt trips the scan (an output instruction such as "one object per pair" does not; "repeat"/"until" would), I report it rather than narrow R24. Tell me if you would rather scope R24 to the pack's authored text.
5. **Not packaged: `JUDGEMENT_PROMPT`.** contradiction's Suggestion says the recommender's prompt is packaged "as the judgement's prompt is", but the pack holds no judgement prompt today (agent-worker renders it from `contradiction.mjs` directly, if at all). My reading: only `RECOMMEND_PROMPT`, as the entry says. If you want `JUDGEMENT_PROMPT` beside it in the same layer (with `JUDGEMENT_PROMPT_SHA256` and R1's same check), it is two lines and one test; say so.

Where `RECOMMEND_PROMPT` will be exported from: I will import it from contradiction's public entry once merged (`bio-plane/src/contradiction.mjs`, where `JUDGEMENT_PROMPT` is today, unless CONTRADICTION puts it in `contradiction/index.mjs`); `uses` already carries the edge (K481).

## J2 · QUESTION

Q2 (replaces nothing; B3 applied). Contradiction merged with `RECOMMEND_PROMPT_SHA256 = null` (its R41 unmeasured, K488). Under R1 as K487 worded it ("throws when its sha256 differs from `RECOMMEND_PROMPT_SHA256`"), **every** `renderPack` now throws: `test/m/skills/` goes 15/18, and agent-worker, which renders the pack at each run (`agent-worker/src/index.mjs`:385), could render no pack for any run until the recommender is measured. That is an outage of every AI run for want of one layer, not an empty layer refused.

My best reading, which I am building now (it is the recipes layer's own pattern, R9/R10):
1. **Unmeasured (digest `null`):** the `contradiction` layer renders as a stated absence: `sourcing` `absent`, `load_when` "never, in this edition", `body` `{}` (the prompt is not carried), and a non-empty `absent_because` saying contradiction's recommender prompt has passed no measurement (its R41). The pack renders; R4 lists it as today.
2. **Measured (digest a string):** R27 as worded: `imported`, K487's `load_when`, the prompt and digest carried; R1 throws when sha256(prompt) differs from it (an edited prompt, or a wrong digest), so a pack is never built over a prompt the digest does not measure.
3. **R1 always:** throws when `RECOMMEND_PROMPT` is not a non-empty string.
4. R27's carried-prompt arm is tested now through a child that mocks a measured digest (sha256 of the real prompt) and one that mocks an edited prompt; R24's scan over the real prompt passes ([] today).

Wording this needs (yours): R1's digest clause gains "when `RECOMMEND_PROMPT_SHA256` is not null"; R27 gains R9's absent form while it is null. If instead you want R1 strict (no pack until R41 is measured), say so and I revert to it; it is two lines.

## J3 · REPORT

agent-worker's bundle is stale: skills' `bio-plane/src/skillpack.mjs` changed (N345), and `agent-worker/test/requirements.test.mjs` R45's two bundle arms go red on it (static check and byte identity). Yours to rebuild at the close (mechanics §14); I rebuilt nothing.

## J4 · COMPLETE

N345 applied (K487, B3), on J2's reading while it stands: the `contradiction` layer after `refusals`, a stated absence while contradiction's `RECOMMEND_PROMPT_SHA256` is null, the prompt and digest carried `imported` once it is set; R1 throws on an absent or blank prompt, or one its non-null digest does not measure. test/m/skills 33/0; legacy skillpack.test 1/0; agent-worker unchanged but R45's stale-bundle arms (J3); format, architecture, coverage (27/27), ownership: 0 failures. Marks: R5's layer met; R27 met in both forms at the interface, its imported form live only once contradiction's R41 is measured. Record: completion section. If J2 is answered otherwise, a CHANGE reopens me (a two-line revert).
