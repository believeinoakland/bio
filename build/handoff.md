# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #233 (`session_01UmKuN9ZCKxvQsJ1CW58ahC`, depth 1, parent ROOT #8 `session_01R3hvN64bYHG3vPQmYmaeLR`, **secondary** account), 2026-10-20 ~21:55 UTC, past 40% of its window. **T51 is OPEN** on `tranche/T51`, its fix round's wave 2 running on this account. Read `build/rulings-active.md` whole, then **K4221–K4235** whole (the last lines of `build/rulings.md`), then `build/plan/fix-round-T51.md` (its §4 table; STARTs in `build/plan/starts-T51-FR/`).

## How the round runs (Bob's, K4215, K4219)

- At most **20 job sessions at once**; **archive each job's session at its merge** (its row in `build/metrics/T51.csv` from `archive_session`'s usage and its record's `Size` line), and fill the freed slot.
- A merge runs the **ownership check only**; the one accepted finding is the job's own `build/requirements/<module>.md` (K4210). Then strike the met `*(not yet met: T51)*` marks; where a job's ownership check refused its requirement edit, BOB writes the line from the record (done for capture R73, action-clocks R2, wizard-scripts R46).
- Merge helper (recreate in the scratchpad): fetch; `git checkout tranche/T51`; `git merge --ff-only origin/tranche/T51`; `node checks/ownership.mjs <product> <m> origin/tranche/T51 origin/job/T51/<m>`; `git merge --no-ff origin/job/T51/<m>`; push (on a reject: fetch and **merge**, never `pull --rebase`). Never post mail while a merge commit is unpushed.
- A restart or re-open: merge the tranche into the job branch in a scratch worktree (`git worktree add --detach`, merge, plain push to `refs/heads/job/T51/<m>`), post the CHANGE first, then `create_session` titled `<MODULE> #<k>` with the fixed prompt, then `mail addjob`.
- After a batch of merges run `node checks/architecture.mjs <product>` over the whole product (K4226 found two cross-order imports that way); it reads 0 at K4232.

## Running (17 at 21:55 UTC; each record and mailbox is its state)

screens-intake #10, screens-settings #10, screens-action #7 (J7 COMPLETE unread), screens-publish #9, screens-daily #11 (merges after queue #29), plane #44 (B14: build the `acquiretimings` holder), op-grades #18 (B18–B22), op-declarations #29 (J14 unread: B14 citation in `register-owners`, B15 `standardinforce`), interface-shell #10 (COMPLETE unread: `place`'s `projectKey`), link-sweep #5 (COMPLETE unread: `needs`), control-plane #41 (B12 `casedetailspublic` route, B13 timings read), wizard-scripts #18 (COMPLETE unread: `wizardrevise` adopt), contradiction #12 (COMPLETE: founder's member id in its gate), queue #29, installer #22 (J14 unread), capture #40 (`acquireOp` sends `trace`). The plane's start needs op-grades #18 and link-sweep #5 merged (K4230).

## Next, in order

1. Act on the mailboxes (`mail check`; the primary-account sessions it still lists from earlier waves are not running: ignore them; `screens-inquiry` shows SCREENS-INQUIRY #14 of the primary account: it was never restarted here).
2. Start **screens-inquiry #15** (sonnet) once **screens-intake** has merged (it imports its C55 outcome drawing; its other owners are merged). Its mailbox carries many CHANGEs; add one naming every owner change since (citation's `needs`, case-import's ops, provenance, the B419/B423 words to expect).
3. When UX-DESIGN answers **B419–B423** (words and drawings), send each running screen job its keys by CHANGE; when **B421** lands, a screens-wizards job builds the no-subject cards for `action`, `matter`, `due-date` (K4231).
4. Then the round's second pass (plan §7): the mark and the asking (K4199; interface-shell's R107); the words check's two arms on the process repository's branch `prep/words-arms-K4208` @ 294a8e2 (K4216): land it on the process repository's `main` only once no job runs, then one mechanical pass (§5.10); the hand-row deletion (K4168) after the redeploy, from `build/plan/draft-handrows-T51.md` (rerun its script first; K4223); bundler's split (K2513); promotion's row-census stamp last (K4205). Then regenerate every artifact (manifest §14; `rows.mjs` was regenerated at K4229 and is stale again), one check pass and the whole suite, the redeploy of biosmoke8 (Bob approves each deploy act in the refused session, K4177), the live re-reads (FR-06 `POST /mirror`, the 27 files; FR-43 part 2, acquisition's timings; pdf-pixels' real floor; L12 confirmed live; the owners' batch forms only where the live `facts.ms` shows them dear, K4233), the targeted re-walk, the alpha cut, T51's close (§5.7).

## Accepted reds, by name, until the act named

promotion `row-census` (the round's stamp, K4205); op-grades' `testcopy` findings (OP-GRADES #18); strength's one words finding (UX-DESIGN B418); screens-entry R10 and plane R24 (UX-DESIGN B417); ocr-worker R19 and the other stale generated artifacts (the round's regeneration); screens-investigate R51 (op-declarations #29); screens-wizards' two library tests (wizard-scripts #18); the plane's 11 start reds (op-grades #18, link-sweep #5, K4230); every screen test that needs a B419–B423 row (until it lands).

## Open with Bob

- None. His secondary-account meter read 5 % at 21:21 UTC, two hours after its weekly reset (K4224).

## Open for BOB (not Bob's)

- wizard-scripts' `wizards` declares `state` though its arm reads it from the query (K4230): check at the second pass whether the guard or the door needs it changed.
