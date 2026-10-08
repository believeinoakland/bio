# BOB to agent-worker (T37)

**Read** · handled J1

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T37), layer 6, agent-worker: T37-17 (N708, its share: the relay of the member's own sign-in to their own runner instance). Read also the plan's "Rules at the opening" (rule 3), DEC-156 in `docs/development/DECISIONS.md`, and K1819, K1994, K2134, K2147, K2200 (their lines in `build/rulings.md`); cite `build/terms/anthropic.md` by id for any statement about Anthropic's terms.
Your requirements: `build/requirements/agent-worker.md` (read whole); text changed at this START, each not yet met: T37: R66 (`POST /signin`: `{member, step, code?}` from the plane's door, steps `start`, `code`, `state`, `signout` relayed to the `RUNNER` instance named by `member`, the runner's answer unchanged) and R67 (the code from Anthropic's page in one runner request's body only) new; R35 and R36 amended; R6 unchanged (the conversation on the member's own sign-in is a later entry, K2200). `modules.json`: agent-worker uses agent-runner, added at this START (K2200, rule 5); read `agent-runner`'s Purpose and public R17–R21, which your relay calls. Depends T37-16 (agent-runner, merged before you in L6): merge the tranche branch after it when BOB says so. Your first caller is control-plane's route (T37-33, L11); until then your tests drive `/signin` with a stub `RUNNER`. Also (N669, K2201) R59 amended and R68–R70 new: `POST /draft`'s translation task (`to_language`, 1–100 words, each with key, English, note, meaning and protected mark; `to_english`, exactly one kept word, administrators only), no grant, no tool, only skills' `interface_translation` layer (T37-14, merged before you), run-rules R22's translation reach (T37-49, merged first in L6), answered labelled machine work, nothing stored.
Never stop your test run midway: its negative controls mutate your source in the working tree and restore it only when the run ends (K1994). If a run is stopped, restore `agent-worker/` from HEAD before anything else, and never commit a mutation.
Reading set (mechanics §17, N739): measured at this START by `build/plan/reading-sets.py`: 1,220 KB (own requirements 40 KB, the used modules' public parts 302 KB, code 163 KB; the script also counts your tests, 716 KB, since they lie under your paths), an over-estimate (it counts each used module's whole public part and every file under your paths): read as mechanics §3 asks (each used module's Purpose and the services your Uses names). Measure that set first. At most 300 KB: read it whole and state so in your record. Over: (1) trim nothing; (2) no split in T37; (3) read whole yourself your requirements, layer 6's row of `build/layers.md`, the code and tests your entry changes (`src/index.mjs`'s routing and the new route's file, beside `ask.mjs` and `draft.mjs`) and the used services your Uses names (agent-runner R17–R21), and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task, the requirements it serves and what follows; state in your record what you read whole, the summary's size and what it cites, and whether anything it left out mattered.
Generated artifact: your committed bundle `agent-worker/dist/agent-worker.bundled.mjs` and `.bundle.json` (`build/manifest.md`); your change stales it and R45's test reads it. Rebuild only with its own command (`npm run build` in `agent-worker/`, as AGENT-WORKER #12 did, K2135), never by hand, and report it; BOB regenerates every bundle at the layer's close.

Merge order in L6 (`modules.json` order): capture-requests → skills → answers → agent-runner → agent-worker.
Inherited reds: the plan's rule 6 list as it stands at your START (read it there, item 17 with `plan/t37-red-census.md`); none is yours (red 6 is agent-runner's, cleared by T37-16).
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.

## B2 · ANSWER · re J1

All three readings stand (K2211): (1) exactly one tool, the final draft tool, nothing else; (2) SURFACE gains signin; (3) no guard; your own RUNNER_SILENT detail never carries the code.

## B3 · CHANGE

From RUN-RULES #9 (K2213): run-rules exports TRANSLATION_DRAFT_MAX_WORDS (100) beside DRAFT_KINDS and draftMayRead. Once run-rules is merged into tranche/T37 (BOB says so), merge the tranche and have R70 read that figure, holding no 100 of its own.

## B4 · CHANGE

run-rules, capture-requests and answers are merged into tranche/T37 @ 6490d909c1 (K2214): merge the tranche into your branch before you finish.

## B5 · CHANGE

From AGENT-RUNNER #4 (K2217): four of your test files fail on a clean tranche/T37 (agent-worker, harness, requirements, versions tests: the real plane's refusals since T36-36 (a credential in the address, the retired shared token) and R45's bundle). The red census read test/m only, so they were never named: they are yours, fixed in this job (as capture's and reading-pipeline's suites were: enrolled member sessions in the Authorization header; your bundle rebuilt by npm run build). State each in your record.
