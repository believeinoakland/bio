# Handoff

**Status** · Replaced whole at each handoff; holds only where things stand and what comes next. Written by BOB #184 (`session_013UqxFhy79b4WNfRPaGyFUu`, depth 1, parent ROOT #6 `session_01FXbdTJZyPp3Bhcv7pfVSR1`), 2026-10-15 ~19:15 UTC, at ~36% context: T49 closed; release 0.85.0 cut, signed, installer deployed; biosmoke8 waits on Bob's A or B (K3432). Read `build/rulings-active.md` whole first; K3414–K3433 are BOB #184's rulings.

## RELEASE ONLY (K3425, K3426): read this first

Bob's meter is at 89%; the other account is at 97% until Saturday. Bob: "Keep working on getting this working release deployed and tested until this account is at 95%". So only the release proceeds; T50 waits. Stop and hand off where the release stands once Bob reports 95%.

**Where the release stands (K3428–K3432):**
- **Cut:** `dist/cut-0.85.0` @ `1053faa726`, signed (run 38772108995), CONTROLS 7/7. The installer embeds the signed release; newgroup 209/0.
- **Installer:** `newgroup` 0.85.0 is deployed (K3431).
- **NEEDS BOB (K3437):** approve, in BOB #185's session, running `build/plan/wipe-0.85.0.mjs` once (`NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt node build/plan/wipe-0.85.0.mjs`); its `--dry` run is clean.
- **Bob chose B (K3434):** wipe this account's Civicsmith, then Bob reruns the installer. The wipe list and its order are in K3434. Follow the B line below.
- **Then, by his answer:**
  - **A:** follow `build/plan/draft-biosmoke8-install.md` steps 2–5. Leave `ADMIN_TOKEN` out of the secrets file and walk Bob through adding it himself as a secret in the dashboard, so no secret is printed.
  - **B:** delete in this order (each delete is Bob's approval in the session, K1715): civicos, bobux, biosmoke7, the fleet, its containers, then the buckets once emptied. Then Bob runs the installer.
  - **Both:** set `CIVICSMITH_TEST_INSTANCE=biosmoke8` (D10). Deploy the fleet from the cut with `deploy-fleet.mjs … --instance biosmoke8`. Delete `civicos`, `bobux` (K3429) and `biosmoke7` (K3427). Walk Bob through connecting his subscription. Run journey-check R12 live, then your own live walk; only then say "ready".
- **The cut's worktree** was in BOB #184's scratchpad. Re-create it from `origin/dist/cut-0.85.0` in yours (`npm ci` per member).
- **At T50's opening (Saturday, other account):** merge `dist/cut-0.85.0` into `tranche/T50` (K2273).

## Where things stand

- **T49 is closed** (K3423): PR #40 merged, `main` @ `dccb389428` contains `tranche/T49` @ `2dc2d1ad16`. `archive/T49.md` reads CLOSING with its outcome; `main` is not behind it, so T50 may open (§5.2 (1)).
- **The journey, locally:** journey-check's walk, administrator and member, 118 steps, 0 failures (K3420). Not yet shown live.
- **Every T49 session is archived** with its row (K3414, K3419, K3420 and the L11 rows in `metrics/T49.csv`). BOB #184's own row is yours to write (BOB-final, under T49).
- **Reds at the close** (K3421, `build/plan/audit-T49-close.md`): all accepted by name; T50's draft rule 5 carries them (12a added: admission R28 and screens-entry R21 until N1146; affordances R48, R61 until T50-19/N1147).
- **T50's draft** (`build/plan/draft-T50-plan.md`, reviewed by BOB #181; N1130–N1147 folded, K3416, K3417, K3421): 51 jobs. Not yet `next.md`'s plan.
- **Design stream:** merged through `d8a44eb4e3` (DEC-277), now on `main`. Channel: read through U284; our outbox at B238 (a QUESTION on `words-reads.json` dropping computed keys, N1146; no answer yet). UX-DESIGN #19 is `session_01EPwenCi4PznbtLzRxkEMSw` (same account: ring it after each post, K3082).
- **Lanes:** investigation H43, actions H31, site-launch H3, all handled.
- **Timers:** WATCH #184 `trig_01N4CBGL3bNvEjzQL4mhDAd8` (into ROOT, 17:10 UTC). No backstop (no layer runs). Delete the WATCH at takeover; arm your own.
- **Prepared in BOB #184's container only:** `npm ci` in agent-runner (`--ignore-scripts`), sheet-worker, site, `bio-plane/src/journey-check`; repeat in yours.
- **Bob's meter:** not asked at this close yet (§5.7 (5)); ask it in your first report.

## What comes next, in order

1. **Take over** (§5.1); write BOB #184's BOB-final row under T49.
2. **Report T49's close to Bob** (§5.7 (5)): use the outcome in `archive/T49.md` (elapsed ~20.5 h; 38 entries applied; 1.62 B tokens). Ask his meter reading.
3. **Open T50 at once** (§5.2; K3422): adopt `draft-T50-plan.md` (with its "Reviewed by BOB #181" changes) as the plan. Do its opening act (rule 4): setup-words to L1, `translations` new in L11, `layers.md`, the extraction map for instance-setup's split (a worker, reviewed), and the requirements fold ("text to write"). Create `tranche/T50` from `main` @ `dccb389428`. Then start L1.
4. **The release, 0.85.0** (K3422; runbook `draft-T46-trial.md` §4, in the form of K2910–K2912, K3217 and K3235; `draft-release-0.84.0.md` is the last report). Cut `dist/cut-0.85.0` from `main` @ `dccb389428` with a worker, which you then review. Bob approves the signing run in the `release` environment. After signing, run the seven `ssh-keygen` controls and step 8 (commit newgroup's `src/release.mjs` together with its bundle). Then merge the cut into `tranche/T50` at once (K2273). Then:
   - N780's images.
   - biosmoke8 installed (`CIVICSMITH_TEST_INSTANCE` set at the deploy, D10).
   - `agent-worker` and `civicos` re-pointed, then biosmoke7's worker removed (K3262).
   - journey-check R12 live by subscription (Bob enters its sign-in code once).
   - Your own live walk as administrator and member (K3052, K3320), including what is not walkable locally: the fleet, PDFs through pdf-worker, the sign-in through agent-runner, a real model's answer (watch N1143: does the model name the leg's `record_id`? T50-53's START reads this), Wayback and timestamping, live rate limits. Also check whether any member route reaches legacy-ui on biosmoke8 (T50 doubt 2).
   - Only then tell Bob "ready".
5. **The site:** deploy `site` to workers.dev, walk it, and walk Bob through his domain (K3296). This is with the SITE-LAUNCH lane, whose stewards' address delivery test failed.

## Acts on main or sessions (reviewed acts, §5.8)

- T50's close: PR `tranche/T50` → `main`, GitHub merge tool, method merge (§5.7 (3), K2273; done for T49 at K3423). No refusal recorded.
- Design-branch merges go into the open tranche only, never into `main` mid-tranche (K3366 (5), K3417, K3418). No refusal recorded.
- The release cut is merged into `tranche/T50`, never directly into `main` (K2273, K3422).
- Out-of-layer jobs need Bob's approval each time (K1548).
- Deploys, Cloudflare removals and the signing run each need Bob's approval in the session, every time (K1715, K1716). Each `ssh-keygen -Y verify` control likewise (K1905).

## Open with Bob

- The stewards' address: its delivery test failed (SITE-LAUNCH, with Bob).
- Translations (N670's R88).
- The records-request template's reviewer (N858).
