# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #235 (`session_01A9T6QW1JsRunRXeVhrzF8N`, depth 1, parent ROOT #8 `session_01R3hvN64bYHG3vPQmYmaeLR`, **secondary** account), 2026-10-20 ~23:40 UTC, near 40 % of its window. **T51 is OPEN** on `tranche/T51`, its fix round's wave 2 running. Read `build/rulings-active.md` whole, then **K4243–K4255** whole (the last lines of `build/rulings.md`), then `build/plan/fix-round-T51.md` (§4 table and §7; STARTs and CHANGE bodies in `build/plan/starts-T51-FR/`).

## How the round runs (Bob's, K4215, K4219)

- At most 20 job sessions at once; archive each job's session at its merge (row in `build/metrics/T51.csv` from `archive_session`'s usage and the record's `Size` line) and fill the slot.
- A merge runs the ownership check only; the one accepted finding is the job's own `build/requirements/<module>.md` (K4210). Then strike met `*(not yet met: T51)*` marks; write any requirement line a job left in its record (append to the id's line, never move a header: the format check fails).
- Merge helper (recreate in the scratchpad): check node_modules (K4113); fetch; `git checkout tranche/T51`; `git merge --ff-only origin/tranche/T51`; `node checks/ownership.mjs . <m> origin/tranche/T51 origin/job/T51/<m>`; `git merge --no-ff origin/job/T51/<m>`; push. After merges run `node checks/architecture.mjs .` (0 at K4255).
- A re-open: a merged job's branch is fast-forwarded (`git push origin origin/tranche/T51:refs/heads/job/T51/<m>`), the CHANGE body written to `build/plan/starts-T51-FR/<m>-<n>.txt` and posted, `create_session` titled `<MODULE> #<k>` with the fixed prompt, `mail addjob`.
- **The design stream now runs on this account** (UX design #36, `session_01N188yDWfxJHtvptW5hirUW`, started by BOB #235 at Bob's request, K4248): ring it after each channel post (one-time routine into its session); it rings BOB. Its MERGE commits are merged into the tranche at once and `rows.mjs` regenerated (`node bio-plane/src/setup-words/build.mjs`, then `--check`); the design PR reaches `main` only at T51's close (§5.7 (1)). Last merged: 09fbb247eb (DEC-389, U424). Registry account labels for BOB and UX-DESIGN change to secondary at T51's close (K4251).

## Running (at 23:40 UTC; each record and mailbox is its state)

OP-DECLARATIONS #31 (B18: `ACT_HELP_ABSENT` drops affordances' 69; R21 drops `strengthbarset`), OP-GRADES #21 (B27: after op-declarations merges, tell it to merge the tranche; R17's count read from the tables; R42/R46 after registration), PLANE #45 (B16: R24, R5, R68, R71; then control-plane's e2e), WIZARD-SCRIPTS #19 (B15, B16: re-take the registry, front doors, library at **09fbb247eb**), SCREENS-ACTION #9 (B15, B16, B17: B424 whole; release under `filingapprove`; reply tokens; sent-entry stage keys). `mail check` lines for QUEUE-PRODUCERS, STORE-DOOR and other archived or primary-account sessions are stale: ignore.

## Next, in order

1. Act on the mailboxes (`mail check`).
2. When **WIZARD-SCRIPTS #19** merges: re-open SCREENS-INVESTIGATE (add `linewithdraw` on person, B423; R50 line; R10 green), SCREENS-PUBLISH (docket's `writinghelp` on the summary, B420 2; R10 green), SCREENS-SETTINGS (runtime's unit words `screen.updates.health.runtime.unit.{ms,bytes}`, DEC-389), SCREENS-ACTION if the registry changed start-send. Send each screen any other registry difference the job reports.
3. When **OP-DECLARATIONS #31** merges, tell OP-GRADES #21 to merge the tranche. When **PLANE #45** merges, run `node --test bio-plane/test/m/plane/` and control-plane's suite (its 12 reds were the start-up refusal and affordances' R2/R41, now expected green).
4. **screens-inquiry's open items (J11, J12; K4255):** HANDOFF to UX-DESIGN the word gaps (`PENDING_WORDS` 23 in `objective.mjs`, `GAP_WORDS` 31 in `contradiction.mjs`, the document/question/project gaps listed in J11), then a screens-inquiry job draws them; R110 (C50: `citeimported`/`withdrawimported` on the question screen) is buildable now (the design drew it, K4248): CHANGE it with the rows; R119 (the scanner line and safe view) moves to screens-intake's `open-file.mjs` (a screens-intake job: draw `screen.open-file.tool.clamav`, `screen.open-file.result.*`, no engine/version for an unscanned file); its REPORTs (reads of typings, declared origins, standing route; `contradictioncandidates` who/when; `contradictionresolve` NO_CLAIM on a fresh question; `narrowcandidates` and `allocid` undeclared; `rerunread` titles; interface-shell REF_SCREENS for `dash-action` and `objective`; `versionnotice`'s mark; the objective reads) are each confirmed and placed (P9).
5. Held for the second pass: interface-shell's reason box per press (K4254); the mark of `sweeps` and `groupdescriptiondraft`'s key (HANDOFF B432 to the design). Then the round's second pass (plan §7): the mark and the asking (K4199); the words check's two arms on the process repository's branch `prep/words-arms-K4208` @ 294a8e2 (land on its `main` only once no job runs, then one mechanical pass, §5.10) with the held ids' `test.todo`s (K4236: agent-harness R17, agent-runner R37 R38 R40, installer-steps R26 R31, journey-check R19); the hand-row deletion (K4168; it also removes op-grades' 113 `RUNG_ABSENT` `is` rows of declared ops, K4252) after the redeploy (`build/plan/draft-handrows-T51.md`, rerun its script first); promotion's row-census stamp last (K4205). Then regenerate every artifact (manifest §14; `rows.mjs` is current at 742a6c8d1c, `newgroup/dist` and the bundles are stale), one check pass and the whole suite, the redeploy of biosmoke8 (Bob approves each deploy act in the refused session, K4177), the live re-reads (FR-06 `POST /mirror`, the 27 files; FR-43 part 2 through `acquiretimings`, plane R73; pdf-pixels' floor; L12 live; installer's upload peak, K4237; the owners' batch forms only where `facts.ms` shows them dear, K4233), the targeted re-walk, the alpha cut, T51's close (§5.7).

## Accepted reds, by name, until the act named

op-grades R17, R42, R46 (OP-GRADES #21); the plane's four (R24, R5, R68, R71: PLANE #45); screens-investigate R10 and screens-publish R10 (docket) (the registry re-take, then their jobs); promotion `row-census` (the round's stamp, K4205); ocr-worker R19 and every stale generated artifact (the round's regeneration); coverage's 7 held ids (K4236, the second pass); screens-inquiry R110 and R119 (step 4).

## Open with Bob

- None. UX design #35 is still open on Bob's primary account; he may close it.

## Open for BOB (not Bob's)

- wizard-scripts' `wizards` declares `state` though its arm reads it from the query (K4230): check at the second pass.
