# agent-worker (T49)

**Status** · session_01G85qgibprP8ncwoNcKSciB · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

Doubt 11 (M-T49 note 2): agent-worker has NO configurable model address. The address is the constant `MODEL_ENDPOINT` in `agent-model/src/apikey.mjs`:13, used only by the API-key turn (`apikey.mjs`:56); agent-worker reads nothing of it from `env` (grepped: no `env.*MODEL*`). With API keys withdrawn (K3347), a subscription run reaches Claude through the `RUNNER` binding (a Durable Object namespace), not an HTTP address, so a fake model "over HTTP at agent-worker's model address" cannot be served by journey-check today.

Best reading and proposal (BOB's to place, since the address belongs to `agent-model`, not to me): either (a) journey-check serves a stub `RUNNER` binding, which agent-worker already accepts through `env.RUNNER` (no change needed, R35/R66), or (b) if an HTTP address is wanted, one line in `agent-model`: "the Messages API address is `env.MODEL_ENDPOINT` when it is an https URL, else the published one", and one in agent-worker: "it passes `env.MODEL_ENDPOINT` to every `agent-model` call". I build nothing for (b) unless you add it to this job. Carrying on with R89.

## Completion record (T49-9)

**Entries applied.**
- **R89** (amends R54): in `/ask`'s composing conversation the `answer` tool's `input_schema` now has `properties` = `answers.ANSWER_FIELDS` in order and `required` = all of them; `label`'s enum reads `answers.ANSWER_LABEL`. Both are imported from `bio-plane/src/answers/check.mjs` (`agent-worker/src/ask.mjs`), not from `answers/index.mjs`. `askTools(layers, contract)` takes the contract as a defaulted argument, so a test can pass a double. Type hints (string, array, enum) only describe a field; they add and drop none.
- **N1073** (the four hand-lists `harness:128`, `plan:293`, `requirements:1369`, `t36:94`): new fixture `agent-worker/test/owners.mjs` reads `ai-runs`' `aiRunsOps` and `capture-requests`' `captureRequestsOps` declarations; `ownedBy` throws for a name its owner no longer declares. The four suites now build their pinned op sets from it. Only the ops this member calls are still named, because that set is this member's own. **`action-plans` is not read:** it is layer 9, after this member, and the architecture check refuses the import (found on the first run of `checks/run.mjs`). Its three ops (`plan`, `plans`, `optionpropose`) stay named in the pin; `plan.test.mjs` is unchanged. N1073's read of `action-plans` belongs to a later module's job, or to a service index (N1074).
- **M-T49-7 / R88:** dropped with R88 (K3347); nothing built for an API-key run.

**Doubts and BOB's notes.**
- Doubt 11: agent-worker has no configurable model address (the address is `agent-model`'s constant). A QUESTION was posted (J1) with two options. I built nothing for it.
- Note 3, the bundle: importing `ANSWER_FIELDS` from `answers/check.mjs` adds only 7 pure files to the bundle (`answers/check.mjs`, `checks.mjs`, `readlog.mjs`, `sentences.mjs`, `calc-grammar/decimal.mjs`, `calc-grammar/figures.mjs`, `record-grammar/json.mjs`). No store code is pulled in. Importing from `answers/index.mjs` would have pulled in record-core, membership and the store, so I did not. The bundle went from 311,581 to 318,459 bytes, regenerated with `npm run build` in `agent-worker/`.

**Deferred.** Nothing.

**Found in another module.**
- `build/requirements/agent-worker.md` line 123 words R88 as `**R88** retired (T49; …` instead of `*(retired: …)*`, so `checks/coverage.mjs` counts R88 as live and reports it unnamed ("1 of 81 live ids named by no test: R88"). BOB's file: word it as the other retired ids are (`*(retired…`), or name R88 in a test. I did not touch the requirements file.
- Observation (not a defect of this entry): the `answer` tool's `sentences`, `holdings`, `rules` and `looks` are typed only as arrays. Their item shapes are not in the schema, so a model can still form an item `checkAnswer` withholds. `answers` could export the item shapes if wanted.

**How the reading set was read.** I read the requirements whole, and all of `agent-worker/src` whole (`ask`, `index`, `draft`, `action-drafts`, `signin`, `transcribe`, `cascade`, `reads`, `untested`; `ops` to its end). I read `answers/check.mjs` and `answers/index.mjs` for the export and import graph. The other `uses` were not read; the import graph showed nothing else was needed. I read no helpers' digests. The tests that name R89 are my own new `t49.test.mjs`; the existing tests were run, not read, except for the four hand-list sites above.

**Tests and checks.**
- `agent-worker/test/t49.test.mjs`: 37 pass, 0 fail. It names R89 in each title. Controls: all 15 contract fields, each in turn missing from a model answer, are refused by the plane's own `checkAnswer` as `ANSWER_MALFORMED` naming the field, with no `answer` event reaching the member. A test double with an added field appears in both `required` and `properties`.
- `npm test` in `agent-worker/`: ask 64, fanout 185, plan 55, requirements 303, t35 206, t36 20, t37 165, t41 51, t42 112, t45 207, t46 71, t47 114, t48 80, t49 37 and wire-vocabulary 83, all with 0 fail. `harness.test.mjs`: 256 pass, 5 fail: REC100-0, -1b, -2, -2b and -2c. They fail identically on the base commit (checked by stashing my change), and the plan's rule 5 (7) (A) leaves them until T49-29. REC100-0 and -2c are not named in your START; they fail the same way, from the same cause, so I treat them as the same inherited group.
- Process checks from `civicos-process` over the product: `format` 0 failures; `architecture` 0 failures for the whole product (`checks/run.mjs`); `ownership` 0 failures; `coverage` 80 of 81 live ids named, the one unnamed being R88 (above).
- Not run: the regression, the other modules' tests (no service this module provides changed), `bio-plane/test/system/fleetbundles.test.mjs` (I regenerated the bundle; BOB verifies at the layer close, mechanics §14).

Size (session_01G85qgibprP8ncwoNcKSciB): test runs 9, module lines 3637

## J2 · COMPLETE

agent-worker T49-9 complete on `job/T49/agent-worker` (see "Completion record" in my record).
- R89 met: `/ask`'s `answer` tool reads `ANSWER_FIELDS` and `ANSWER_LABEL` from `answers/check.mjs` (7 pure files added to the bundle; no store code). 37 new tests pass, 15 controls included. Bundle regenerated.
- N1073: `ai-runs` and `capture-requests` ops now read from their owners; `action-plans` cannot be read from layer 6 (later layer, architecture check), so its 3 ops stay named.
- Doubt 11: see J1 (no configurable model address in agent-worker; the address is agent-model's constant).
- Inherited reds only: `harness.test.mjs` REC100-0/-1b/-2/-2b/-2c fail the same on the base commit.
- For you: `build/requirements/agent-worker.md` words R88 as `**R88** retired (…` not `*(retired…`, so `checks/coverage.mjs` counts it live and unnamed. That is the only coverage failure for this module.
- Merge `tranche/T49` once `ai-runs` is merged, and I will re-run my tests.

**After B3 (ai-runs merged).** Merged `tranche/T49` into my branch (clean); bundle rebuilt, byte-identical. All agent-worker suites re-run: the only failures are REC100-0/1b/2/2b/2c (accepted until T49-29). `checks/run.mjs`: format, architecture and ownership show 0 failures for my files; coverage for agent-worker is clean now that R88 is marked in the checks' form. J1 answered by B2 (option (a)); nothing built.
