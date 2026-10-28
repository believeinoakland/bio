# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #330 (`session_018BhcedfM8dV8rPodwgBjD3`, depth 1, parent ROOT #10 `session_01XHjMEPkzmkLycoWtxb4yn6`; Bob's **primary** account) for **BOB #331 on Bob's next account**, 2026-10-28 ~09:20Z, at about 38 % of its window. **An account move** (`situations/account-move.md`; K5709): this account's weekly limit reads `seven_day` `allowed_warning` (resets 2026-10-31 11:00Z). No step is half done and **no job is live**. **T53 round R1 is OPEN** (the one build round, K5567): **layers 1, 2 and 3 are closed** (layer 3: d78afbef0b, its 10 sessions archived with rows, its block in `plan/archive/T53-R1-layer3-merged.md`). **Layer 4 is next**, then 5 to 11, then the completion round (`build/plan/T53-completion.md`). Read whole: K5699, K5705, K5709, K5715, K5720, K5721 (`build/rulings.md`), then `build/plan/current.md`'s Layer 4 block.

## Your takeover (on the new account)

1. `proc takeover --tranche T53 --name "BOB #331" …` owes a `TAKEN OVER` message to me: I am on another account and unreachable. Record it with `proc bob cleared --name "BOB #330" --session session_018BhcedfM8dV8rPodwgBjD3 --unanswered "another account"`; never archive me (sessions left on the old account get no `BOB-final` row, K4790). My backstop `trig_01Djx2iGYYP9Ww5VoUeXYPrt` (10:01Z) is one-shot and fires into me here; leave it.
2. Set the manifest's ROOT entry (the new ROOT, its account and session) and `build/channels.md`'s `BOB` row to the new account (K4790); run `node /home/user/civicos-process/tools/mail.mjs xwriter --as BOB --session <yours> --account <new>`.
3. **Restart the lanes** from their prompts (`create_session`, model as `LANES.md` §2; each recorded in §3): PLATFORM #3 from `lane/platform` @ 2af1b79a27 (first: the upload stage study below), AI-DESIGN #5 @ 0db6ea9e, CAPABILITIES #3 @ 3df02b4ad, FILES #2 @ 304b4e47, JOURNEYS #5 @ 0dc47f69, PLANNING #6 @ 12095659 (each prompt is `build/plan/<lane folder>/NEXT-SESSION-PROMPT.md` at that commit). A lane whose section 0 says it is idle with nothing to do (CAPABILITIES, FILES, PLANNING: "READY, the rest is PLANNING's"; JOURNEYS: idle until a re-walk) may wait until it has work: start it when it does, and say so in §3. TESTS-SWEEP #1's session was already inactive: its successor only if its section 0 names work.
4. **The UX design stream stays on Bob's primary account** (Bob's standing rule: every UX design session runs on the account that owns the screens page): UX design #46 `session_018BhceeSwn6V6RdavfMqjcH`, started by me (K5708). It reaches you only through the channel (`xcheck`, `xinbox --from UX-DESIGN`); you cannot ring it across accounts.
5. In this checkout: `git fetch -q --deepen=2000 origin tranche/T53` in the background; `npm ci --ignore-scripts --no-audit --no-fund` where `node_modules` is missing (`site/`, `reader-container/`, `bio-plane/src/journey-check/` were missing here). A worker never runs in `/home/user/bio` (its own `git worktree add --detach`).

## Bob's direction now

- **One round, R1** (K5567). Work found goes to its module's open job, else a not-started layer's START, else the completion round (`build/plan/T53-completion.md`, which this tranche now keeps; `proc round open` from it once layer 11 closes).
- **BOB adds a module's reads row** in `words-reads.json` for a key already in `words.json` (K5681). Used for file-safety's `refusal.BYTES_CHANGED` (K5707).
- **The AI catalogue key ceremony waits for Bob** ("We can do the key ceremony when I get back."): route K5625, page `bio-plane/scripts/catalogue-keys.html` (SHA-256 87f1993cb4e726ecaed5d7101b05ef8ad018fe55cbea17496421e9c89738fcf5), steps in `build/plan/key-ceremony.md`. When Bob is back: one rendered page with the download link, the SHA-256 and sitting 1's plain steps.
- Questions page https://claude.ai/artifact/SrK7xHyWMbW8TJntxkKzkv (owned on the primary account; republish from the new account only if Bob can open it there, else a new page): **none open**.

## Bob's acts owed on the new account (name each once, in plain steps)

- **PLATFORM #3 needs a new reset link for `plat-s1-admin`** (PLATFORM #2's credentials stayed in its scratchpad and do not transfer).
- AI-DESIGN #4 recorded a capture finding Bob raised in its session (robots.txt never read; the renamed Civicsmith agent admitted by oaklandca.gov's Akamai, a browser user agent refused) and asked him whether to relay it to BOB; it is in `build/plan/lane-ai-design/HANDOFF.md` section 0. Act on it only if Bob says so.

## Before layer 4's START (BOB writes these lines, just before `proc layer start`, K5377)

- Layer 4: content R63-R64 from `build/plan/beta/planning/lines-A8-typed-page.md` (T53-529). Check `origin/bob/T53-req-l2-3` and the planning drafts for any other layer-4 lines; apply three-way (`git diff <merge-base> <branch> -- <files> | git apply -3`).
- Layer 5: events, confirm N1259-c R38's keys of `followedRegister` (T53-530). Layer 6: reading-guides' line for jurisdictions R126 (T53-531); **capture-requests T53-209's lines** (K5574, K5575: the member's file matched to the waiting request and recorded as brought from that address; the Queue item; recognition and the per-host count are acquisition R140's, met, so capture-requests calls it). Layer 9: filing-templates R15, R35 reworded to cite jurisdictions R126 (T53-532). Layer 11: plane T53-546; queue-producers' and screens-intake's K5575 lines; T53-563 to T53-569 (mail-door's users), T53-575 to T53-579.
- New modules in later layers: set `paths`/`tests` in `modules.json` at their START by a text edit of the one line (never re-serialise it). Users' `uses` edges to mail-door enter at their STARTs (K5702).
- Models (K3518): haiku only where an entry is truly test-only with every key already in the words; sonnet otherwise; the default for a new module.
- Start with `get_session`'s `rate_limit_info.status` passed to `proc layer start --usage` (K5323).

## Recurring job faults (now fixed in civicos-process 92cb279, K5703)

- A job that writes "WAITING: complete …" after COMPLETE is refused by `proc merge`: tell it to run `proc job complete` again (ACQUISITION did it again today on an older clone). JOB.md now says COMPLETE is an end state.
- The push hook now strips redirections (K5694's fault fixed); `proc ruling --files` takes a **comma-separated** list and stages deletions; `proc job route` numbers a successor after an archived job.
- `tests-english-baseline.json` is outside every job's ownership: at each merge BOB removes the module's converted files (run the words check after; never raise a count).

## Waiting on a measurement (P19)

- **capture R120 / T53-108** (the Add door under three uploaders): PLATFORM #3 runs the upload stage study first. Its branch `proto/levels-2-3-stages` @ d9abfdaa (bundle sha256 0ea6029a408f270cbe33a06e06eeeccc48fe91e5b1e152b6c48c05ef3b0db8fc, base 03a5c65e) is checked; **you deploy it** when PLATFORM #3 says plat-s1 is quiet: from `bio-plane/` of that branch, `CONFIRM_PLAT_S1_PLANE_ONLY=yes node scripts/deploy-plane-only.mjs plat-s1 dist/bio-plane.bundled.mjs --set-var PROTO_STAGES=1` (account 20b5…7f72 only; K5120). Its figures go to the completion round's capture entry (capture's job is closed).
- mail-door R12's `email()` waits on M1 (K5692 (3)). acquisition R126 waits on M-R7's register rows (T53-581).

## Lanes and the design stream

- UX-DESIGN: merged through U522 (K5707, DEC-489). **U523 (DEC-490, 163462971b: B570's 11 retired AI acts re-pointed) is held: merge it with or after layer 11's re-point** (5 tests compare code with the registry; K5721). Nothing else owed.
- Every lane folder is merged into the tranche at its spin-down commit (K5710).

## Rulings this session (K5699-K5721)

K5699 capture's T53-102/105 placed, acquisition R140; K5700-K5701 capture-sources merged; K5702 mail-door's users T53-563-569; K5703 process PR #26; K5704-K5706 file-safety merged twice, ranged grading, T53-570-576, `T53-completion.md` begun; K5707 U522 and file-safety's reads; K5708 UX design #46; K5709-K5710 the account move, lanes spun down; K5711-K5718 acquisition, capture (twice), doorbell, mail-door, sources merged; K5714-K5715 baselines and findings placed (T53-577-583); K5719 layer 3's merges; K5720 the mechanical pass at the close; K5721 layer 3 closed, U523 held.

## Deferrals to name in the round's report (P19)

record-core T53-68 (study S1-S4, Bob's decision); ai-catalogue T53-75 / R39 (key ceremony); mail-door R12's `email()` (M1); capture R120 (PLATFORM's stage study, if not made in the tranche); acquisition R126 (M-R7).
