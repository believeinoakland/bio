# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #234 (`session_01WxgYcvNCcpY6YnYLep8ezr`, depth 1, parent ROOT #8 `session_01R3hvN64bYHG3vPQmYmaeLR`, **secondary** account), 2026-10-20 ~22:35 UTC, near 40% of its window. **T51 is OPEN** on `tranche/T51`, its fix round's wave 2 running on this account. Read `build/rulings-active.md` whole, then **K4236–K4241** whole (the last lines of `build/rulings.md`), then `build/plan/fix-round-T51.md` (its §4 table and §7; STARTs and CHANGE bodies in `build/plan/starts-T51-FR/`).

## How the round runs (Bob's, K4215, K4219)

- At most **20 job sessions at once**; **archive each job's session at its merge** (its row in `build/metrics/T51.csv` from `archive_session`'s usage and its record's `Size` line), and fill the freed slot.
- A merge runs the **ownership check only**; the one accepted finding is the job's own `build/requirements/<module>.md` (K4210). Then strike the met `*(not yet met: T51)*` marks; where a job could not write its requirement line, BOB writes it from the record (append to the id's line; never move a section header: the format check fails).
- Merge helper (recreate in the scratchpad): check node_modules (K4113); fetch; `git checkout tranche/T51`; `git merge --ff-only origin/tranche/T51`; `node checks/ownership.mjs . <m> origin/tranche/T51 origin/job/T51/<m>`; `git merge --no-ff origin/job/T51/<m>`; push.
- A restart or re-open: a merged job's branch is fast-forwarded to the tranche (`git push origin origin/tranche/T51:refs/heads/job/T51/<m>`); an unmerged one is merged up in a scratch worktree (`git worktree add --detach`, `git -C <wt> merge`, then the push **as its own command**: a push combined with `rm -rf` in one command was refused). Post the CHANGE (body in `build/plan/starts-T51-FR/<m>-2.txt`), `create_session` titled `<MODULE> #<k>` with the fixed prompt, `mail addjob`.
- After a batch of merges run `node checks/architecture.mjs .` over the whole product (0 at K4236).

## Running (16 at 22:35 UTC; each record and mailbox is its state)

plane #44 (COMPLETE J11, B15 done: **merge after OP-GRADES #18 merges**, then write its R73 line), op-grades #18 (B18–B22, not read since B17: rung 22:33), op-declarations #30 (B16 register every owner + `standardinforce`; B17 `export` into the founder's set), screens-settings #10 (B18–B21: R12 merged, credentials merged, bias readings), screens-publish #9 (B14: build R68 now), screens-action #8 (B14: filings merged, draw exhibits after reload), screens-daily #12 (R75, R68, R69, R79), queue #30 (`proposedispose` set arm), screens-inquiry #15 (FR-28, the largest; started 22:29), test-support #8 (R17 `registerDeclared`), observation-log #16 (`leads` read), case-authoring #33 (`not_co_attested` detail). Lists from earlier waves that `mail check` still shows (REVIEW #19, RUN-PRODUCTIONS #14, RATIFICATION #29, SCREENS-INVESTIGATE #7, and the long-quiet ones) are primary-account or merged sessions: ignore them.

## Next, in order

1. Act on the mailboxes (`mail check`).
2. When **TEST-SUPPORT #8** merges: re-open interface-shell (its t50, declared and page tests call `registerDeclared` with both registrations before composing the real SCREENS; and a `failed` hook on an act so a refused capture clears its working line, screens-intake J7 (5)) and control-plane (t46-app the same, haiku); tell screens-publish and screens-inquiry to use it in place of their own `register.mjs`.
3. When **OBSERVATION-LOG #16** merges: a screens-intake job draws "Your leads" from `leads`. When **CASE-AUTHORING #33** merges: CHANGE screens-publish (the ceremony's `conf.intro2` {finding}). When **QUEUE #30** merges: CHANGE screens-daily (queue-states R58). When **OP-DECLARATIONS #30** merges: CHANGE screens-settings (`export`) and screens-investigate's R51 red clears.
4. When UX-DESIGN answers **B416–B428**, send each screen job (running, or a new one) its keys by CHANGE; when **B421** lands, a screens-wizards job builds the no-subject cards (K4231).
5. Then the round's second pass (plan §7): the mark and the asking (K4199); the words check's two arms on the process repository's branch `prep/words-arms-K4208` @ 294a8e2 (land on its `main` only once no job runs, then one mechanical pass, §5.10) with the held ids' `test.todo`s (K4236: agent-harness R17, agent-runner R37 R38 R40, installer-steps R26 R31, journey-check R19); the hand-row deletion (K4168) after the redeploy (`build/plan/draft-handrows-T51.md`, rerun its script first); promotion's row-census stamp last (K4205). Then regenerate every artifact (manifest §14; `rows.mjs` and `newgroup/dist` are stale), one check pass and the whole suite, the redeploy of biosmoke8 (Bob approves each deploy act in the refused session, K4177), the live re-reads (FR-06 `POST /mirror`, the 27 files; FR-43 part 2, acquisition's timings, now through `acquiretimings`; pdf-pixels' floor; L12 live; installer's upload peak, K4237; the owners' batch forms only where `facts.ms` shows them dear, K4233), the targeted re-walk, the alpha cut, T51's close (§5.7).

## Accepted reds, by name, until the act named

promotion `row-census` (the round's stamp, K4205); op-grades' `testcopy` findings (OP-GRADES #18); strength's one words finding (UX-DESIGN B418); screens-entry R10 and plane R24 (B417); ocr-worker R19 and every stale generated artifact (the round's regeneration); screens-investigate R51 (op-declarations #30); the plane's 11 start reds (OP-GRADES #18); control-plane t47-e2e R81 (cleared by screens-daily #11's R81, already on its branch; confirm at its merge); screens-intake's 28 (rows of B419/B423/B428; the `writinghelp` and `SESSION_OPS` causes cleared by K4230 and K4237); screens-publish's `docketfile` (B420) and `imported` `writinghelp` (B12 (5)); every screen test that needs a B416–B428 row (until it lands); coverage's 7 held ids (K4236, the second pass).

## Open with Bob

- **UX-DESIGN has read nothing past B415** (its last entry, U419, at 09:17 UTC; B416–B428 unread), and sessions on Bob's primary account cannot be rung from here. Only Bob can ask it to check the channel (§13.1 (3d)); many screen reds wait on its answers.
- His secondary-account meter read 5 % at 21:21 UTC (K4224).

## Open for BOB (not Bob's)

- wizard-scripts' `wizards` declares `state` though its arm reads it from the query (K4230): check at the second pass.
- plane J11: the store strips a caller's `x-civicsmith-trace` because store-door's handed list lacks it; the plane sets it in-process. Decide at the plane's merge whether store-door should hand it on.
