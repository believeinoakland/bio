# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #289 (`session_014vmW9fV344PwNt8dFzAECa`, depth 1, parent ROOT #9 `session_01GndWUi5ubGmXCVVnFqtJAi`, third account) for BOB #290, 2026-10-25 ~10:30 UTC, at about 40 % context. **T51 is OPEN** on `tranche/T51`; **fix round 10 is running** (opened K5065). Read rulings K5064 to the last line of `build/rulings.md` whole, `build/plan/fix-round-10-T51.md` whole and `build/plan/fix-round-10-waves.md` whole.

## Open with Bob

- **SIGNIN-DOOR #3** (`session_01GU1iv4VtLeuTsVtVTUKjWm`): its push of its own branch `job/T51/signin-door` was refused by its permission check (a compound command); §16, never retried or worked around. Bob was told (K5069) to type in that session: `Approved: push job/T51/signin-door to origin, then post your COMPLETE.` Plane's coupled merge (signin-door's export with plane's `OWNERS` entry) waits on it, so batch 1 is not fully merged and `store-assembly` has not started.

## Done this session (K5064-K5074)

- Took over (K5064); opened fix round 10 (K5065): batch 1's twenty jobs, then every free slot filled from batches 2 and 3 as jobs merged.
- **Merged (43 job merges):** provenance, capture-sources, standards, retrieval-browse (twice), retrieval, conformance (twice), admission, file-scanner, pdf-worker, record-core, inquiry-grammar, membership, ai-accounts, promotion (twice), translations, control-plane, subresources, pdf-reader, pdf-pixels, office-readers, file-safety, sources, duties, credentials (twice), acquisition, ocr-worker, case-import, contradiction, case-checker, publish-schedule, actions, csv-reader, doc-clean, case-carriage. Each: `premerge.sh` steps (ownership against the merge base, own fixture lines by the ABSOLUTE root, markers read), merge, strike met marks, ruling, cursor, archive, metrics row.
- `uses` edges added on a job's request (a test importing an earlier module's published fixture): signin-door +test-support +op-declarations (K5066), conformance +retrieval (K5069), contradiction +retrieval (K5073), publication +retrieval (K5074).
- control-plane's `interfacewords` row removed from `owner-ops.mjs` at translations' merge (K5070); `pdf-worker/test/pdf-pixels-fixtures.mjs` added to pdf-pixels' `tests`.
- Requirements written: retrieval-browse R21 (K5067), pdf-reader R50 (K5074). Follow-up STARTs written: `conformance-2.txt` (K5073), `pdf-reader-2.txt` (K5074); findings written into later STARTs (inquiry, citation, screens-inquiry, reading-pipeline, plan-work, scheduler, following, instance-setup, installer, escalation, public-read, ratification).
- Fix-round plan entries added: 5 (the fixtures check reads nothing with a relative root: fix in civicos-process by PR), 6 (test-support's `generators.test.mjs:114`, in the §5.10 pass).

## Running (20 job sessions; addresses in `build/plan/current.md`'s Jobs line)

- CHANGE pending: WIZARD-SCRIPTS #25 (registry re-take at design commit `c752a602da`, K5069), CONTROL-PLANE #59 (its `declared-ops.test.mjs:122` reads translations' declaration, K5070), PLANE #61 (its START plus R87 G54 L under load, K5069), PUBLICATION #38 (B10 answer), READING-PIPELINE #37 (B56 answer; a ranged-notes CHANGE owed when PDF-READER #18 merges).
- Working: CAPTURE #60, RUN-PRODUCTIONS #15 (COMPLETE, unread), SCREENS-INQUIRY #27, ATTESTATION #5, EXTRACTION #46, EVENTS #12 (COMPLETE, unread), LINES #6, MONEY #9 (COMPLETE, unread), PEOPLE #14, INQUIRY #24, CONFORMANCE #26, PDF-READER #18, STEPS #8, STRENGTH #22.
- Not yet started: batch 2's `store-assembly` (after batch 1's last merges: signin-door, plane, wizard-scripts, control-plane); batch 3's ai-use, capture-requests, answers, ratification, case-inputs, escalation, store-request (after store-assembly), screens-intake; batches 4 to 7. Session numbers are filled into a START's first line (`#<n>` replaced by the next number from `build/plan/`, `build/rulings.md` and `build/jobs/`) just before it is posted.
- SUITE #2 `session_01UBk4hBz99SH8oVMCQ4s9RH` (`prep/suite-2`): third background run; nothing pushed since 05:12Z. When it writes, read its classed reds whole (stale tests BOB's, test files only; a slow plane file is a CHANGE to plane); archive with row `study-suite`.
- Lanes nothing past H43, A41, W4, P26; channel nothing past U471 (B517 unread by UX-DESIGN). INVESTIGATION #4 (secondary) unreachable: leave it.
- My timers: backstop `trig_01UDuFtt4cDx6waB5z7ND5ja`, WATCH #289 `trig_015vzmTVn5jUeyYa496eQusL`: delete both at takeover.

## Tools

- The mail tool: a local merge of civicos-process `main` and `prep/jobbranch-K4385` (`git fetch --depth=1000 origin main prep/jobbranch-K4385`, `git worktree add --detach <dir> origin/main`, merge, take `--theirs` on `tools/test/mail.test.mjs`). `prep/running-cap-K4976` is already in `main`.
- Pre-merge, per module: `node checks/ownership.mjs /home/user/bio <m> $(git merge-base origin/tranche/T51 origin/job/T51/<m>) origin/job/T51/<m>`; `node checks/fixtures.mjs <ABSOLUTE worktree of the job branch> <m> --list`; `git diff <base> origin/job/T51/<m> | grep '^+.*fixtures-(own|generic)'` (each marker read, K5060). Merge `--no-ff`; strike the met `not yet met: T51` marks (a job that strikes its own is accepted when the cause is met, K5072).
- `archive_session` answers carry the usage for the metrics row; the `Size` line is in the job record.

## Then, in order

1. Read RUN-PRODUCTIONS, EVENTS, MONEY (COMPLETE) and merge; keep every slot full (at most 20), batch order, providers first (K4215).
2. When SIGNIN-DOOR pushes: merge it with plane (coupled; delete signin-door's `subscriptionsignin` row, lines 30-32 of `control-plane/owner-ops.mjs`, in the same act, K5052 (4)); then start `store-assembly` (default model), then `store-request` after it, then the screens.
3. CHANGEs owed as providers merge: each job's "Later" lines in the waves table (e.g. credentials' member-roster line, contradiction and conformance's basis-versions lines, actions' consequences line, retrieval-browse's events/entities lines, translations' store-door lines, acquisition's 80 plane/control-plane contract lines plus `fixtures.test.mjs:55` owing a `fixtures-generic` marker, file-safety's plane lines, control-plane's 70 own lines after store-request): a new session for an archived job (K4219).
4. After batches 1-7: the §5.10 pass (eleven modules of K5062, plus fix-round entry 6); the fixtures check zero for every module, each remaining line accepted by name.
5. After the round: the generated artifacts (manifest order; bundles stale now: plane, agent-worker, pdf-worker, ocr-worker, case-checker `program.mjs`, setup-words `rows.mjs`), then the handoff K5063's step 4 (one redeploy of biosmoke8 with the owed live checks, the targeted re-walk, the final pass, the 0.87.0 cut, the installer and site deploys, the rehearsal), then T51's close (§5.7).

## Acts on main or sessions (reviewed acts, §5.8)

- bio `main` moves only by T51's close PR (§5.7 (3); CLAUDE.md's standing direction), the design MERGE first (§5.7 (1), K1177); no refusal recorded.
- civicos-process `main`: a text that changes no principle is BOB's (K5036), merged by PR with the GitHub merge tool (standing list, K1177); no refusal recorded.
- biosmoke deployments: K4841. `civicsmith-site` and `newgroup` deploys: K4935 and Bob's words at K5037; K1715 made each Bob's approval in session. Account `…7f72` only, plus the rehearsal account (K4942).
- Job branches only by `mail jobbranch`; never a force-push. Sessions: archive each at its merge (K4219); refused acts never worked around (K4696); SIGNIN-DOOR's refusal is with Bob (above).
