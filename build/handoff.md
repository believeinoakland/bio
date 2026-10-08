# Handoff

**Status** · Replaced whole at each handoff; holds only where things stand and what comes next. Written by BOB #134, 2026-10-08 ~00:25 UTC, for BOB #135. Read `build/rulings-active.md` first.

## Open with Bob (each waits on him; none blocks the layers)

1. **Release 0.81.0, two approvals typed in your session** (K2074, K2084; acts reviewed each time, never on the standing list: K1716, K1910, K1915): "Approved: run the seven ssh-keygen signature controls over release 0.81.0. Standing list: not added." and "Approved: deploy release 0.81.0 to the test instance biosmoke7 (agent-runner container, the four workers, the plane, then the newgroup installer). Standing list: not added." He was asked in BOB #134's session; an approval typed there does not reach yours (§16), so ask once more in yours. Cut: `dist/cut-0.81.0` @ `23cc7807f7` (image `ghcr.io/believeinoakland/agent-runner@sha256:a187d554…3019`); regression triaged, nothing blocks (K2084). After the deploy, measure M-Q2 before L6's START: if measured, T36-50 (agent-runner) and T36-24's relay share join (rule 7 (a)); F1's tail joins T36-26, T36-36, T36-37 if the release is deployed before L8's START (rule 7 (b)).
2. **Key custody, three questions** on https://claude.ai/artifact/TB55RCpWXtBEWUanVnCA3A (who acts if Bob is unavailable; rotation; where he keeps keys); recommendations there. Distribution §10 is written (K2072). Record his answers in his words.
3. **The investigation engine** is now the INVESTIGATION-DESIGN lane's (K2076; manifest): session `session_01MoJa8LUVd6PRJDtgoSdRvj`, branch `design/investigation`, page 1 at https://claude.ai/artifact/EZoYvGdvkX2F6jNogG9vNP (D25–D31 new, D23 revised). Read its `HANDOFF.md` at takeover and each backstop; H1 asks nothing of BOB. Comments on the old page J2q3Q4Dmq3FU3phTz7nUdg reach BOB #134 only; relay none expected.

## Where things stand

- **T36 is open** (K2072) on `tranche/T36`; plan `build/plan/current.md`; Status line names BOB #134 until you take over (`mail bob`). Meter 28% at the opening (K2073).
- **L1 closed** (K2086): connection-grammar, signatures, bundler, office-readers, doctypes, file-scanner merged (K2078–K2085); plane bundle regenerated; sessions archived, rows in `metrics/T36.csv`. `release-sign.yml` written (rule 6, N713): its first run waits on Bob's GitHub sitting (environment `release`, Bob required reviewer, `BIO_RELEASE_SEED` its secret) and on the signer page's new keys (signatures R43, R44): walk him through both before T36's release; from bundler's merge no session signs (K2077).
- **L2 running** (STARTs B1, K2086): MEMBERSHIP #27 `session_01Kozvc5CabUVjWrHpUnjz1Z`, CREDENTIALS #7 `session_01DuWUHZfSSRpYU5V4qt2iss`, PROMOTION #34 `session_01PfzH458a5tMgwWs1AQfAys`; merge order membership → credentials → promotion (promotion stamps credentials' new rows, so it merges the tranche after credentials). Started 00:15 UTC; confirm their starts.
- **L3 requirements written** (K2087), including file-safety (K2072): STARTs next, after L2 closes (rule 4's `modules.json` edges at each START: acquisition uses file-scanner, etc.).
- **§17 certified** (D14, K2083): each START measures its set with `build/plan/reading-sets.py` (it counts used modules' whole public parts, an over-estimate); over 300 KB, a task summary by the job's own workers, as the L1/L2 STARTs word it (`build/plan/starts-T36/`).
- Accepted reds: plan rule 5 items 1–15 (K2084 added 12–15; 6 and 9 cleared).
- Timers (yours to replace at takeover, delete mine by id): BOB #134 backstop `trig_01SNoidRT9vWvY4rTXJwgRmX`, WATCH #134 `trig_01KJJG9Ep8J4jMjCGj9wtBPw` (into ROOT). The artifact watch on TB55RC… and J2q3… is this session's; re-watch TB55RC… from yours.

## Next steps, in order

1. Take over (§5.1): archive BOB #134 (`session_01NrV6M5qXNkuHFroNuTCcu3`), write its `BOB-final` row under T36; arm your backstop and WATCH.
2. Ask Bob for the two release approvals (above) in your session; on approval run K1910's controls on the cut, then deploy as K1915 did; then M-Q2.
3. Watch L2; merge each job (§5.5); close L2 (§5.6: regenerate, checks, archive, rows; `case-checker/program.mjs` and the plane bundle per L2's line); start L3 (§5.3) with measured STARTs.
4. Alongside (§5.9): L4–L5 requirement wordings by workers, reviewed (T36-13, T36-14 with its hub fix (K2079), T36-15–T36-19, T36-42).

## Process notes

- Doorbells: batches of six or fewer; ring with `run_once_at` the next whole minute or two.
- After a container restart: `npm ci --ignore-scripts` in agent-runner, `npm ci` in sheet-worker (and bio-plane, newgroup, the workers) before `fleetbundles`.
- `node --test` on `fleetbundles.test.mjs` reports one wrapper test; run it with plain `node` to see its PASS/FAIL arms.
- The release's version guard reads only the cut's own `release/RELEASE.json` (K2074).
