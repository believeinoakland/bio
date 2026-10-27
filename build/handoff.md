# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #320 (`session_018BhcecJrZBGdFHx6zQiGAc`, depth 1, parent ROOT #10 `session_01XHjMEPkzmkLycoWtxb4yn6`; Bob's primary account) for BOB #321, 2026-10-27 ~14:20Z, at about 40 % of its window; no step half done, **no module job live**. **T52 is closed into `main`** (PR #45, `e5f7190d76`; layers 1-6 of R1, 26 entries, DEC-444 to DEC-453). **T53 is OPEN** on `tranche/T53` with no round: the beta is being designed by lanes before anything is built. Read whole: K5413, K5417, K5418, K5419 (`build/rulings.md`), then `build/plan/beta/LANES.md` and `build/plan/beta/MAP.md`.

## Bob's direction now

- **Design the beta whole, then one comprehensive build plan, then build** (K5417, K5418, now in `rulings-active.md` §1). No module job starts until the plan exists. T52's unfinished entries (layers 8-11, T52-100) are in `build/plan/carried-T52-R1.md`.
- Bob approved the lane set; the tests sweep is option A, as its own lane; PLANNING is a lane BOB manages; every lane's documents are size-capped in code (`proc sizes`; a lane's `HANDOFF.md` at 25,600 bytes, civicos-process PR #17).
- **Three Max 20x accounts.** When an account's weekly capacity nears its end, all work spins down and starts again on the next account (K5418). The procedure is not yet written: next step 4.
- Merges, repository acts, releases and test deploys are BOB's, never asked (K5346, K5293, K5120).

## Your takeover (new, K5413)

`proc takeover` now owes a `TAKEN OVER` message to me: send it, wait for my `ROUTINES DELETED` reply, record it with `proc bob cleared --name "BOB #320" --session session_018BhcecJrZBGdFHx6zQiGAc --reply "<my reply>"`, then archive me and `proc bob archived`. My one routine is the backstop `trig_01XZrgjhf8kXQoNQ9KFcX8Rz` (14:53Z); I delete it myself on your message.

## Next, in order

1. **Lanes at every backstop** (hourly): `get_session` each lane in `LANES.md` §3; read each `HANDOFF.md` §0 on its branch (`lane/<name>`; AI-DESIGN on `lane/ai-design`, folder `build/plan/lane-ai-design/`; JOURNEYS folder `build/plan/lane-journeys/`); merge each lane branch into `tranche/T53` (they write only their folders; TESTS-SWEEP only after it reports its full run green, as a P7 pass with a ruling naming every module it touched); keep `MAP.md` (§1 states, §2 needs between lanes) and relay each need; start a lane's successor when it asks (from its `NEXT-SESSION-PROMPT.md`, recording the session in `LANES.md` §3).
2. **Bob's decisions:** bring each question a lane raises to Bob with an explanation, options and a recommendation, rendered (an Artifact); record his answer as a K ruling in his words and send it to every lane it touches. AI-DESIGN #3's first deliverable is Bob's AIR decisions worded as K lines: record each with `proc ruling` (they are Bob's, made in that lane, K3717 onward), reconcile those they supersede (`HANDOVER.md` §9), and send A41's `UX-REQUIREMENTS.md` to UX-DESIGN as one HANDOFF.
3. **UX-DESIGN #43** (`session_018BhcefCkHUHGG8UK3QabvX`) read through B552 (the lanes' NOTICE). Merge each MERGE it posts into `tranche/T53` at once (no job runs), with the regenerate, verify and checks; run the suites it names, and money's whenever words change (K5415 missed it once).
4. **Write the account-move procedure** (BOB's, P17; certify by a dry run, P3): civicos-process `situations/account-move.md` and its row in `roles/BOB.md`. The trigger: `rate_limit_info` with `rateLimitType` `seven_day` not `allowed` in BOB's or any lane's `get_session`, or Bob says so. The acts: `SPIN DOWN` to every lane and UX-DESIGN (LANES.md §1 tells them to reply `SPUN DOWN`), a BOB handoff naming the next account, Bob told in one line to start ROOT there with the prompt to paste, and the next BOB restarting every lane from its prompt. Precedent: K4786-K4790 (the move to the third account). Sessions on one account cannot reach another's; the mail channel crosses accounts.
5. **The manifest's "Parallel work" sections** (PERFORMANCE, AI-DESIGN, JOURNEYS) are stale: point them at `LANES.md`.
6. **When PLANNING's plan is READY:** review it whole (a reading worker past 50 KB), bring Bob the architecture changes that are his (new modules carrying capability, layers), write every requirement line and `build/plan/current.md`'s round R1 through `proc round open`, merge the tests sweep first, then build.

## Waiting on Bob (do not ask again)

- Every open question is on `build/plan/beta/QUESTIONS.html` (https://claude.ai/artifact/SrK7xHyWMbW8TJntxkKzkv; K5426). A1-A8 answered (DEC-457 to DEC-464).

## State worth knowing

- My report to Bob on T52's close was given in his chat: 26 entries done in about 6.5 hours, 79 carried, no release.
- JOURNEYS #3 may still be live; JOURNEYS #4 archives it. UX-DESIGN #42 is archived by #43.
- Process changes today: civicos-process PR #16 (an outgoing BOB deletes its own routines; `proc bob cleared`, K5413) and PR #17 (lane sizes); `main` at `4979bb7`.
- `rulings-active.md` is about 12 KB of its 25 KB.
