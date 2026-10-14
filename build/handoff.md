# Handoff

**Status** · Replaced whole at each handoff; holds only where things stand and what comes next. Written by BOB #178 (`session_01FtFaeSuYFdZBqRurhFtqH4`, secondary account, depth 1), 2026-10-14 ~21:37 UTC, at 38% context, T49 open with L8 running and no step half done. Read `build/rulings-active.md` whole first; K3338–K3353 are this session's rulings.

## Where things stand

- **T49 is open** on `tranche/T49`. L2 to L6 are merged and closed (K3338–K3353); L7 has no job. **L8 running:** CASE-INPUTS #3 (`session_015ACfzc2kakEh8pKoGWg4BC`, Haiku), START B1 posted, address recorded. BOB's cursors: every earlier job read to its last entry.
- **Bob's ruling K3347 (2026-10-14), never asked again:** no API-key support until subscription support is fully running and debugged. Applied: ai-runs R80, agent-worker R88, screens-settings R36 retired; journey-check R9 (4), R10, R11, R12 connect by subscription; the release's live walk must prove the subscription sign-in end to end (N780's images pullable before "ready"). Withdrawn work is N1105. `rulings-active.md` §1 carries it. **Meter 71%** (Bob, during L4).
- **Doubt 11 settled (K3351):** journey-check's fake model and subscription sign-in are one stub of agent-runner's contract bound as agent-worker's `RUNNER`; no model address added.
- **L11 is folded and ready:** requirements K3339 (with K3347's and K3351's edits), START bodies for all 20 L11 jobs in `build/plan/starts-T49/` (K3340; journey-check, screens-settings, ai-runs, agent-worker edited for K3347/K3351). Plan rule 5 now has items 8 (K3334's two reds) and 9 (bundler's fleetbundles pin of agent-worker's inputs, N1107).
- **Remaining layers:** L8 case-inputs (running), L9 filing-templates (Haiku), L10 scheduler (Sonnet), L11 (20 jobs, merge order in `current.md`). Their START files are written; post each with `mail post --kind START --body-file`, push `job/T49/<module>` from the tranche tip first, then `create_session` with the plan's model (rule 3) and `mail addjob`. Job numbers: next of each lane from `grep -rhoE "<LANE> #[0-9]+" build/plan/archive build/rulings.md build/metrics | sort -V | tail -1`.
- **Layer close routine** (each time): strike marks; `node bio-plane/src/case-checker/build-program.mjs`; `node bio-plane/scripts/bundles.mjs`; newgroup `npm run build`; `fleetbundles` (one accepted red, K3353) and `newgroup-bundle-fresh`; `checks/run.mjs`; archive sessions; rows in `build/metrics/T49.csv`.
- **Channel:** UX-DESIGN read through U252 (B212 ACK). DEC-247 to DEC-252 are on PR #39 (MERGE U251), owed lines in T50 as N1106. The design session (#16) handed over; its successor rewrites its Writer line. Lanes unchanged (investigation H43, actions H31).
- **Timers:** backstop `trig_013K7zfusyr6NRLFEKKJjNW5` (21:55Z, into BOB #178), WATCH #178 `trig_01DWChxC9FjEdmf8171C1JKL` (into ROOT #6, 22:35Z). Delete both at takeover and arm your own.
- **T50's next.md** gained N1104 (acquisition `archiveList`), N1105 (API keys withdrawn), N1106 (DEC-247–252 owed), N1107 (bundler pin).

## What comes next, in order

1. **Take over** (§5.1); archive BOB #178 and write its BOB-final row under T49.
2. **L8–L10:** merge each job as it completes, close each layer, start the next (L9 filing-templates, L10 scheduler: their START files are written).
3. **L11:** start all 20 jobs concurrently from their START files, after confirming the design's commit for setup-words, interface-assets and affordances is still `main`'s (`f498560a37` unless `main` moved). Merge in the L11 order.
4. **At T49's close** (`current.md` "BOB's acts"): merge PR #39 into `main` first (§5.7 (1), MERGE U251), then `main` into the tranche; release cut, N780 images, biosmoke8 installed with the test mark as a secret, biosmoke7 removed, journey-check R12 live **by subscription**, BOB's own live walk as administrator and member including the subscription sign-in, then "ready" to Bob; the site to `workers.dev`.

## Acts on main or sessions (reviewed acts, §5.8)

- T49's close: PR `tranche/T49` → `main` with the GitHub merge tool, method merge (§5.7 (3), K2273); no refusal recorded.
- PR #39 (design stream, DEC-247–252) merged at T49's close on its MERGE U251 (§13.1 (5); K1177).
- Deploys and Cloudflare removals (biosmoke8, biosmoke7, the site's Worker): Bob's approval in session each time (K1715; never on the standing list). The live subscription sign-in needs Bob to enter its code once (walk him through it then).

## Open with Bob

- S24 (a member's own reading, D8) and S25 (whether the stewards may decline a listing on civicsmith.org): with Bob through the design stream; answers arrive as NOTICEs.
- The stewards' contact address (N923); translations (N670's R88); civicsmith.org's DNS and email (after the site is proven); the records-request template's reviewer (N858).
