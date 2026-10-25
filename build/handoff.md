# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #291 (`session_01TEt3uXGmiuwRsWMtmvxZgn`, depth 1, parent ROOT #9 `session_01GndWUi5ubGmXCVVnFqtJAi`, third account) for BOB #292, 2026-10-25 ~12:30 UTC, at about 40 % context. **T51 is OPEN** on `tranche/T51`; **fix round 10 is running** (opened K5065). Read rulings K5087 to the last line of `build/rulings.md` whole, `build/plan/fix-round-10-T51.md` whole (its §3, follow-ups 7-28, is the owed list) and `build/plan/fix-round-10-waves.md` whole.

## Open with Bob

- **SIGNIN-DOOR #3** (`session_01GU1iv4VtLeuTsVtVTUKjWm`): its push of its own branch `job/T51/signin-door` was refused by its permission check (§16, K5069); never retried or worked around. Bob has been told, each turn, to type in that session: `Approved: push job/T51/signin-door to origin, then post your COMPLETE.` It blocks plane's coupled merge and `store-assembly` (the critical path: store-request, interface-shell, the screens' op tables and control-plane's Wave B all wait on it).

## Done this session (K5087-K5095)

- Took over (K5087). Merged (each: ownership against the merge base, own fixture lines by the ABSOLUTE root, markers read, architecture over the tree, words over the module, then the merge, strikes, ruling, cursor, archive, metrics row): intent, action-clocks, answer-envelope, publication (twice), agent-runner, sheet-worker, network-notices, basis-version-grammar, content, money-checks, screens-inquiry, capture-requests, project-roster, reevaluation, case-check, review, store-door, following, public-read, screens-daily, agent-worker, case-disclosures, link-sweep, action-producers, screens-intake, monitoring, screens-entry, retrieval-browse (follow-up 22), case-inputs (follow-up 25).
- `uses` edges added on jobs' requests (K5069 rule): reevaluation +retrieval; screens-daily +record-core; agent-worker +ai-use +provenance; link-sweep +acquisition; screens-action +answer-envelope.
- Requirements: publication R15, public-read R44, screens-inquiry R96 R133-R136, screens-intake R4 R65 R68, basis-version-grammar R3 struck; basis-version-grammar R11 retired; screens-inquiry R129 and citation R21 reworded (citation R21 not yet met, its batch 6 START amended); screens-daily R103 written; extraction R75's code list corrected; next.md N1276 (agent-runner R20's `SIGNOUT_FAILED`, K3717).

## Running (11 job sessions; addresses in `build/plan/current.md`'s Jobs line)

- SIGNIN-DOOR #3 (NEEDS BOB), PLANE #61 (COMPLETE J62, held for the coupled merge), BASIS-VERSIONS #22, INSTANCE-SETUP #31 (batch 5), SCREENS-ACTION #17 (ANSWER B33: edge added, it merges and completes), AI-RUNS #29 (follow-up 21 COMPLETE J7, then CHANGE B7: its `dispatch-refusal` stand-in takes the worker's real shape; merge after its next COMPLETE), INQUIRY-GRAMMAR #14 (follow-up 24 COMPLETE J7, CHANGE B10: two more golden cases), RATIFICATION #37 (follow-up 16), INTENT #18 and PUBLICATION #40 (follow-up 27: parameterised fixtures for monitoring), OP-GRADES #26 (follow-up 19).
- Nine slots free (the twentieth held for `store-assembly`). Batch 5 left: interface-assets (gated on UX-DESIGN's scroll rule). Batch 6 (waves §2) may open as batch 5 completes: its STARTs are in `build/plan/starts-T51-F10/`, `interface-shell` and `citation` amended (K5090, K5095); `interface-shell` waits on `store-request`. Fill `#<n>` with the next number (grep `build/` for `<MODULE> #`), and replace `BOB #289 is depth 1` with your own name.
- Follow-ups owed (fix-round-10 §3): 7 conformance (after basis-versions; `conformance-2.txt` exists), 8 control-plane's Wave B, 9 inquiry R85's strike (after basis-versions), 12 plane (after the coupled merge), 13 + 28 extraction, 15 test-support (the §5.10 pass), 23 the `transcribe-answer` markers to plane (the §5.10 pass; plane's CHANGE runs them), 26 following (monitoring merged: can start now), 27 monitoring's re-point (after intent and publication merge). Each a new session (K4219) when its provider has merged; STARTs `<module>-2.txt` (follow-up template: any `-2.txt` written K5092-K5094).
- SUITE #2 `session_01UBk4hBz99SH8oVMCQ4s9RH` (`prep/suite-2`): live (reruns going at 11:30Z), nothing pushed since 05:12Z; when it writes, read its classed reds whole; archive with row `study-suite`.
- CASE-AUTHORING #44's record reads WORKING/QUIET: it was merged (K5085) and its session archived; ignore.
- Lanes nothing past H43, A41, W4, P26; channel nothing past U471 (B517 unread by UX-DESIGN). INVESTIGATION #4 (secondary) unreachable: leave it.
- My timers: backstop `trig_01Q5MW6MkafyvMTrZ2FppFpk` (12:35Z), WATCH #291 `trig_01KJgwTVVUP3XCtSLcCobwZr` (13:15Z): delete both at takeover.

## Tools

- The mail tool: a local merge of civicos-process `main` and `prep/jobbranch-K4385` (`git fetch --depth=1000 origin main +prep/jobbranch-K4385:refs/remotes/origin/prep/jobbranch-K4385`, `git worktree add --detach <dir> origin/main`, merge, take `--theirs` on `tools/test/mail.test.mjs`).
- Pre-merge, per module (a script is quickest): `git fetch origin job/T51/<m>`; `B=$(git merge-base origin/tranche/T51 origin/job/T51/<m>)`; `node checks/ownership.mjs /home/user/bio <m> $B origin/job/T51/<m>`; a `git worktree add --detach` of the job branch, then `node checks/fixtures.mjs <ABSOLUTE worktree> <m>` and `node checks/architecture.mjs <worktree> <m>` (a missing edge is cleared by the edge on the tranche, checked again over the whole tree after the merge); `git diff $B origin/job/T51/<m> | grep -E '^\+.*fixtures-(own|generic|contract)'` (read each marker). After the merge: `checks/architecture.mjs /home/user/bio`, `checks/words.mjs /home/user/bio <m>` at 0 and `checks/coverage.mjs` for any requirement written. Merge `--no-ff`; strike the met marks. A `uses` edge: edit the module's line in `modules.json`, then `node bio-plane/src/member-roster/order-build.mjs --check` and format.
- `archive_session` answers carry the usage for the metrics row; the `Size` line is in the job record (take the last one).

## Then, in order

1. Read every COMPLETE and merge; keep every slot full (at most 20), batch order, providers first (K4215); start follow-up 26 and batch 6's non-screens jobs as slots free.
2. When SIGNIN-DOOR pushes: merge it with plane (coupled; delete signin-door's `subscriptionsignin` row, lines 30-32 of `control-plane/owner-ops.mjs`, in the same act, K5052 (4)); then start `store-assembly`, then `store-request` after it, then interface-shell and the screens; plane's CHANGE for follow-ups 12 and 23.
3. After batches 1-7: the §5.10 pass (the eleven modules of the waves' §4, with follow-ups 15 and 23 and entry 6); the fixtures check zero for every module, each remaining line accepted by name.
4. After the round: the generated artifacts (manifest order; stale now: plane, agent-worker, pdf-worker, ocr-worker bundles, case-checker `program.mjs`, setup-words `rows.mjs`), the round's words HANDOFF to UX-DESIGN (`fix-round-10-words.md`), then K5063's step 4 (one redeploy of biosmoke8 with the owed live checks, the targeted re-walk, the final pass, the 0.87.0 cut, the installer and site deploys, the rehearsal), then T51's close (§5.7).

## Acts on main or sessions (reviewed acts, §5.8)

- bio `main` moves only by T51's close PR (§5.7 (3); CLAUDE.md's standing direction), the design MERGE first (§5.7 (1), K1177); no refusal recorded.
- civicos-process `main`: a text that changes no principle is BOB's (K5036), merged by PR with the GitHub merge tool (standing list, K1177); no refusal recorded.
- biosmoke deployments: K4841. `civicsmith-site` and `newgroup` deploys: K4935 and Bob's words at K5037; K1715 made each Bob's approval in session. Account `…7f72` only, plus the rehearsal account (K4942).
- Job branches only by `mail jobbranch`; never a force-push. Sessions: archive each at its merge (K4219); refused acts never worked around (K4696); SIGNIN-DOOR's refusal is with Bob (above).
