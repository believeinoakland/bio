# agent-worker (T49)

**Status** · session_01QQKrdbySyBGRG7N21Hwafa · depth 2 · WORKING · handled B3

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

## J3 · COMPLETE

agent-worker T49-9 complete again after B3: tranche/T49 merged, tests re-run (only REC100-0/1b/2/2b/2c red, accepted), checks clean for my files. Pushed.

## T49-37 completion record (B4, R90)

**Entry applied.** R90 (amends R21, R22). `collect`'s holdings now carry, beside each held document's `address_norm`, `record_id` (the bundle id of the version the run read: the newest version a citation named, else the newest the plane listed) and `capture_sha` (for a leg's `extent_capture`); an item in no chain cited as a held bundle carries it as `record_id`, one cited as a bare address `null`. A document whose read is refused stays UNDETERMINED with no id (R21). Built in agent-worker alone: new `agent-worker/src/holdings.mjs` (`withRecordIds`, pure, reads the same `resolved` chains `documentHoldings` read), applied in `collect` (`src/index.mjs`). No change to agent-harness or agent-model: `rowFacts` already hands `holdings` to compose whole, shown by test B3 reading the facts off the model request. No QUESTION was needed.

**How the set was read.** Requirements whole; `index.mjs` `collect`/`compose` whole; `agent-harness` `documentHoldings`/`holdingsNote`, `agent-model` `rowFacts`, `provenance.versionChain`, `inquiry`/`run-productions` R1, R9 for the shapes; `versions.test.mjs` and `inprocess.mjs` partly. Other tests run, not read. No helpers.

**Tests.** New `agent-worker/test/t49r90.test.mjs`: 14 pass, 0 fail (pure arms, through `/run`, compose facts, and the R21 refused-read control). Control checked: reverting the wiring fails B2, B3. `npm test` in `agent-worker/`: 19 of 20 files pass; the one failure is `requirements.test.mjs` R45 (bundle byte-identity), because the bundle is stale (below). Also run, all 0 fail: `plane/t42`, `run-rules/deployment`, `control-plane/members-pin`, `control-plane/r53-routes`; journey-check `live` 10, `runner` 6, `walker` 14 pass (after `npm ci` in `bio-plane/src/journey-check`). `journey.test.mjs`: 8 of 11; step 12 and R10 fail.

**Journey step 12.** It is no longer refused NO_BASIS: the walk's fake model now finds the held document's id in compose's facts. It now stops at "the screen does not draw the word `question.concluded.by` on /app/question/…", a screen or words matter in another module (screens-inquiry / the design stream's `words.json`), not agent-worker's; R10 follows. BOB to route.

**Stale artifact.** `agent-worker/dist/agent-worker.bundled.mjs` and `.bundle.json` are stale (new input `src/holdings.mjs`, changed `index.mjs`): `fleetbundles.test.mjs` fails for agent-worker only. Not regenerated (K3407); BOB regenerates at L11's close.

**Checks** (`civicos-process`): `format` 0 failures; `architecture` 0; `coverage` 81 of 81 live ids named (R90 included); `ownership` 0; `checks/run.mjs` over the product: format, architecture, coverage, channels 0 failures.

**Deferred.** Nothing. **Other modules.** The `question.concluded.by` word above. The model must be told to use `record_id`; the pack's wording is `skills`', not changed here.

Size (session_01QQKrdbySyBGRG7N21Hwafa): test runs 9, module lines 3711
