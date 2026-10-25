# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #290 (`session_015iuN6EMTga2w9rsWNJAhJi`, depth 1, parent ROOT #9 `session_01GndWUi5ubGmXCVVnFqtJAi`, third account) for BOB #291, 2026-10-25 ~11:40 UTC, at about 40 % context. **T51 is OPEN** on `tranche/T51`; **fix round 10 is running** (opened K5065). Read rulings K5076 to the last line of `build/rulings.md` whole, `build/plan/fix-round-10-T51.md` whole (its §3, follow-ups 7-21, is the owed list) and `build/plan/fix-round-10-waves.md` whole.

## Open with Bob

- **SIGNIN-DOOR #3** (`session_01GU1iv4VtLeuTsVtVTUKjWm`): its push of its own branch `job/T51/signin-door` was refused by its permission check (§16, K5069); never retried or worked around. Bob has been told, each turn, to type in that session: `Approved: push job/T51/signin-door to origin, then post your COMPLETE.` It blocks plane's coupled merge and `store-assembly` (the critical path: store-request, interface-shell, the screens' op tables and control-plane's Wave B all wait on it).

## Done this session (K5076-K5085)

- Took over (K5076). Merged (each: ownership against the merge base, own fixture lines by the ABSOLUTE root, markers read, architecture over the tree, words over the module, then the merge, strikes, ruling, cursor, archive, metrics row): run-productions, events, money, control-plane (B86), capture, publication, attestation, conformance, steps, wizard-scripts (twice), pdf-reader, reading-pipeline (twice), lines, strength, people, extraction (twice), ai-use, answers, escalation (twice), case-inputs, inquiry, entities, csv-reader (follow-up), member-roster, progressions (twice), ratification, bias, ai-runs, case-account, consequences, docket, calculations, case-catalogue, case-authoring, case-carriage (follow-up), action-plans, plan-work.
- `uses` edges added on jobs' requests (a test importing an earlier module's published fixture, K5069 rule): events, lines, entities +promotion; inquiry +duties; extraction +pdf-reader +ai-accounts; consequences +retrieval +sources; case-account +retrieval; case-authoring +doc-clean +retrieval +standards; action-plans +retrieval. A job importing a LATER module is refused (case-inputs/review): it keeps the answer under `fixtures-contract: <later> <id>` and the later module's job runs it.
- Requirements written: inquiry R65 `answered`; basis-version-grammar R3 (cause 30b's version half, K5077); publication R15 `built: true`, public-read R44 (chain 4), ratification R60 (door bar 11) (K5084).
- Stale test fixed by BOB (K4297 (2)): op-declarations `browser.mjs` reads wizard-scripts' `source/registry.json` (K5078). Fix-round entry 5 closed, no defect (K5078: a relative root works; `.` inside the process repository was the mistake).

## Running (19 job sessions; addresses in `build/plan/current.md`'s Jobs line)

- SIGNIN-DOOR #3 (NEEDS BOB), PLANE #61 (COMPLETE J62, held for the coupled merge), SCREENS-INQUIRY #27, BASIS-VERSION-GRAMMAR #2, SCREENS-INTAKE #25 (all working; the last three QUIET but live, K506), CAPTURE-REQUESTS #24 (CHANGE B8 pending: its steps line), INTENT #17, PUBLIC-READ #34 (WAITING ON BOB J28, answered B30: it waits for PUBLICATION #39's merge, then a CHANGE to call `recordCaseManifest({built: true})` and bring `chain.test.mjs` to 4; its J27 work merges with that), PUBLICATION #39 (follow-up 18), ACTION-CLOCKS #18, ANSWER-ENVELOPE #16, SCREENS-DAILY #20, AGENT-RUNNER #16, SHEET-WORKER #6, PROJECT-ROSTER #15, CONTENT #22, MONEY-CHECKS #6, REEVALUATION #27, NETWORK-NOTICES #9.
- Not yet started: `store-assembly` (slot held; after signin-door + plane merge, default model), then `store-request`; batch 4's `basis-versions` (after basis-version-grammar merges; its START carries the walker's `conclude({reading})` case); batch 5's agent-worker, case-disclosures, review, case-check, monitoring, following, link-sweep, action-producers, instance-setup, store-door, interface-assets (gated on UX-DESIGN's scroll rule), screens-entry, screens-action; batches 6, 7. STARTs are `build/plan/starts-T51-F10/<module>.txt` (follow-ups `<module>-2.txt`); fill `#<n>` with the next number from `build/plan/current.md`, `build/rulings.md`, `build/jobs/`, `build/plan/archive/`, and replace `BOB #289 is depth 1` with your own name.
- Follow-ups owed (fix-round-10 §3): 7 conformance, 8 control-plane's Wave B items, 9 inquiry R85's strike, 10-11 done, 12 plane's `r9-jobs:318` (extraction merged: in plane's CHANGE after the coupled merge), 13 extraction, 14 done, 15 test-support (the §5.10 pass), 16 ratification, 17 done, 18 publication (running), 19 op-grades `moneyingestread`, 20 done, 21 ai-runs `PLAN_CLOSED`. Each becomes a new session (K4219) when its provider has merged.
- SUITE #2 `session_01UBk4hBz99SH8oVMCQ4s9RH` (`prep/suite-2`): nothing pushed since 05:12Z; when it writes, read its classed reds whole; archive with row `study-suite`.
- Lanes nothing past H43, A41, W4, P26; channel nothing past U471 (B517 unread by UX-DESIGN). INVESTIGATION #4 (secondary) unreachable: leave it.
- My timers: backstop `trig_01M7ZHdJVMVHj3eAC3dutop5` (11:55Z), WATCH #290 `trig_01RxDejDVjVNfzh8JMBca1QL` (12:35Z): delete both at takeover.

## Tools

- The mail tool: a local merge of civicos-process `main` and `prep/jobbranch-K4385` (`git fetch --depth=1000 origin main +prep/jobbranch-K4385:refs/remotes/origin/prep/jobbranch-K4385`, `git worktree add --detach <dir> origin/main`, merge, take `--theirs` on `tools/test/mail.test.mjs`).
- Pre-merge, per module (a script is quickest): `git fetch origin job/T51/<m>`; `B=$(git merge-base origin/tranche/T51 origin/job/T51/<m>)`; `node checks/ownership.mjs /home/user/bio <m> $B origin/job/T51/<m>`; a `git worktree add --detach` of the job branch, then `node checks/fixtures.mjs <ABSOLUTE worktree> <m> --list` and `node checks/architecture.mjs <worktree> <m>` (an architecture failure for a missing edge is cleared by the edge on the tranche, checked again after the merge over the whole tree); `git diff $B origin/job/T51/<m> | grep -E '^\+.*fixtures-(own|generic)'` (read each marker). After the merge: `checks/architecture.mjs /home/user/bio` and `checks/words.mjs /home/user/bio <m>` at 0. Merge `--no-ff`; strike the met marks.
- `archive_session` answers carry the usage for the metrics row; the `Size` line is in the job record (take the last one).

## Then, in order

1. Read every COMPLETE and merge; keep every slot full (at most 20), batch order, providers first (K4215).
2. When SIGNIN-DOOR pushes: merge it with plane (coupled; delete signin-door's `subscriptionsignin` row, lines 30-32 of `control-plane/owner-ops.mjs`, in the same act, K5052 (4)); then start `store-assembly`, then `store-request` after it, then the screens; plane's CHANGE for follow-up 12.
3. When PUBLICATION #39 merges: CHANGE to PUBLIC-READ #34 (B30), then merge public-read; then follow-up 16 (ratification).
4. After batches 1-7: the §5.10 pass (the eleven modules of the waves' §4, with follow-up 15 and entry 6); the fixtures check zero for every module, each remaining line accepted by name.
5. After the round: the generated artifacts (manifest order; stale now: plane, agent-worker, pdf-worker, ocr-worker bundles, case-checker `program.mjs`, setup-words `rows.mjs`), then K5063's step 4 (one redeploy of biosmoke8 with the owed live checks, the targeted re-walk, the final pass, the 0.87.0 cut, the installer and site deploys, the rehearsal), then T51's close (§5.7).

## Acts on main or sessions (reviewed acts, §5.8)

- bio `main` moves only by T51's close PR (§5.7 (3); CLAUDE.md's standing direction), the design MERGE first (§5.7 (1), K1177); no refusal recorded.
- civicos-process `main`: a text that changes no principle is BOB's (K5036), merged by PR with the GitHub merge tool (standing list, K1177); no refusal recorded.
- biosmoke deployments: K4841. `civicsmith-site` and `newgroup` deploys: K4935 and Bob's words at K5037; K1715 made each Bob's approval in session. Account `…7f72` only, plus the rehearsal account (K4942).
- Job branches only by `mail jobbranch`; never a force-push. Sessions: archive each at its merge (K4219); refused acts never worked around (K4696); SIGNIN-DOOR's refusal is with Bob (above).
