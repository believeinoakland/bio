# Handoff

**Status** · Replaced whole at each handoff; holds only where things stand and what comes next. Written by BOB #142 (`session_0178ib9gzWRThTx5twPvt6PS`), 2026-10-08 ~19:12 UTC, for BOB #143. Read `build/rulings-active.md` first; this BOB's rulings are K2287–K2327 (and K2328, this handoff).

## Open with Bob

None. Answered today: BOB's refresh threshold is 55% of the window (K2287, civicos-process `e0ce857`, `7cfbcf6`); no case has been published yet, so no back-dated photo withdrawal (K2309); images embedded in a file a member uploaded lose their metadata, public documents carried as captured (K2315 → N806, T39, design at T39's opening).

## Open with UX-DESIGN (theirs to answer; channel `mail/BOB` B115, B116, unread by them)

B115: DEC-183's "relies on" (BOB's reading meanwhile: every photo any chain reaches), a label for an unmarked copy (meanwhile none), the four withdrawal refusals' words (meanwhile BOB's drafts, C-141.7–.10) and who may withdraw (meanwhile any member who may see the photo). B116: `photo.refused.changed` says "before signing" but is answered at the commit. An answer is folded by a new ruling and, if it changes built behaviour, an entry in `next.md`.

## Where things stand

- **T38** on `tranche/T38`. L1–L10 closed (L7, L9 empty). **L11 running**: merged op-grades (K2322), tasks (K2324), instance-setup (K2323), answer-envelope (K2321), affordances (K2325), op-declarations (K2327), admission (K2326). **Still running:** CONTROL-PLANE #27 (`session_01L6n1QKr1FBq4RCADwXEj7g`; CHANGEs B2 = admission's fallback improvement, fix if small else REPORT; B3 = op-declarations merged) and PLANE #27 (`session_01QxKvksbKPy1qWsAzhjWL99`; merges last in L11).
- **Reds (plan rule 6):** open items 1–3, 7, 11 (the plane's share: project-roster listeners and ops, `stats.test.mjs`, affordances `plane.test.mjs` ×28, promotion `d526` §4, `migrate-released`), 16 (fleetbundles pin, N802), 18 (plane `disclosures.test.mjs`:74). Coverage: acquisition R45's naming test is N804 (T39), accepted by name.
- **Next:** merge control-plane, then plane; close L11 (§5.6: regenerate in the manifest's order, `checks/run.mjs`, archive the nine L11 sessions with rows); then close T38 (§5.7).
- **T38's close (§5.7 as K2273 changed it):** (1) the design stream asked no `MERGE` since PR #15; if `main` moved, merge it into `tranche/T38` first. (2) archive `current.md` as `archive/T38.md` (`CLOSING`). (3) a pull request `tranche/T38` → `main`, merged with the GitHub merge tool (method `merge`), never a direct push; authority: Bob's standing direction in the product's `CLAUDE.md`; this is certification row V6's proof (record it in civicos-process `dryrun/`). A refused step is §16's. (4) delete backstop and WATCH. (5) Bob's meter and the tranche report. (6) open T39 from `next.md` (N779 done; N801–N806 new today).
- **Release:** none needed at T38's close unless BOB judges one lets held work into T39 (K1501).
- **Timers** (delete mine by id at takeover): backstop `trig_01Nz11P9keTQWah7SY6W3Vfi` (19:21), WATCH #142 `trig_0138pagBSiYV79DtHP5PRWHC` (20:01, into ROOT).

## Next steps, in order

1. Take over (§5.1): archive BOB #142, its `BOB-final` row under T38; rewrite the channel Writer line (`mail xwriter`); arm backstop and WATCH; delete mine.
2. Merge control-plane and plane as each completes; close L11; close T38; open T39.

## Process notes

- After a container restart: `npm ci --ignore-scripts` in agent-runner, `npm ci` in sheet-worker and file-scanner before `fleetbundles`.
- Every START over 300 KB names mechanics §17 step (3) as required (K2304).
- Drafting requirements ahead of a layer by workers (draft, then apply, then BOB reviews the diff) worked well this session: `plan/draft-T38-L8.md`, `draft-T38-L11.md`.
