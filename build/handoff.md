# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #272 (`session_01C2kJFdR7UFZjoVSjXF4BXY`, depth 1, parent ROOT #9 `session_01GndWUi5ubGmXCVVnFqtJAi`, third account) for BOB #273, 2026-10-24 ~01:45 UTC, at about 37 % of its window. **T51 is OPEN** on `tranche/T51`; **fix round 8's jobs are all merged and archived** (K4843), its round end not yet done; **fix round 9's batch A is running** (3 jobs). Read `build/rulings-active.md` whole, then **K4839 to the last line** of `build/rulings.md` whole, then `build/plan/fix-round-9-T51.md` §0, §2c, §3, §3a, §3b, §6, §7 whole, `build/plan/fix-round-8-T51.md` §7, and one START (`build/plan/starts-T51-F9/sheet-worker.txt`) for their shape.

## Bob's direction today (in force; each in rulings-active)

- **K4841 (new): every act on the biosmoke deployments is approved** ("You have my approval to do anything with these deployments without further permission."): the redeploy to biosmoke8 needs no approval from him; an auto-mode refusal is met by citing K4841, never worked around; account, proxy (K4733) and K4426's gate still hold. `dist/cut-*` pushes and the release signature are not covered.
- K4831 (reading architecture), K4812, K4798, K4781-K4787, K4790, K4426 as before.
- **Nothing is open with Bob.** His coming acts: the claim of biosmoke8's new room; 0.87.0's signature.

## Running (all third account, reachable)

- **Batch A of fix round 9** (K4842; STARTs posted B7, B2, B75; addresses in the plan's Jobs line): TEST-SUPPORT #10 `session_01EuoP4BVxYVJN8Zit2i4p66` (opus), RUNTIME-LIMITS #7 `session_01Bbx2ng6oqCwJyEKMZdPRg2`, PLANE #56 `session_011em5NMVJqsV8WDNmpEHRAd` (plane-1, test-only; also g41-shape's wall bar, K4843). Created 01:38; confirm each start (`mail check` UNCONFIRMED past 15 min → §5.3 (5)). On each COMPLETE: add its new files to its `paths` in `modules.json` (K4842 (2), K1043: test-support's `pdfgen.mjs`, `imggen.mjs`, `sheetgen.mjs`, `docgen.mjs`, `alarm-double.mjs`, `job-registrar-stub.mjs`; runtime-limits' `read-bounds.mjs`, `byte-ledger.mjs`), then ownership, merge, strike its met marks, its suite and impact set on the merged tree, ruling with **Open**, archive with its row (K4219).
- **SUITE #1** `session_0197tVNGG82dZPFRnETvL1At` (opus): whole suite alone; woken at 01:09 to push its report to `prep/account3-suite`; idle since, nothing pushed (its last status: "I'll report it as an environment red with that workaround named"). Read its last events (`list_events`, kinds assistant) to see whether a push was refused; if so record it and take the reds from its transcript; then archive with its row.
- No lane runs. AI-DESIGN, INVESTIGATION-DESIGN, PERFORMANCE, JOURNEYS idle (last read A41, H43, P22, W4). Channel: nothing past U467; B504-B506 unread by them.
- Timers: backstop `trig_01Jyq8po8a2a5yjkwovP6f3b` (into me, 01:55), WATCH #272 `trig_015NcdGCtAJQtsTdpAfhRCxH` (into ROOT #9, 02:35): delete both at takeover, then arm your own. `trig_01QUMs57hC9hiEbZcemLRyii` (SUITE #1 wake) has fired.

## Do next, in order

1. **Take over** (§5.1): Status line (`mail bob`; Writer line stays "primary", K4795); archive BOB #272 and write its `BOB-final` row; `node_modules` (K4113); worktree of civicos-process `prep/T51-close-v2` for `mail` and the checks (`git -C <clone> worktree add <dir> FETCH_HEAD` after `fetch --depth 50 origin prep/T51-close-v2`). **`mail done`/`mail post` push the whole local tranche branch (K4683).** Merge in a separate worktree and run suites there (`git worktree add -B merge/x <dir> origin/tranche/T51`, symlink each `node_modules`).
2. **Batch A** as above; when all three have merged, open **batch B** (19 jobs: 18 of the plan plus sheet-worker, K4840 (6)), ooxml merging first, at most 20 running (K4215); then C (14 with case-carriage, K4842 (4)), D (8), per plan §3 and its "after" column. Before C: rebuild the pdf-worker and ocr-worker bundles once B's PDF/image jobs merge (§6 (8)). Each START is `build/plan/starts-T51-F9/<module>.txt` (second halves `-2.txt`); session titles and numbers are in K4842. Model per START header (opus for the plan's "default" jobs).
3. **Fix round 8's round end** (round 8 §7), alongside batch A (no job's module is touched by it): regenerate in the manifest's order (member-roster `order.mjs`, setup-words `rows.mjs` (adds `installer.fleet.logsunconfirmed` and the other missing keys), case-checker `program.mjs`, `court-data.mjs`, wizard-scripts, then `node bio-plane/scripts/bundles.mjs`, newgroup last; verify `fleetbundles` and `newgroup-bundle-fresh` with `--test-force-exit`); never while a `modules.json` edit is pending. The words check after it. Acquisition's suite five times alone on one core; the heavy files alone. Update `build/plan/k4426-check-T51-F8.md` (PENDING G103, G105, G106, G114, G115 now merged: K4832, K4836, K4843) to READY/READY-P by a reading worker. Then the **one redeploy** to biosmoke8 (`deploy-test/biosmoke8/wnam/deploy`, K4296; approved, K4841), the targeted re-walk of round 8's P list through the proxy (K4733) and PERFORMANCE #2 on a quiet copy (K4735).
4. **Words HANDOFF** of round 9 §5 to UX-DESIGN (one `xpost` HANDOFF, K4269) and the `setup-words/rows.mjs` row of G135d (§6 (7)): not yet done.
5. **Stage 2** after round 9 (gate GAP-0.3 met, K4838); Stage 3 after GAP-0.4 and GAP-3.0's licences. G127f (job 42, presigned upload) needs an R2 S3 key through the API; if refused, name it as Bob's act.
6. The room (K4752), the final pass (`walk-T51-final/BRIEF.md`), 0.87.0 (G90, K4778), then T51's close (§5.7; the design MERGE U467, 1dc64ce916, merged first, K1177).

## Accepted reds (by name)

As K4731 (`system/row-census` R50; plane `release` R24, `l77-size` R77 L twice; file-safety `rows.test.mjs` R24; installer-steps R36, R40; installer R33 (six), R8, R11, R20, R44 until 0.87.0; words: case-checker `spec.mjs` inline 6, missingkey `refusal.PROMOTE_NOT_A_PARTICIPANT` and the five `installer.fleet.logsunconfirmed` rows until the regeneration). Fragile, placed in round 9: screens-intake `capture.test.mjs` R2 R21 R24 (G143), plane `g41-shape` R84 G41 (K4843, plane-1). Coverage reds: round 9's new ids until their jobs merge. No "load-dependent" label (K4787).

## Acts on main or sessions (reviewed acts, §5.8)

- `main` moves only by T51's close PR (§5.7 (3)), the design MERGEs first (§5.7 (1), K1177); no refusal recorded.
- Job branches only by `mail jobbranch` or a job merging the tranche into its own; never a force-push.
- biosmoke deployments: any act, K4841 (standing list: not added). Throwaway probe Workers `reading-probe-*` on the pinned account, deleted after (K4838). A Durable Object class delete on a non-biosmoke deployment is not covered.
- A branch delete by push was refused by the git proxy (403, K4832): `prep/bob271-rc-merge` stays; never retried.
- The live copy only through the proxy (K4733). No session holds `ADMIN_TOKEN` or the deploy token.
- Sessions: archive each job at its merge (K4219); the secondary account's sessions and UX-DESIGN #39 (primary) are not reachable: leave them.
