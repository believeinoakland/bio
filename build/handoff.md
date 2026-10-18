# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #212 (`session_01SKVQ16CQ7TT5bnRPzzu5Ud`, depth 1, parent ROOT #7, primary account), 2026-10-18 ~14:20 UTC, at ~48% context. **T51 is OPEN** on `tranche/T51`: **L1–L6 closed** (K3836, K3844, K3855, K3859, K3876, K3904); L7 and L10 have no job. **No job is running.** Next: start L8. Read `build/rulings-active.md` whole, then, whole with the Read tool, K3815 and K3890–K3904 (Bob's since K3815: K3902 his meter only; K3903 records his approval in AGENT-RUNNER #13).

## Standing

- **Bob's aim for T51 (K3815):** a system usable without assistance; the release cut, deployed to biosmoke8 and walked live; every defect that walk finds fixed in T51.
- **The plan** `build/plan/current.md` (read whole). Every START is written: L8 (seven), L9 (six), L11 (thirty, with T51-139 wizard-scripts first and installer-steps first among installer's parts) in `build/plan/starts-T51/`. Session numbers are in each START file name's module; take one above the highest `<MODULE> #n` in `git log --all` and `build/rulings.md`.
- **Design:** PR #42's head `5ce2ae0e70` (DEC-329 to DEC-338) is merged into the tranche (K3896, K3900, K3901); `rows.mjs` regenerated. Channel read through U363, posted through B328; nothing open with UX-DESIGN. If the design lane posts a MERGE before L11's START, merge it with no word-reading job running (as K3896) and point the STARTs at the new head.
- **Owed at L11's START (K3835):** move `bio-plane/src/signpage.mjs`, `bio-plane/src/sign-release.html`, `bio-plane/scripts/embed-signpage.mjs` into control-plane's `paths` and `bio-plane/test/m/signatures/signpage.test.mjs`, `signer-keys.test.mjs` (find their paths) into its `tests` in `modules.json` (`order-build --check`).
- **installer-steps (K3893):** two stages in one job: the byte copy merges first; after installer (T51-128) merges, BOB's CHANGE has installer-steps read its sentences by key (its R36). Fill its `modules.json` row from its COMPLETE (K1043); installer's `uses` gains `installer-steps` at T51-128's merge.
- **journey-check (T51-131)** runs its final walk only after BOB's CHANGE says every other L11 job has merged.
- **At the cut (K3877):** after `container-images.yml` builds the cut's images, BOB runs `bundles.mjs --record-image` for the three classes with Docker Hub's public digests and commits the markers on the cut branch (the workflow is not edited).
- **Accepted reds** (each until the named merge): the plan's rule 5 as it stands; K3820's design-merge reds in their L11 STARTs; op-declarations' owner map and plane's op-grades check until T51-107/T51-137 (K3843); affordances' two ACT_HELP tests until T51-99 (K3863); case-authoring R61 until T51-83; coverage on ids marked not yet met.
- **Artifacts:** after a container restart, `npm ci --ignore-scripts` in `agent-runner`, `npm ci` in `sheet-worker` and `file-scanner`. `newgroup-bundle-fresh` passes but never exits until T51-128 fixes it (N1254, in its START, K3905): run it in the background, read its log for "4 passed, 0 failed", and stop it by PID (never `pkill -f` with its name, which kills your own shell).
- **Lanes:** UX design #29 `session_01PCePb8zMxX78iE1gWyzh9A`. AI-DESIGN past A5, JOURNEYS past W4, INVESTIGATION-DESIGN past H43: nothing.
- **Wording to fix when next touched:** `agent-steps.md`'s Status still says "not yet met: T51 (the module does not exist until T51-45…)"; strike that clause (BOB's wording edit).

## What comes next, in order

1. **Take over** (§5.1). Archive BOB #212 once idle (BOB-final row under T51). Delete its backstop (newest "BOB #212 backstop" in `list_triggers`) and WATCH #212 `trig_01RPCYdgRNwg1PqSx1U2HBcA`; create your own WATCH first.
2. **L8** (§5.3): case-carriage, public-read, case-import, case-inputs, case-authoring, review, case-grammar; merge order `modules.json`'s (case-carriage before case-disclosures; review last but one). Close it (§5.6), then **L9** (six), then **L11** (thirty, the owed act above first).
3. **Close T51 (§5.7)**, release, record images (K3877), deploy (Bob's one-line approval in the refused session each time), the `civicos` Worker removal, BOB's live walk, fix rounds (K3815). Then T52 (`draft-T52-sweeps.md`, N1245–N1253).

## Acts on main or sessions (reviewed acts, §5.8)

- `main` moves only by a tranche's close PR (§5.7 (3), K2273) and the design PR merged at the close on its MERGE (K1177); no refusal recorded. `release/T50-unassisted` never moved.
- Deploys to biosmoke8 and the `civicos` Worker's removal: Bob's one-line approval in the refused session each time (rulings-active §2).
- Auto-mode refusals recorded this tranche, never worked around: BOB #210's `git stash drop`; BOB #211's `container-images.yml` record job (K3877); AGENT-RUNNER #13's Docker Hub address (K3885, approved by Bob in that session, K3903).

## Open with Bob

- Nothing open. Told to Bob as done: the installer split (K3893), the installer fold and its security choice (K3892), the design merges (K3896, K3900), the scan by a worker and its re-read (K3897, K3898). His meter: 38% mid-T51 (K3902); ask it again at T51's close.
