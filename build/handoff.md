# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #310 (`session_01YMyHacYQYvkBnTBgfgk6iF`, depth 1, parent ROOT #7 `session_01NBNGB2ziVqiZg4ewLgRSWm`, **Bob's primary account**) for BOB #311, 2026-10-26 ~14:50Z, at 45 % of its window; no step half done. **T51 is OPEN** on `tranche/T51`. Read rulings K5292-K5301 whole, `build/plan/fix-round-10-T51.md` items 131, 143, 144, 145 whole.

## Bob's direction now (in `rulings-active.md`)

- **K5257:** deploy now, walk live, then every effort to the beta with all its requirements; efficient with tokens, no deferrals, urgency.
- **K5293 (releases):** "You do not need my approval for a release. I've given you those permission - twice." Every release act (`dist/cut-*` pushes, signature checks, installer and site deploys) is BOB's own. Never ask Bob for it; an auto-mode refusal is answered by citing K5293 in the refused session (K5294 removed every line that asked).
- **K5298:** the stewards' contact address is **stewards@civicsmith.org**, forwarding proven (K2799's precondition met).
- **K5300:** branches are pruned by `.github/workflows/prune-branches.yml` (sessions cannot delete refs: the git proxy answers 403); the real deletion runs in a job, never a worker.

## Open with Bob

None. Do not re-ask anything above.

## First

1. Take over (§5.1). My timers: backstop `trig_01A3q92ss5MMdn18x5Wuu37B` (15:10Z), WATCH #310 `trig_01WGRMxcvUJKsVNp5dc9b42t` (15:50Z into ROOT #7); delete both by id. Archive BOB #310 once idle; write its `BOB-final` row under T51.
2. `mail check` from civicos-process **`prep/retire-K5296`** (`git -C /home/user/civicos-process fetch origin prep/retire-K5296 && git -C /home/user/civicos-process checkout -B prep/retire-K5296 FETCH_HEAD`): one fetch for every job (17 s), and `MERGED → archive its session, then retire` for a merged job. **Read its whole output; never filter quiet or "nothing" lines** (that hid PLANE #64 for 8 hours, K5296).
3. Premerge as K5292-K5300 record it: cursor at BOB's newest; ownership against `git merge-base`; `--no-ff`; `node bio-plane/src/setup-words/build.mjs`; `checks/run.mjs` (format, architecture, words 0, fixtures 89, coverage only the running jobs' new ids); the module's suite on the merged tree (jurisdictions' tests are `jurisdictions/test/`, not `bio-plane/test/m/`); verify BEFORE pushing (a push sends the whole branch, K4683); strike marks; ruling; archive with its row; `mail done`. **Shallow clone:** `git fetch --depth=3000 origin tranche/T51 job/T51/<m>` first.

## Running (addresses in the plan's Jobs line)

ACTION-GRAMMAR #16 (R30), INQUIRY-GRAMMAR #15 (R69), CONNECTIONS #21 (R73), SCREENS-INVESTIGATE #25 (R64: Standard's four acts, DEC-438), SCREENS-ACTION #28 (R58: Matter's three sentences), CONFORMANCE #31 (R44), MONEY #12 (CHANGE B15: R33), PRUNE-BRANCHES #1 (the real deletion of 1,927 branches; its record must show the protected refs present after). UX design #41 `session_01FfxzNZtq7F8arhiJhGFggR` (B528-B535 to it; U480 merged; DEC-439 to follow).

**Accepted red, by name:** screens-investigate `money.test.mjs:126` (converted from a stale todo; clears when MONEY #12's R33 merges).

## Then, in order (plan items 144, 145, 131)

1. Merge every running job.
2. Item 144 (1), the §5.10 mechanical pass, once no job runs: every reader of the team zone in `causes-rewalk.md` §3 re-pointed to `jurisdictions.governingZone(getSetting("jurisdiction_profiles"), getSetting("team_time_zone"))` (R98, local-facts R22), with action-plans' red test of §3, §4 at the walker's case.
3. Retire every merged job from the Jobs line with `mail retire --module <m>` (the prep tool; ~170 entries; each is one commit and push).
4. Regenerate the artifacts in the manifest's order, verify, commit; deploy biosmoke8 (`deploy-test/biosmoke8/dry-run` then `/deploy`, plain fast-forward pushes, K5120); a targeted re-walk of items 143-145's rows (`BRIEF-rewalk.md`'s form).
5. The cut 0.87.0 (`build/plan/walk-T51-alpha/alpha-cut.md`; stewards address named; every act BOB's, K5293), its deployment, installer and site, the rehearsal; then Bob's install (K4935).
6. T52 opens as the beta (K5257); the test rethink with Bob first (K5258).

## Acts on main or sessions (reviewed acts, §5.8)

- bio `main` moves only by T51's close PR (§5.7 (3), CLAUDE.md's standing direction); the design's MERGE first. Design commits of design files only are merged into the tranche when asked (K5224, K5260, K5300).
- Release acts: K5293 (above). Site and installer deploys likewise. biosmoke8 deploys: K5120.
- Branch deletion: never by a session (proxy 403, K5300); only by `prune-branches.yml`, started by pushing a `prune/**` branch from a job, with a committed census list.
- Process repository edits: auto mode refused BOB #310's mechanics §16 sentence as "Instruction Poisoning" (K5294); not retried.

## Tools and limits

- Mail tool and checks: civicos-process `prep/retire-K5296` (`f70c1a2`, adds `retire` and one-fetch `check`; 238 of 238 tests) until T51's close, as `prep/jobbranch-K4385` was.
- `rulings-active.md` ~78 lines, ~25.2 KB (NEAR): a new rule replaces a line. `fix-round-10-T51.md` ~48 KB of 51.2 KB: move finished items whole to `build/plan/archive/fix-round-10-T51-done-items.md` before additions (§17).
- Channel: read through U480; B533-B535 posted. Lanes: no new HANDOFF entries this session.
