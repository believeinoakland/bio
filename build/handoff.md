# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #332 (`session_018BhcedHXTmWvkcQG9t9wzP`, depth 1, parent ROOT #10 `session_01XHjMEPkzmkLycoWtxb4yn6`; Bob's **primary** account) for **BOB #333 on the same account**, 2026-10-28 ~18:55Z, at 44 % of its window (refresh.md). No step is half done; no procedure is running. **T53 round R1 is OPEN**: layers 1-4 closed (layer 4: a2af7e83bf); **layer 5 is open with 20 jobs, 16 merged; four are re-working a CHANGE** (below). Then layers 6 to 11 (their requirement lines are on the tranche), then the completion round (`build/plan/T53-completion.md`). Read whole: K5786 (layer 5's answers and placements), K5787 (Bob's responsiveness rulings, the new mechanics), K5763 (P20), K5760 (Bob's load directions), K5761, K5762.

## Bob's direction now

- **P20 is reworded (Bob, K5763: "I accept your latest P20 wording."):** "Work from evidence, read in full; never scan." P21 is folded in. In force in code (civicos-process PR #30): job reports need an `**Evidence**` section; lane HANDOFF entries dated from 2026-10-29 need `Evidence:`; steps for Bob only through `proc steps`; a PreToolUse refusal of a read that stops before the end of a reading-set document (Read with offset/limit; `head`, `tail`, `sed -n`, `cut -c` in the same pipeline). Read a reading-set file whole (`cat`), never cut.
- **Responsiveness (Bob, K5787):** the never-idle Stop guards are removed (PR #31). Long `proc` commands (`merge`, `layer close`, `job complete`, `tests`) run ONLY as background Bash tasks (`run_in_background: true`); the hook refuses them in the foreground; while one runs, `.git/civicos-running.json` makes every other writing `proc` command refuse, and the Stop hook lets your turn end (PR #32). **Never write to the bio checkout by hand while a procedure runs.** Workers (Agent) always in the background. Bob rejected a second working copy ("sounds expensive"). **Bob's open point: "we still need to address the laziness issue by some other means."** Evidence so far: PROCESS-HISTORY #1's report (civicos-process branch `study/process-history`, 58c0ce3, `study-process-history/REPORT.md`, read it whole): the old BOB re-armed a ~21-minute backstop at every wait and ended each turn naming its wait; merges then took ≤ ~51 s against ~2 min now. I run a 20-minute backstop. Next: measure where a merge's 2 minutes go (artifact regeneration of the seven bundles against the tests: time `proc merge`'s phases on the next merge), and if the regeneration dominates, regenerate only the artifacts a merge's files feed (BOB's by P17; certify by tests red on main). I offered Bob that each procedure's completion print its next act; he has not answered.
- **Queue merges in ONE background chain** (`for m in …; do node …/proc.mjs merge …; done`), never with `pgrep -f "proc.mjs merge"` waits: such a wait matches its own command line and hangs forever (it cost 25 minutes today).
- **Evidence (K5755, now P20):** state as fact only what you read or measured, with its source.
- **Load management (K5760, Bob's three directions verbatim, and his fourth on the reading chain's memory: "That sounds like something that needs to be fixed."):** PLATFORM #3 is prototyping (i) on `proto/levels-2-3-chain` (window sized to the piece, chain bound with rests); it will send figures with commands, whether pieces are collectable once the chain yields, and the line to word for extraction's and store-assembly's completion-round entries (the bound sits in pending-work, the window in reading-pipeline). Its load-management draft (`build/plan/beta/platform/load-management-draft.md`) carries (1)-(3); the queue's home is BOB's (packaging, K2008) after reading its evidence; the UX need goes to UX design #46 as needs.
- One round (K5567). Work found goes to its module's open job, else a not-started layer's START, else the completion round.

## Layer 5 now (`proc status`; each job's session is in the plan's Jobs line)

- **Re-working a CHANGE (each will message COMPLETE; merge it in the background at once):**
  - **money**: R39-R41 against local-facts' merged `teamLayer`/`factStatus`; `neighbours` with `at: null` answers a fact as in (from calculations' report); R42 per K5786.
  - **connections**: tests cite R77 (new, K5786) instead of T53-587; `test.todo` for R74-R76 (unbuilt, M-F1, K5761) so coverage names them.
  - **standards**: name R65 in a test or a `test.todo` (coverage reports it unnamed).
  - **registers**: complete with `build/modules.json` untouched (a new module enters with empty paths, K1185). **At its merge, in the merge's ruling, set its row to `"paths": ["bio-plane/src/registers/"], "tests": ["bio-plane/test/m/registers/"]`** (the format check fails if set before its files are on the tranche; I tried and reverted). If ownership refuses its own files with empty paths, it will send the refusal text: find the route in `proc merge`'s ownership code; never work around it.
- **Layer 5's close:** lower the English-in-tests baseline (`build/tests-english-baseline.json`) for every layer-5 module as K5759 did for layer 4 (`node …/checks/words.mjs . --baseline` for today's counts; remove a file at 0, lower one above 0, never raise; then the words check 0), with a `proc ruling`; coverage today fails only on connections R74-R77, registers (no tests on the tranche yet) and standards R65, all three being fixed above. Then `proc layer close --layer 5` (in the background), archive the 20 sessions with rows, move the block to `plan/archive/T53-R1-layer5-merged.md`, start layer 6 at once (models K3518: haiku only for truly test-only; sonnet otherwise).
- Reports already placed (K5786; read it): layer 6 run-rules T53-601, ai-runs T53-602; layer 11 op-declarations T53-603, op-grades T53-604, affordances T53-605/606, wizard-scripts T53-607, screens-settings T53-608, store-assembly T53-593 (K5761); completion round jurisdictions T53-609, extraction T53-610, progressions T53-611, reading-pipeline T53-595..600 and ocr-worker T53-594 (K5762).

## Owed to the UX design stream (K5681; channel `node …/tools/mail.mjs xinbox --as BOB --from UX-DESIGN`)

- **U525 (answer to my B572):** DEC-491 split onto its own commit, branch `claude/ux-dec491`, commit 466130598d (docs only: content's reviewed words; words 0, format 0 there). Merge it into the tranche (a merge commit; never rebase), regenerate the artifacts (setup-words rows first: run the manifest's regenerate/verify rows), run the words check, and in the same act add content's **14** reads entries in `docs/development/ux-substrate/screens/words-reads.json` (the 8 `content.extent.part_name.*`, `part_named`, `part_unnamed`, `content.part_kind.body`, `content.typed.checked`, `.unchecked`, `.anonymous_member`): BOB adds reads rows only for keys already in the stream's `words.json`, never wording (K5681). Then tell the stream (xpost and send_message to UX design #46 `session_018BhceeSwn6V6RdavfMqjcH`). DEC-490 (U523) stays held for layer 11's re-point (K5721). My Writer line on mail/BOB names #332: write yours (`xwriter`).
- Money's report: the design keys that still name `money_flow` go to the stream as a need (affordances' and wizard-scripts' code lines are placed, K5786).

## Lanes

- **PROCESS-HISTORY #1** `session_018BhcegpVcycdJPyBkTMphG` (sonnet): reported (above) and ended; archive it (no metrics row needed for a lane, as BOB-final rows are for BOBs).
- **PLATFORM #3** `session_018BhcefSgvGb4qHQgvYMz4M` (sonnet), on lane/platform: the chain prototype (above), then the controlled determination of N and the soak. It writes to the BOB on the plan's Status line.
- AI-DESIGN, CAPABILITIES, FILES, JOURNEYS, PLANNING spun down (K5710), READY. UX design #46 as above.

## The key ceremony (K5625, K5746, K5751, K5753)

Sitting 1 done: Bob's two public lines in K5751; signatures R58 is held in the completion round's entry T53-592. Sitting 2 (Bob signs the seed) when ai-catalogue's seed payload exists: steps written from `catalogue-keys.html`'s own labels, through `proc steps` (now merged, PR #30).

## T54

`build/plan/next.md` rebuilt for T54 (K5747): hard-reason entries only.

## Routines

My backstop (20 minutes, into my own session) stays armed until your TAKEN OVER arrives; I delete it then. Arm your own at takeover (20 minutes; K5787's evidence).

## Rulings this session (K5759-K5787, each from `proc ruling` or `proc merge`)

K5759 layer 4's records; K5760 Bob's load directions; K5761 layer 5's first answers (teamLayer, M-F1, T53-593); K5762 reading-pipeline's report placed; K5763 P20; K5764-K5785 layer 5's merges (written by `proc merge`); K5786 layer 5's answers and placements; K5787 responsiveness (PR #31, #32), the history study.

## Deferrals to name in the round's report (P19)

record-core T53-68 (study S1-S4, Bob's); ai-catalogue T53-75 / R39 (ceremony sitting 2); mail-door R12's `email()` (M1); capture R120 (the memory fix, if not made in the tranche); acquisition R126 (M-R7); connections T53-147 / R74-R76 (`named_in`, measure M-F1, K5761); entities R68 (federal offices data, jurisdictions R119/R120 wait on F4). Elapsed: BOB #330's four idle hours after layer 3 (K5722); 25 minutes lost to BOB #332's hanging merge queue (K5787).
