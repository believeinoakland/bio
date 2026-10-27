# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #322 (`session_018Bhcedcx1arC3HPfsGQvzJ`, depth 1, parent ROOT #10 `session_01XHjMEPkzmkLycoWtxb4yn6`; Bob's primary account) for BOB #323, 2026-10-27 ~17:25Z, at 42 % of its window (refresh.md); no step half done, **no module job live**. **T53 is OPEN** on `tranche/T53` with no round: the beta is designed by lanes, then planned, then built (K5417, K5418). Read whole: K5426, K5473, K5474, K5484, K5490-K5492 (`build/rulings.md`), then `build/plan/beta/LANES.md` and `build/plan/beta/MAP.md`.

## Bob's direction now

- **Design the beta whole, then one comprehensive build plan, then build** (K5417, K5418). No module job starts until the plan exists.
- **Bob's questions live on one page** (K5426): `build/plan/beta/QUESTIONS.html`, published at https://claude.ai/artifact/SrK7xHyWMbW8TJntxkKzkv, in parts `QUESTIONS-open-{platform,ai,capabilities,planning,journeys}.html` and `QUESTIONS-answered.html` (republish with `url` and `files` naming every part changed; a refusal hands the live part: confirm its hash equals the tranche's, then republish). **Bob answers by commenting** on an option: record his words verbatim as a K (`proc ruling`), cut the `<article>` from its open part, prepend a `<details>` to the answered part, add a line to its `rulings-product/<subject>.md` home, commit, republish, reply in the thread, resolve it, tell every lane it touches. Any of his "A, but …" is recorded in his words with BOB's details marked (P17). He sometimes asks for more background instead: rewrite the question on the page, reply, resolve.
- Merges, repository acts, releases and test deploys are BOB's, never asked (K5346, K5293, K5120).

## Your takeover

`proc takeover` owes a `TAKEN OVER` message to me: send it, wait for `ROUTINES DELETED`, `proc bob cleared`, archive me, `proc bob archived`. My routines: the backstop `trig_012JbRuy5HyEovfvk6bi1HN2` (17:33Z); I delete it on your message. Arm your own backstop. Watch the questions page and the plat-s1 steps page (`ArtifactComments` `watch` on https://claude.ai/artifact/SrK7xHyWMbW8TJntxkKzkv and https://claude.ai/artifact/4vDtW8AnL8UCLP3JkAfooB). Run `mail.mjs xwriter --as BOB --session <yours> --account secondary` (channels.md still labels BOB "secondary"; the tool refuses another label).

## Next, in order

1. **Bob's act pending: the plat-s1 administrator invitation for PLATFORM #2** (K5473 (4)): PLATFORM #1's own invite was refused by auto mode as a permission grant. I gave Bob plain steps (sign in at https://plat-s1.believeinoakland.workers.dev/ with the founder password, Members, invite with "look after the team's Civicsmith" ticked, paste the link). When he pastes it, send it at once to PLATFORM #2 (`session_018BhcegTAycjUS9ubrhLQ2p`) only. The `CIVICSMITH_TEST_INSTANCE` secret on Worker plat-s1 was refused ("Secret-Store Writes", K5470): not retried; asked of Bob only if PLATFORM needs it (it says not).
2. **Re-run the suites for U498-U506's modules** (my run, started 15:38Z as a session background task, was still in screens-inquiry at handoff and dies with this container): `proc tests --tranche T53 --modules capture,doorbell,file-safety,workbooks,screens-daily,screens-intake,queue-producers,notice-producers,screens-inquiry,attestation,following,money,ratification,control-plane,provenance,promotion,screens-investigate,setup-words,case-checker` as a session-tracked background task; U500-U506 changed only words and design files (rows.mjs, program.mjs regenerated). Note: something detached HEAD to `origin/tranche/T53` mid-run once (likely the run); check `git status -sb` before every commit and re-attach with `git checkout tranche/T53` + `merge --ff-only`.
3. **Lanes at every backstop**: merge each lane branch into `tranche/T53` (each writes only its folder), merge every UX-DESIGN MERGE (regenerate every manifest artifact, verify, checks; baseline: every check 0 but fixtures' 89, TESTS-SWEEP's), `mail.mjs xdone` through it. Lanes message BOB constantly: decide each technical point yourself (P17), record a K, reply; put every Bob point on the page; start a successor from its `NEXT-SESSION-PROMPT.md` when it asks, and update `LANES.md` §3.
4. **When PLANNING's plan is READY** (`plan-T53-draft.md`, `CONSISTENCY.md`, `FOLD-AI.md`, `plan-T53-journeys.md` on `lane/planning`): review it whole (a reading worker past 50 KB), bring Bob only what is his, write every requirement line, `modules.json` and round R1 through `proc round open`, merge TESTS-SWEEP first, then build.

## Waiting on Bob (do not ask again)

- On the page: C11-C20 (CAPABILITIES), F4 (a photo's place in a published edition), J1-J7 (JOURNEYS), L1-L26 (PLANNING). Every AI question is answered (AI1-AI16: K5475, K5477-K5489, K5493, K5494).
- plat-s1's administrator invitation (step 1).

## State worth knowing

- Today's rulings K5470-K5501: Bob's answers (K5475, K5477-K5489, K5493-K5500) and BOB's decisions (the rest). Notably K5471 (lane points; F4, AI11 to Bob), K5473 (photo source, the installer's Logs scope rises to seven, biosmoke8 redeployed before any re-walk), K5474 (JOURNEYS' 19 sorted: 7 Bob's, 8 UX's as DEC-472, 4 BOB's), K5476 (journeys §D placements; events gains withdrawEvent), K5491 (personal-subscription calls left out of health counts).
- The account-move procedure is written and certified (K5472; civicos-process PR #18): `situations/account-move.md`.
- Lanes at handoff: AI-DESIGN #4 READY and final (nothing open); PLATFORM #2 waiting on the invitation, specifying measuring ops; CAPABILITIES #2 folding C2-C10, waits on C11-C20 and L18; FILES #1 READY; JOURNEYS #4 drafts READY, aligning with DEC-472; TESTS-SWEEP #1 converting tests (merged only before the build); PLANNING #3 just started (archives #2); UX-DESIGN #44 drawing B559-B562 (U8-U11, C2's marker).
- `rulings-active.md` unchanged by me; about 12 KB of its 25 KB.
