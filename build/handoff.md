# Handoff

**Status** · Replaced whole at each handoff; holds only where things stand and what comes next. Written by BOB #133, 2026-10-07 ~22:55, for BOB #134. Read `build/rulings-active.md` first.

**Open with Bob:** the investigation engine's decisions, shown rendered at https://claude.ai/artifact/J2q3Q4Dmq3FU3phTz7nUdg (K2064): D1–D4, D6–D8, D12–D14, D16–D24 are his (D1, D17, D18, D23 alone start the no-AI stages 1–2, N748); D5, D9, D10, D11, D15 are settled by K2064. Watch that page at takeover (`ArtifactComments`, action `watch`, its url) so his comments wake you; when he rules, record his words (rulings-active §1) and write N748's requirements by workers, reviewed. Also tell him when **all** the record work is complete: only the 18 layer-11 requirements files' Status lines remain (N737), now doable since L11 closed.

## Where things stand

- **T35 is closed** (K2068, K2069): `main` = `tranche/T35` @ `0ced0143a8` (the closing commit; K2069 is on `tranche/T35` after it, build state between tranches lives there, K1703). PR #13 merged (K2068). Bob's meter: 27% on the secondary account at the close. No timers are armed (backstop and WATCH #133 deleted).
- Bob approved today: the Working-with-Bob wording (K2055), the job reading wording (K2057), P20 and mechanics §17 (K2060), all made in both repositories.
- The process repository's `main` is at `b791031` (P20, §17, certification row RS1 PLANNED).
- `plan/draft-T36.md` is ready (49 jobs; its questions settled, K2063). ROOT #6 is `session_01FXbdTJZyPp3Bhcv7pfVSR1`.

## Next steps, in order

1. Take over (§5.1): archive BOB #133 (`session_01WHpeByq4bJ1d3wR2fb6qM9`) and write its `BOB-final` row under T35. No tranche is open, so arm no backstop until T36 opens; the WATCH comes with the opening.
2. Release 0.81.0, held until T35 completed (K1922): re-cut from `main` @ `0ced0143a8` on `dist/cut-0.81.0`; each deploy is Bob's approval in your session (K1716; never the standing list). The installer is deployed only with an embedded release carrying admission R20 (K2041). Duplicate check ids C-137 (N738, now in T36-10): weigh holding the release for it. T36 rule 7 (draft): N708 and F1's tail join T36 only if M-Q2 is measured or the release deployed before their layer's START.
3. Open T36 (§5.2) from `plan/draft-T36.md` at once (K1507): its rule 6 lists BOB's own opening acts: N737's 18 L11 Status lines (a worker drafts, BOB reviews, as K2056); N739 (measure each START's reading set with `build/plan/reading-sets.py`, mechanics §17's order where over; cut `current.md` to open entries); N746 (the dry run certifying §17, `dryrun/CERTIFICATION.md` RS1, recorded in `dryrun/RUNS.md`); the D1–D24 sort is done (K2064); ask the design stream for the word list (N669); the custody section before L1's START, `release-sign.yml` at L1's close (N713). `file-scanner` and `file-safety` enter `modules.json` with rev. 2's rows (K2008), with the file-safety R8–R10 re-wording and R38 before L3 (rule 2).
4. Bob's environment clean-ups N711–N713 (K1936), each walked through when its work lands.

## Process notes

- Doorbell creation is rate-limited (about 10 a minute): ring in batches of six or fewer.
- Post long mail bodies with `--body-file`; backticks in `--body` break the shell.
- After a container restart, `npm ci` in `agent-runner` (`--ignore-scripts`) and `sheet-worker` before `fleetbundles` (agent-worker has no lockfile, nothing to install).
- Accepted reds carried into T36: 3 (legacy-ui baseline), 32 (`fleetbundles` agent-worker pin, N733), and K1901's regression-only set.
