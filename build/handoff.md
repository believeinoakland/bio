# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #254 (`session_01AuXqiR7DuXJvr8nWLNPVh3`, depth 1, parent ROOT #8 `session_01R3hvN64bYHG3vPQmYmaeLR`, secondary account), 2026-10-22 ~18:30 UTC, at about 38 % of its window, at a clean point: every merge pushed, every job entry read and answered. **T51 is OPEN** on `tranche/T51`; fix round 6 runs (waves 3 and 4 started this session). Read `build/rulings-active.md` whole, then **K4591 to the last line** of `build/rulings.md` whole, then `build/plan/fix-round-6-T51.md` whole (new: G26-G36, K4597's E1-E3). The diagnoses behind them (`diagnosis-R6-memory.md`, `-G4.md`, `-G13.md`, `-unplaced.md`, `-2a.md`) and `review-K4426-round6.md`: read one whole when a job cites it.

## Bob's direction today (in force)

- Alpha release as quickly and efficiently as possible; everything serves it (Bob, this session).
- **K4426 enforced at planning (K4597; P7 amended, K4601, approved by Bob):** every walk defect is planned with its four fields; `node /home/user/cp-close/checks/fixplan.mjs /home/user/bio` must read 0 before a START is posted (a worker was bringing the plan to 0 at the handoff; check it, and fix what it left); an independent reviewer reads each new plan before it is used; the tranche report names any item deployed without a researched cause. The rulings-active line "Every defect understood before the next deploy" is the one rule.
- **Speed (K4599): "as recommended":** the combined read and the objects' location after the alpha (`next.md`); the alpha carries G12a-c.
- K4581: A41 is beta work (Bob restated it this session).

## Running (13 jobs; all STARTed by BOB #254)

- **Wave 3 (K4600, STARTs `starts-T51-F6c/`):** PDF-READER #11 (G26 page-range entry; its branch held only #10's record commits, it merges the tranche first), READING-PIPELINE #23 (G26 owner, merges after pdf-reader), CAPTURE #49 (G27 fresh stub + one retry; G32 owner: acquisition is earlier in the order, so capture looks up the held capture and passes its digest), ACQUISITION #29 (G27 reply not resident), CASE-AUTHORING #39 (G29 evidence rows), INTERFACE-SHELL #18 (G30 page work once per release, G31 tests), EXTRACTION #35 (G33 part-keyed repair), SCREENS-INQUIRY #22 (A-23, haiku, test only).
- **Wave 4 (K4602, `starts-T51-F6d/`):** PDF-WORKER #5 (G34 the 16 MiB envelope, measured), SCHEDULER #40 (G35 same-instant stall), REEVALUATION #24 (G36 C69 seam).
- **CONTROL-PLANE #48** (merged K4598, re-opened B47): four of its tests red on the tranche since before BOB #254 (5b37e0c252), unnamed: `t51-held-failed` R117, `t51-large-pdfs` R120/R121, `t51-round5-press-seam` R125 (b)/(c), `t51-round5-seam` E3. Each fails alone. Not accepted. Its session is at ~60 % of its window: if it blocks on context, restart as CONTROL-PLANE #49 with B47.
- **SCREENS-PUBLISH #18** (B36: merge, door seam; then a CHANGE when CASE-AUTHORING #39 merges, to draw an evidence line per row) and **SCREENS-DAILY #19** (B35: merge, `casedrafts-seam`). Both were COMPLETE before; merge each once green.
- Control-plane's `page()` half of G30 (hash once) is owed to a control-plane job after INTERFACE-SHELL #18 merges (or folded into #48's re-open if small).

**Merge order:** pdf-reader, then reading-pipeline; acquisition before capture; extraction; scheduler; reevaluation; pdf-worker; case-authoring, then screens-publish's CHANGE; interface-shell; screens-inquiry; control-plane; screens-daily. Run each merged module's suite and its users (`build/plan/impact.mjs`) on the merged tranche BEFORE any mail command (a mail command pushes the tranche).

## Do next, in order

1. **Take over** (§5.1): archive BOB #254 once idle (row `BOB-final`, T51); delete its backstop `trig_016S7Hay63MzgT3WRBVGRL7D` and WATCH #254 `trig_014RejFzK7NCovM6buboGsix`; arm yours; `node_modules` (K4113); `/home/user/cp-close` at civicos-process `prep/T51-close-v2` (`git worktree add --detach`; it now has `checks/fixplan.mjs` and the P7 change).
2. `mail check`; confirm each wave 3/4 start (§5.3 (5)); answer every entry.
3. **fixplan to 0** (see above), committed.
4. **E3**, the platform-shape harness (raw workerd with `--max-old-space-size`, a broken-stub fault), owed by K4597: jobs use the `diagnosis-R6-memory.md` pattern as `.probe.mjs` meanwhile; build the shared one only if a second job needs it.
5. Merge in the order above as each completes; requirement lines for each from its COMPLETE (BOB writes them; each new id named by its own test, K874).
6. **The round end** (plan §7): design commits DEC-418/DEC-419 merged (design files only) before regenerating; regenerate in the manifest's order; the whole suite; K4426's check per cause G1-G36; `fixplan` 0; **one redeploy**; the targeted re-walk; the final pass.
7. **T51's close** (§5.7).

## Lesson (this session)

An independent reviewer and a check found 7 unplaced walker rows and 3 unresearched "after the deploy" items in a plan two BOBs had reviewed. Never trust a plan's "explained by" or "check after the deploy" without a diagnosis that reproduced it.

## Acts on main or sessions (reviewed acts, §5.8)

- `main` moves only by T51's close PR (§5.7 (3)), the design MERGEs first (§5.7 (1), K1177); no refusal recorded. The process repository's `main` by PR at the close (K4275), carrying `prep/T51-close-v2` (fixplan, P7).
- Job branches only by `mail jobbranch` (K4385); never a force-push.
- Deploys to biosmoke8 by push to `deploy-test/biosmoke8/{dry-run,deploy}` (K4296); none until every round-6 cause passes K4426's check and fixplan reads 0.
- Sessions: archive each job at its merge; lanes' sessions are not BOB's to archive.

## Open with Bob

- None.

Lanes: AI-DESIGN A41 (beta), JOURNEYS W4, INVESTIGATION-DESIGN H43, PERFORMANCE P15 (answered by K4599). UX-DESIGN through U455, read; B485-B487 ours.
