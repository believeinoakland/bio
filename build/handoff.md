# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #292 (`session_01WYkBtHgN6TsgvhAaeU4aGN`, depth 1, parent ROOT #9 `session_01GndWUi5ubGmXCVVnFqtJAi`, third account) for BOB #293, 2026-10-25 ~13:15 UTC, at about 40 % context. **T51 is OPEN** on `tranche/T51`; **fix round 10 is running** (opened K5065). Read rulings K5097 to the last line of `build/rulings.md` whole, `build/plan/fix-round-10-T51.md` whole (§3, follow-ups 7-35, is the owed list) and `build/plan/fix-round-10-waves.md` whole.

## Open with Bob

- **SIGNIN-DOOR #3** (`session_01GU1iv4VtLeuTsVtVTUKjWm`): its push of its own branch `job/T51/signin-door` was refused by its permission check (§16, K5069); never retried or worked around. Bob has been told, each turn, to type in that session: `Approved: push job/T51/signin-door to origin, then post your COMPLETE.` It blocks plane's coupled merge and `store-assembly` (the critical path: store-request, interface-shell, the screens' op tables, batch 7 and control-plane's Wave B all wait on it).

## Done this session (K5097-K5103)

- Took over (K5097). Merged (each: ownership against the merge base, fixtures and architecture on the job branch by the ABSOLUTE root, markers read, architecture over the tree after the merge, words over the module, strikes, ruling, cursor, archive, metrics row): screens-action, ai-runs, inquiry-grammar, ratification, intent, publication, op-grades, following, public-read, connections, observation-log, question-explorer, agent-steps, action-records, action-holds, action-replies, filings, instance-setup, tasks, workbooks, monitoring, citation, scheduler.
- `uses` edges (K5069 rule): agent-steps +provenance; scheduler +acquisition; queue +provenance +money-checks +people +docket +monitoring; installer-steps +credentials.
- Requirements: op-grades R53 worded (K5097); citation R21's C-2.8 arm retired and R21 struck (K5101, K5103).
- SUITE #2's whole-suite report (`build/plan/suite-T51-r9.md`) re-diagnosed on the tip (`suite-T51-r9-diagnosis.md`) and every red placed (K5101; follow-ups 30-34): bundler's stale `deploybindings` expectation fixed by BOB; CHANGEs B4 (machinery-producers) and B33 (installer); batch 7 STARTs amended (screens-settings, screens-publish, journey-check); follow-ups 30 (provenance then tasks), 31 (capture-sources timing red), 32 (promotion's stamp), 33 (the §5.10 pass rewords the 24 "group" rows). SUITE #2 archived.

## Running (12 job sessions; addresses in `build/plan/current.md`'s Jobs line)

- SIGNIN-DOOR #3 (NEEDS BOB), PLANE #61 (COMPLETE J62, held for the coupled merge), BASIS-VERSIONS #22 (live, long turn on R58; QUIET by the tool but its session is RUNNING: check `get_session` before any restart, K506), MACHINERY-PRODUCERS #8 (CHANGE B4), QUEUE-PRODUCERS #25, NOTICE-PRODUCERS #18, QUEUE #36 (ANSWER B20), INSTALLER-STEPS #12 (ANSWER B28), INSTALLER #28 (CHANGE B33), PROVENANCE #30 (follow-up 30), CAPTURE-SOURCES #19 (follow-up 31).
- Seven slots free (the twentieth held for `store-assembly`). Batch 6 left: interface-shell (after `store-request`). Batch 5 left: interface-assets (UX-DESIGN's scroll rule). Batch 7 (screens-wizards, screens-settings, screens-investigate, screens-publish, journey-check) after interface-shell. STARTs are in `build/plan/starts-T51-F10/`: fill `#<n>` with the next number (grep `build/` for `<MODULE> #`) and replace `BOB #289 is depth 1` with your own name. A follow-up START: copy `monitoring-2.txt`'s header (haiku, test files only) or `capture-sources-2.txt` (sonnet).
- Follow-ups owed (fix-round-10 §3): 7 conformance (after basis-versions; `conformance-2.txt` exists), 8 control-plane's Wave B, 9 inquiry R85's strike (after basis-versions), 12 plane (after the coupled merge), 13 + 28 extraction, 15 test-support and 33 (the §5.10 pass), 23 the `transcribe-answer` markers to plane, 30's second half (tasks re-points after PROVENANCE #30 merges), 32 promotion's stamp (last), 35 screens-inquiry (with its op-table CHANGE), and QUEUE #36's `noticed.test.mjs:292` providers (duties, answers, inquiry) once it names them. Each a new session (K4219) when its provider has merged.
- Lanes nothing past H43, A41, W4, P26; channel nothing past U471 (B517 unread by UX-DESIGN).
- My timers: backstop `trig_01132TJgi6WbC17Hj11kSTMC` (13:28Z), WATCH #292 `trig_01DuYXMyEKvC37FdHqdKDDnp` (14:10Z): delete both at takeover.

## Tools

- The mail tool: a local merge of civicos-process `main` and `prep/jobbranch-K4385` (`git fetch --depth=1000 origin main +prep/jobbranch-K4385:refs/remotes/origin/prep/jobbranch-K4385`, `git worktree add --detach <dir> origin/main`, merge, take `--theirs` on `tools/test/mail.test.mjs`, commit). Run from the product with `--product /home/user/bio --tranche T51`. `addjob --name` takes `"<M> #k"` with a space.
- Pre-merge, per module (a script is quickest): `git fetch origin job/T51/<m> tranche/T51`; `B=$(git merge-base origin/tranche/T51 origin/job/T51/<m>)`; `node checks/ownership.mjs /home/user/bio <m> $B origin/job/T51/<m>`; a `git worktree add --detach` of the job branch, then `node checks/fixtures.mjs <ABSOLUTE worktree> <m>` and `node checks/architecture.mjs <worktree> <m>`; `git diff $B origin/job/T51/<m> | grep -E '^\+ *//.*fixtures-(own|generic|contract|run)'` (read each marker). After the merges: `checks/architecture.mjs /home/user/bio`, `checks/words.mjs /home/user/bio <m>` at 0, `checks/coverage.mjs` for any requirement written. Merge `--no-ff`; strike the met marks. A `uses` edge: edit the module's line in `modules.json`, then `node bio-plane/src/member-roster/order-build.mjs --check` and `checks/format.mjs`.
- `archive_session` answers carry the usage for the metrics row; the `Size` line is in the job record (take the last one).

## Then, in order

1. Read every COMPLETE and merge; keep every slot full (at most 20), providers first (K4215); start follow-ups as their providers merge.
2. When SIGNIN-DOOR pushes: merge it with plane (coupled; delete signin-door's `subscriptionsignin` row, lines 30-32 of `control-plane/owner-ops.mjs`, in the same act, K5052 (4)); then start `store-assembly`, then `store-request` after it, then interface-shell and batch 7 and the screens' op-table CHANGEs; plane's CHANGE for follow-ups 12 and 23.
3. After batches 1-7: the §5.10 pass (the eleven modules of the waves' §4, with follow-ups 15, 23 and 33 and entry 6); the fixtures check zero for every module, each remaining line accepted by name; then promotion's stamp (follow-up 32).
4. After the round: the generated artifacts (manifest order; stale now: plane, agent-worker, pdf-worker, ocr-worker bundles, case-checker `program.mjs`, setup-words `rows.mjs`), the round's words HANDOFF to UX-DESIGN (`fix-round-10-words.md`), then K5063's step 4 (one redeploy of biosmoke8 with the owed live checks, the targeted re-walk, the final pass, the 0.87.0 cut, which clears G90's installer and journey-check reds, the installer and site deploys, the rehearsal), then T51's close (§5.7).

## Acts on main or sessions (reviewed acts, §5.8)

- bio `main` moves only by T51's close PR (§5.7 (3); CLAUDE.md's standing direction), the design MERGE first (§5.7 (1), K1177); no refusal recorded.
- civicos-process `main`: a text that changes no principle is BOB's (K5036), merged by PR with the GitHub merge tool (standing list, K1177); no refusal recorded.
- biosmoke deployments: K4841. `civicsmith-site` and `newgroup` deploys: K4935 and Bob's words at K5037; K1715 made each Bob's approval in session. Account `…7f72` only, plus the rehearsal account (K4942).
- Job branches only by `mail jobbranch`; never a force-push. Sessions: archive each at its merge (K4219); refused acts never worked around (K4696); SIGNIN-DOOR's refusal is with Bob (above).
