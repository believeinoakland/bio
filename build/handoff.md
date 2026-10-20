# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #232 (`session_01GrgSmw5dmSDF4acRyUdr6r`, depth 1, parent ROOT #8 `session_01R3hvN64bYHG3vPQmYmaeLR`, **secondary** account), 2026-10-20 ~21:00 UTC, past 40% of its window. **T51 is OPEN** on `tranche/T51`, its fix round's wave 2 running on this account. Read `build/rulings-active.md` whole, then **K4213–K4219** whole (the last lines of `build/rulings.md`), then `build/plan/fix-round-T51.md` (its §4 table now has FR-64 to FR-68; STARTs in `build/plan/starts-T51-FR/`).

## How the round runs now (Bob's, K4215, K4219)

- At most **20 job sessions at once**; **archive each job's session at its merge** (write its row in `build/metrics/T51.csv` from `archive_session`'s usage, with its record's `Size` line), and fill the freed slot with the next job in the order below.
- A merge runs the **ownership check only** (the module suites run once, in the round's check pass); the one accepted ownership finding is the job's own `build/requirements/<module>.md` (K4210). Then strike the `*(not yet met: T51)*` marks of the ids its record says are met; a job that put its lines only in its record has them written by BOB from it.
- Helper: `/tmp/.../scratchpad/merge.sh` is gone with this container; its steps: fetch; `git merge origin/tranche/T51`; ownership against `origin/tranche/T51` and the job branch; `git merge --no-ff` the job branch; push (on a reject: fetch and **merge**, never `pull --rebase` with an unpushed merge commit). **Never post mail (which may rebase) while a merge commit is unpushed.**
- Before each restart, merge the tranche into the job branch (a worktree, plain push).

## Running (20 at 21:00 UTC; each record and mailbox is its state)

credentials #23 (waits only on nothing now: R76 merged, B7 told it), case-inputs #7, review #19 (B8 CHANGE: `DRAFT_FIELDS`), acquisition #21 (B5: part 1 completes now, part 2 after the redeploy), control-plane #40 (B9: `action-clocks` edge added; case-import's routes; acquisition's stage times), interface-shell #9 (B20, B21), tasks #16, queue-producers #19, link-sweep #4, wizard-scripts #16, action-plans #16, run-productions #14, ratification #29 (B5 `containerResolver`), explore #9, action-holds #6, store-door #13, membership #44 (FR-66), ocr-worker #8 (FR-67), op-declarations #28 (FR-68), queue #28.

## Next, in order

1. Act on the mailboxes (`mail check`; the archived primary-account sessions still listed QUIET or RING are not running: ignore; `investigation` reads NEEDS BOB but is merged, K4214).
2. As slots free, start: **op-grades #18** (haiku; restart only after review, wizard-scripts and control-plane have merged, and regenerate `rows.mjs` first: its B18 lists every copy to convert), **screens-entry #7, screens-wizards #5, screens-settings #10, screens-intake #10, screens-daily #11, screens-inquiry #15, screens-investigate #7, screens-publish #8, screens-action #7** (sonnet; each after the owners its START names have merged; their mailboxes carry many CHANGEs), **plane #44** (after capture-sources, investigation, case-import, citation: merged; its B8, B9), **installer-steps #5** then **installer #22**, **strength** is merged (no restart). FR-41 `text-chain` has nothing (not restarted).
3. Then the round's second pass (plan §7): the mark and the asking (K4199; interface-shell's R107); the words check's two arms, prepared on the process repository's branch `prep/words-arms-K4208` @ 294a8e2 (K4216: 865 findings, list in `build/plan/pass-T51/words-arms-findings.txt`): land it on the process repository's `main` only once no job runs, then one mechanical pass (§5.10); the hand-row deletion (K4168, after the redeploy); bundler's split (K2513); promotion's row-census stamp last (K4205: its R50 red until then). Then regenerate every artifact (manifest §14), one check pass and the whole suite, the redeploy of biosmoke8 (Bob approves each deploy act in the refused session, K4177), the live re-reads FR-06 (`POST /mirror`, the 27 files), FR-43 part 2 (acquisition's timings) and pdf-pixels' real floor, the targeted re-walk, the alpha cut, T51's close (§5.7).

## Accepted reds, by name, until the act named

promotion `row-census` (the round's stamp, K4205); interface-shell's guard findings (INTERFACE-SHELL #9); op-grades' `testcopy` findings (OP-GRADES #18); strength's one words finding (UX-DESIGN B418); screens-entry R10 and plane R24 (UX-DESIGN B417); the stale generated artifacts (the round's regeneration).

## Open with Bob

- His weekly meter reading on the secondary account (asked; nothing waits on it).

## Open for BOB (not Bob's)

- Whether `case-disclosures` R4 must read `provenance.authorityOf` (provenance J5): confirm against C62's draft (`draft-req-T51-K4169.md`) and place an entry if so.
