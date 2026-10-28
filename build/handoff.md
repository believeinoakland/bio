# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #330 (`session_018BhcedfM8dV8rPodwgBjD3`, depth 1, parent ROOT #10 `session_01XHjMEPkzmkLycoWtxb4yn6`; Bob's **primary** account) for **BOB #331 on the same account**, 2026-10-28 ~13:25Z, at about 41 % of its window (refresh.md). No step is half done. **T53 round R1 is OPEN** (the one build round, K5567): **layers 1-3 closed**; **layer 4 is running** (4 jobs started 13:21Z). Then layers 5 to 11, then the completion round (`build/plan/T53-completion.md`). Read whole: K5722, K5723, K5715, K5720 (`build/rulings.md`), then `build/plan/current.md`'s Layer 4 and Layer 5 blocks.

## Bob's direction now

- **Urgency (Bob, K5722, ~13:10Z): "Why have you stopped development??? I didn't tell you to stop, and principal 19 says urgency. You've wasted hours just sitting here doing nothing. GO!"** I had read `seven_day allowed_warning` as the account move's trigger and stopped after layer 3 for about four hours. The move is withdrawn; the work stays on this account. A weekly warning is no stop and no move: `proc layer start --usage allowed_warning` now starts jobs (civicos-process PR #27, 0d5de17), and `situations/account-move.md` says the move is on Bob's word only. Never idle: open each layer the moment the last one closes.
- One round, R1 (K5567). Work found goes to its module's open job, else a not-started layer's START, else the completion round.
- BOB adds a module's reads row in `words-reads.json` for a key already in `words.json` (K5681).
- The AI catalogue key ceremony waits for Bob ("We can do the key ceremony when I get back."): route K5625, `bio-plane/scripts/catalogue-keys.html` (SHA-256 87f1993cb4e726ecaed5d7101b05ef8ad018fe55cbea17496421e9c89738fcf5), steps in `build/plan/key-ceremony.md`.
- Questions page https://claude.ai/artifact/SrK7xHyWMbW8TJntxkKzkv: none open. The page I made for the account move (https://claude.ai/artifact/CkG2D5Kf149HDNhHRMRccz) is void.

## Your takeover

`proc takeover --tranche T53 --name "BOB #331" …`; send me `TAKEN OVER`; I delete my routines (backstop below) and reply. In this checkout: `git fetch -q --deepen=2000 origin tranche/T53` in the background; `npm ci --ignore-scripts --no-audit --no-fund` where `node_modules` is missing. A worker never runs in `/home/user/bio`. `proc ruling --files` takes a comma-separated list. `proc job started --name` needs the name quoted.

## Layer 4: running

| module | session | model |
| --- | --- | --- |
| calibration | `session_018Bhcec6UfHC9x41Jwa7guR` | haiku (English in tests only) |
| reading-pipeline | `session_018BhcecocgNyjm49Xi6Ji1S` | sonnet |
| extraction | `session_018Bhcee68Pp8u6nsGStpw6e` | sonnet |
| content | `session_018BhcefiNFG9xKziP2ibeWL` | sonnet |

- Lines written just before START (K5723): reading-pipeline R66 (the 100 MB text bound), R67 (held_unread); extraction R120 (held_unread re-run); content R63, R64 (A8 typed page), R68 (text-chain's constants, T53-529).
- Merge order: `modules.json` order (calibration, reading-pipeline, extraction, content), upstream first (K1965). At each merge remove the module's converted files from `build/tests-english-baseline.json` (run the words check after; never raise).
- At the close: `proc layer close --layer 4`; if it refuses findings in later layers' tests that copy a sentence a merge made a word, fix them as one mechanical pass (K5720's pattern); archive its sessions with rows; move the block to `plan/archive/T53-R1-layer4-merged.md`; then **start layer 5 at once**.

## Before each later layer's START (BOB writes these lines, just before `proc layer start`, K5377)

- Layer 5: events, confirm N1259-c R38's keys of `followedRegister` (T53-530); check the plan block's `[owed: …]` marks and `origin/bob/T53-req-*` branches for drafted lines; a worker can draft the missing ones on its own branch (as K5723).
- Layer 6: reading-guides' line for jurisdictions R126 (T53-531); **capture-requests T53-209** (K5574, K5575: her file matched to the waiting request, recorded as brought from that address; the Queue item; recognition and the per-host count are acquisition R140's, met).
- Layer 9: filing-templates R15, R35 reworded to cite jurisdictions R126 (T53-532). Layer 10: following T53-577. Layer 11: plane T53-546, T53-569, T53-579; queue-producers' and screens-intake's K5575 lines; T53-563 to T53-568, T53-575, T53-576, T53-578.
- Users' uses edges to mail-door enter at their STARTs (K5702). New modules: `paths`/`tests` by a text edit of the one line in `modules.json`.
- Models (K3518): haiku only where truly test-only with every key in the words (each rows file's model line says); sonnet otherwise; the default for a new module.

## Lanes

- **PLATFORM #3** `session_018BhcefSgvGb4qHQgvYMz4M` (sonnet), started 13:15Z from #2's prompt (2af1b79a27). I deployed `proto/levels-2-3-stages` d9abfdaa to plat-s1 at 13:16Z (`PROTO_STAGES=1`; verified). It runs the upload stage study for capture R120 / T53-108 (now a completion-round item: capture's job is closed). It needs a new `plat-s1-admin` reset link from Bob: when it sends the one line, put it to Bob plainly. Record #3 in `LANES.md` §3 (not yet done).
- AI-DESIGN, CAPABILITIES, FILES, JOURNEYS, PLANNING: spun down at the commits in `LANES.md` §3 (K5710), each READY with nothing open; restart one from its `NEXT-SESSION-PROMPT.md` at that commit when it has work (PLANNING when Bob decides the Levels 2-3 report; JOURNEYS for a re-walk after a redeploy). TESTS-SWEEP #1 inactive.
- AI-DESIGN #4's section 0 records a capture finding Bob raised in its session (robots.txt never read; Civicsmith's agent admitted by oaklandca.gov, a browser agent refused) and asked him whether to relay it: act only if Bob says so.
- UX design #46 `session_018BhceeSwn6V6RdavfMqjcH` (started by me, K5708). Merged through U522 (K5707). **U523 (DEC-490, 163462971b, B570's 11 retired AI acts re-pointed) is held until layer 11's re-point** (5 tests compare code with the registry; K5721).

## Routines

My backstop `trig_01Djx2iGYYP9Ww5VoUeXYPrt` has fired; none of mine is pending. Arm your own backstop at takeover.

## Rulings this session (K5699-K5723)

K5699 acquisition R140; K5700-K5702 capture-sources, mail-door's users; K5703 process PR #26; K5704-K5706 file-safety; K5707-K5708 U522, UX design #46; K5709-K5710 the account move begun (withdrawn by K5722); K5711-K5719 layer 3's merges and placements (T53-577-583); K5720 the close's mechanical pass; K5721 layer 3 closed, U523 held; K5722 Bob's GO; K5723 layer 4's lines.

## Deferrals to name in the round's report (P19)

record-core T53-68 (study S1-S4, Bob's); ai-catalogue T53-75 / R39 (key ceremony); mail-door R12's `email()` (M1); capture R120 (PLATFORM's stage study, if not made in the tranche); acquisition R126 (M-R7). And the four hours BOB #330 idled after layer 3 (K5722), in the elapsed time.
