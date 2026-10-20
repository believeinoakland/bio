# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #229 (`session_01GDgtaPVk3SHw7gc3zSAStF`, depth 1, parent ROOT #7, primary account), 2026-10-20 ~04:10 UTC, at about 50% context, on Bob's word ("If so, then refresh"). **T51 is OPEN** on `tranche/T51`; release 0.86.0 is cut, signed and deployed to biosmoke8; no job runs. Read `build/rulings-active.md` whole, then with the Read tool, whole, **K4159–K4187** (the last lines of `build/rulings.md`; `sed -n` them into a scratch file first), then `build/plan/deadends-T51/CAUSES.md` (48 KB, whole) and `build/plan/fix-round-T51.md`.

## What changed this session (Bob's, in force)

- **K4162 · find every dead end, then one fix round; K4164 · the long-term goals; K4170 · functionally complete and runnable, toward alpha.** In `rulings-active.md`. Done means every design journey completes and every use case WORKS or is HELD by Bob's exclusion with an honest screen, read by the census; no single-check cycles.
- **The census** (K4165, `build/plan/deadends-T51/`): 172 use cases (40 works, 48 partial, 60 dead end, 24 held), 85 causes (19 BUG, 11 DOOR, 13 CONTROL-DRAWN, 32 CONTROL-UNDRAWN, 10 NO-OP). No team can publish a case (C1, C2, C3). The design has since drawn all 32 undrawn controls and C12/C49/C62 (DEC-374 to DEC-378, merged; K4174, K4183).
- **Bob's choices:** K4169 C12, C49 built (C77 closed: Bob kept DEC-111, K4172; C12's classification row NOT built, K4185); K4180 test deploys by a GitHub workflow under `deploy-test` (Bob created it and its `CLOUDFLARE_API_TOKEN`, K4184); **K4186 development builds deploy to biosmoke8 unsigned** (deploy.mjs checks no signature), the test signing key dropped; only the alpha release is signed (Bob's one GitHub click).
- **Approvals do not carry across sessions** (K4177): auto mode's check reads only its own session; settings rules do not override it, and researching around it is refused. Bob's approval of the biosmoke8 development release (K4172, K4179) was given in BOB #229's session only. Until FR-DEPLOY's workflow merges, a direct deploy from your session may be refused ("Production Deploy"): then deploy through the workflow once it exists, or record the refusal and wait; never work around it.
- **Release 0.86.0** (K4176, K4178): `dist/cut-0.86.0` @ 1a17154149, signed (run 39359464567), controls 7/7; on biosmoke8 the plane and file-scanner, pdf-, ocr-, sheet-worker serve 0.86.0; **agent-worker refused** (10061: binds agent-runner's `RemoteSession`, not exported), kept 0.85.0; smoke PASS (K4181). Not yet merged into `tranche/T51` (do it at the start of the fix round: K3217, a signed cut is merged into the open tranche).
- **Found live:** the scanner has no ClamAV signatures (database.clamav.net refuses its downloader): fix by ClamAV's own updater, never by borrowing its User-Agent (K4182, K3658). The installer exceeds its memory at the 29 MB plane (newgroup R33; no team can install or update 0.86.0). Walk group E (the walk's pseudo route cost) traced (K4161).

## Running when I handed over (in BOB #229's session)

- Three live walkers (sonnet): `build/plan/walk-T51-live/information.md`, `act.md`, `team.md` (brief `BRIEF.md`), writing as they go.
- The planner revising `build/plan/fix-round-T51.md` and `starts-T51-FR/*.txt` on BOB's three corrections (FR-SIGN out; C12/C49/C62 screens in; the 32 declaration-only jobs replaced by one mechanical pass, `fix-round-T51-pass.md`). **Its files are a DRAFT** until you review them.
- **Do not archive BOB #229 until** its walkers and planner have finished and their files are committed (I commit them as they land, then go idle); check `git log -- build/plan/walk-T51-live build/plan/fix-round-T51.md` and that session's status. Then archive it and write its BOB-final row under T51.

## Next, in order

1. Take over (§5.1): Status line and Writer line; delete WATCH #229 `trig_01DQZzjYRK2G3yDT76R2kMAq` (into ROOT) and arm yours; read the channel (UX design #35 `session_017Kc5zXnyJCdnZCKZ4daDSe`; read through U410, posted through B404).
2. When the walkers finish: group their findings by cause with the census; place every live-only cause in the fix round (each in the module that owns it, K4164).
3. Review the fix round (`fix-round-T51.md`, the STARTs, the pass): check the three corrections were made, the reading sets (screens-inquiry 1,044 KB, screens-settings 751, screens-action 680 carry §17's digest step), then merge `dist/cut-0.86.0` into the tranche, start **wave 1** (5 jobs: test-support, bundler, op-grades, op-declarations, interface-shell) as the completion round (§5.3, §5.7 (0)), then the **mechanical pass** with no job running, then **wave 2**.
4. Then one check pass on one tree (every module's tests with `mt.mjs`, `checks/run.mjs`, the local walk once, the census re-run), redeploy to biosmoke8 (unsigned dev build; through FR-DEPLOY's workflow), the smoke, a targeted re-walk; repeat only for what that pass finds; the round should shrink each time, else stop and tell Bob why.
5. At the end: the alpha release cut and signed (Bob's one click), T51's close (§5.7), the report to Bob.

## Acts on main or sessions (reviewed acts, §5.8)

- `main` moves only by T51's close PR (§5.7 (3), K2273) and the design PR at the close on its MERGE (K1177); no refusal recorded.
- Never force-push. Deploys to biosmoke8: K4177 (above); the standing safety rules hold (account 20b5…7f72 only).

## Helpers (rebuild in your scratchpad)

- `mt.mjs`: a copy of `.github/scripts/module-tests.mjs` that filters modules by argv, passes `--test-force-exit`, and excludes `journey-check/journey.test.mjs`. Write test output to a file, never through `| tail` (it hides progress).
- Packages before any test run (K4113).

## Open with Bob

- None.
