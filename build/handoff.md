# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #211 (`session_01DvBBwC7XQbBDwxu9WUQ8sR`, depth 1, parent ROOT #7, primary account), 2026-10-18 ~09:45 UTC, at ~38% context. **T51 is OPEN** on `tranche/T51`: **L1–L5 closed** (K3836, K3844, K3855, K3859, K3876); **L6 running**: ten of twelve merged (run-rules, hypotheses, agent-harness K3880; ai-use K3881; contradiction K3882; skills K3883; capture-requests K3884; agent-steps K3886; strength K3887; basis-versions K3888); **open**: AGENT-WORKER #32 `session_01RTunPjz5nMUCRagijvxJzE` (on its CHANGE B2: delete and delegate to agent-steps), AGENT-RUNNER #13 `session_01Srpe2rAH6yyk13jeJqT84Y` (NEEDS BOB, K3885). Read `build/rulings-active.md` whole, then, whole with the Read tool, K3815 and K3873–K3888 (none of Bob's since K3815).

## Standing

- **Bob's aim for T51 (K3815):** a system usable without assistance; the release cut, deployed to biosmoke8 and walked live; every defect that walk finds fixed in T51.
- **The plan** `build/plan/current.md`. STARTs written for L1–L9 (`build/plan/starts-T51/`; L7 and L10 have no job). **L11's STARTs are still to write** (copy the form of `starts-T51/basis-versions.txt`; models are in each entry; session numbers one more than the highest `<MODULE> #n` in `git log --all` and `build/rulings.md`).
- **NEEDS BOB (K3885):** auto mode refused AGENT-RUNNER #13's edit naming `docker.io/civicsmith/agent-runner@sha256:954ac088c8e758d7ec18c4a9ef4e78bf3fc2cac327ac9536a4162893010014ec` (Bob's own Docker Hub organization, K3805, K3808). Bob approves it in that session (link `https://claude.ai/code/session_01Srpe2rAH6yyk13jeJqT84Y`); asked in BOB #211's session. Never applied by BOB or worked around (§16). Until it lands: bundler R24/R35 real-fleet and `fleetbundles`' agent-runner arm stay accepted reds (K3832). L6 cannot close without that job's COMPLETE: if Bob is away long, keep asking each turn that waits; do not start L8 (P10).
- **At L6's close, in this order:** (1) when agent-worker completes, add `agent-steps` to its `uses` in `modules.json` (BOB's edit; MODULE_ORDER unchanged, run `order-build.mjs --check`), ownership, merge, strike R119; (2) regenerate artifacts (manifest order; `program.mjs` is stale from strength's `bio-grading/3`, and the agent-worker bundle from the split; the manifest's agent-worker row then names agent-steps, K3850), verify `fleetbundles` (~10 s) and `newgroup-bundle-fresh` (it ran past 30 min in BOB #211's container and was killed: run it in the background with a long timeout, and diagnose if it hangs again); (3) archive the twelve L6 sessions and write rows; (4) **merge the design @ b7b37b3c06** (DEC-335 to DEC-337; U357–U359; PR #42's head) into the tranche with no job running (K3878), keeping its text in any conflict, regenerate `rows.mjs` and wizard-scripts' data, then re-check the L11 folds DEC-336 touches (listed in the plan's BOB's acts, "Before L11's START"); (5) start L8 (STARTs written).
- **Owed acts before L11's START:** move `signpage.mjs`, `sign-release.html`, `scripts/embed-signpage.mjs` to control-plane's `paths` and `signpage.test.mjs`, `signer-keys.test.mjs` to its `tests` (K3835); the DEC-336 re-checks above. Done: credentials R8 worded (K3877).
- **At the cut (K3877):** after `container-images.yml` builds the cut's images, BOB runs `bundles.mjs --record-image` for the three classes with Docker Hub's public digests and commits the markers on the cut branch (the workflow edit was refused by auto mode; not retried).
- **STARTs require explicit tests** for ids already named elsewhere (K874): public-read R38, R39 and review R35 (written into their L8 STARTs).
- **Accepted reds** (each until the named merge): the plan's rule 5; bundler R24/R35 real fleet and `fleetbundles`' agent-runner arm until T51-64 (K3832, K3885); case-checker `program.test.mjs`' three and agent-worker's stale-bundle R45 until L6's close regenerates; op-declarations' owner map and op-grades until T51-107/T51-137 (K3843); affordances' two ACT_HELP tests until T51-99 (K3863); case-authoring R61 until T51-83; coverage on ids marked not yet met (basis-versions R3's standard half is T52's, N1251).
- **T52 entries added this session:** N1251 (inquiry-grammar exports `standardLegFindings`; basis-versions' standard arm), N1252 (stale guard comments in provenance-routes and ai-runs), N1253 (basis-versions' P6 split; DEC-337's keys).
- **Artifacts:** after a container restart `npm ci --ignore-scripts` in `agent-runner`, `npm ci` in `sheet-worker` and `file-scanner`. The verify greps match `ℹ pass`/`ℹ fail`.
- **Lanes:** UX design #29 `session_01PCePb8zMxX78iE1gWyzh9A`; channel read through U359, posted through B322. AI-DESIGN past A5, JOURNEYS past W4, INVESTIGATION-DESIGN past H43: nothing.

## What comes next, in order

1. **Take over** (§5.1). Archive BOB #211 once idle (BOB-final row under T51). Delete its backstop (newest "BOB #211 backstop" in `list_triggers`) and WATCH #211 `trig_01Q4vtPLZnKWNeBZNARcSVSG` (create your own WATCH first).
2. **L6:** agent-worker's COMPLETE and merge; agent-runner after Bob's approval; close L6 as above.
3. **L8, L9** (STARTs written), then **L11**: write STARTs, its owed acts, start, merge, close.
4. **Close T51 (§5.7)**, release, record images (K3877), deploy (Bob's one-line approval in session each time), the `civicos` Worker removal, BOB's live walk, fix rounds (K3815). Then T52 (`draft-T52-sweeps.md`, N1245–N1253).

## Acts on main or sessions (reviewed acts, §5.8)

- `main` moves only by a tranche's close PR (§5.7 (3), K2273) and the design PR merged at the close on its MERGE (K1177); no refusal recorded. `release/T50-unassisted` never moved.
- Deploys to biosmoke8 and the `civicos` Worker's removal: Bob's one-line approval in the refused session each time (rulings-active §2).
- Auto-mode refusals recorded this tranche, never worked around (K3833): BOB #210's `git stash drop`; BOB #211's `container-images.yml` record job (K3877); AGENT-RUNNER #13's Docker Hub address (K3885, open with Bob).

## Open with Bob

- **Approve in AGENT-RUNNER #13** the edit pointing agent-runner's image at `docker.io/civicsmith/agent-runner` (K3885).
- Told to Bob as done: R51 decided as option (a) (K3873), its standard half to T52 (K3879); CONTRADICTION #10 read one file by search (K3882, K3586).
- His meter at T51's close.
