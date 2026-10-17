# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #205 (`session_019dkqtGG1Y3mecTGLDcJWvD`, depth 1, parent ROOT #7, primary account), 2026-10-17 ~18:50 UTC, at 42% context, at a clean point (L10 closed, L11 not started, every mailbox and the channel read). Read `build/rulings-active.md` whole, then, whole with the Read tool, K3736–K3759 (none is Bob's; K3717, K3718 and K3735 from the last handoff still govern).

## Standing

- **Bob's direction (K3717, K3718):** T50 runs through L11 with no more effort on getting the assistant to work; nothing of it is disabled or hidden; no plan entry is withdrawn. The parts waiting on the remote proof stay unbuilt and accepted red (K3718 (2)). T50 is confirmed on its unassisted metric (K3666's first and third clauses, walked on biosmoke8). After T50's close PR merges, push branch `release/T50-unassisted` at that `main` commit (K3718 (4)). Then the focus is N1220 (the multi-AI assistant, provisional bar K3735).
- **AI-DESIGN #1** (`session_01GLY6Z5UAa6urPzovQPKCkR`, `build/plan/lane-ai-design/`): read through A5 (Q2b done; next Q3, the boundary).

## Where things stand

- **L1–L10 closed** (L9 K3755, L10 K3759). **L11 is next: start it at once (§5.3).** Its requirement lines are folded and checked (K3742, K3744, K3745, K3747, K3749) and its 29 STARTs are written in `build/plan/starts-T50/` (K3752: the design commit they name is `7be06eb4cb`). Models are in each START's first line. Push the 29 `job/T50/<module>` branches from `tranche/T50`, post each START, create each session (`<MODULE> #<k+1>`: find k with `grep -o '<MODULE> #[0-9]*' build/rulings.md | sort -t'#' -k2 -n | tail -1`), `mail addjob`, then rule. Merge order (rule 1): translations first, answer-envelope right after it (K3696), then `modules.json`'s order; interface-shell before every screen job; screens-settings first among the screens; journey-check last.
- **Accepted reds by name, beyond plan rule 5:** K3718 (2)'s remote-proof ids; case-authoring `standards.test.mjs`:96, :140 (N1221); case-inputs `openrequests.test.mjs`:150, `t46-words.test.mjs`:45 (N1224); consequences R25, escalation R30, R31, R33, action-producers R24 (N1225); action-holds `hidden.test.mjs`:64, `readers.test.mjs`:46 (N1227); the row census `row-census-1.77.0.jsonl`:424 (T51's stamp); and until their L11 jobs: plane `roster.test.mjs` R5, R9, R45, `t46.test.mjs`:464–469, `t47.test.mjs` R45 (T50-36); installer's `CIVICSMITH_*` copies (T50-78); `site/build.mjs --check` (T50-37); the ops-map and op-declarations tests of `watchitem`, `secondlook`, `secondlookclear`, `stakeatpreparation` (T50-24, T50-18); affordances' layer-9 read count (T50-19).
- **next.md new since K3734:** N1224–N1228.
- **Channel:** UX design #27 `session_01S7xeW38PtVh94Sy8LiatgK` has handed over (U345); its successor #28 is Bob's to open (he started #27 through BOB #203, K3713). Read through U345, posted through B302. Merge each verified docs-only MERGE into `tranche/T50` at once (K3618; last K3750, design @ 7be06eb4cb).
- **Timers:** WATCH #205 `trig_012pN1Jfyox96UQEcsQTU9r1` into ROOT #7 (19:25Z); backstop `trig_01UYqFjiPLdvBjTaQYbzjVrL` (18:45Z, may have fired; re-armed if so). Delete both at takeover; arm your own.
- **Environment:** this container has `node_modules` in agent-runner, file-scanner, sheet-worker (reinstalled after a restart); a new one needs `npm ci --ignore-scripts` there before `fleetbundles`, which is run from `bio-plane/` to print its 152-pass line.

## What comes next, in order

1. **Take over** (§5.1). Archive BOB #205 once idle (its BOB-final row under T50). Delete its timers.
2. **Start L11** (above), watch it (§5.4), merge each job (§5.5), close it (§5.6), close T50 (§5.7), then push the named point (K3718 (4)).
3. **Read AI-DESIGN's HANDOFF** at each backstop; put each question for Bob to him the turn it arrives (K3082).

## Acts on main or sessions (reviewed acts, §5.8)

- `main` moves only by T50's close PR (§5.7 (3), K2273), with the design stream's MERGE first (§5.7 (1), K1177); then `release/T50-unassisted` at that commit (K3718 (4); a branch push, never a tag, K1709).
- Merging the design branch's verified docs commits into `tranche/T50`: K3618's practice, last K3750.
- Starting UX design #28: Bob's word first (K3713 started #27 on his words); not asked as an approval, asked as his choice.
- Deploys to biosmoke8 need Bob's one-line approval in the refused session each time (rulings-active §2); none is due before T50's release walk.

## Open with Bob

- Whether to start UX design #28 now (put to him by BOB #205; recommended yes, with #27's `docs/development/ux-substrate/NEXT-SESSION-PROMPT.md`). On his yes: `create_session` on `claude/gallant-brown-zg0wc1`, title "UX design #28", opus, that prompt; archive #27 once idle; manifest and a K.
- A2's three AI choices and A5's fourth, put to him by BOB #204 and #205 (no answer yet): (1) how a team connects an AI (built in on the team's own Cloudflare first, a pasted key for any provider, a sign-in button where offered; no Civicsmith-held shared key); (2) DeepSeek's own service not offered, its models through other hosts; (3) only tiers that do not train on customer data, a warning otherwise; (4) consumer subscriptions listed "not available for use with Civicsmith" unless a provider documents a route. All recommended. When he answers, record it as a K in his words, post it to AI-DESIGN (send_message), and fold it into the lane's work.
