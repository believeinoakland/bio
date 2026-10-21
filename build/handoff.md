# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #242 (`session_018XS8GJKJ9CrADVMCkN7XLe`, depth 1, parent ROOT #8 `session_01R3hvN64bYHG3vPQmYmaeLR`, secondary account), 2026-10-21 ~16:25 UTC, at 63 % of its window. **T51 is OPEN** on `tranche/T51`, in **fix round 3, wave 2**. Read `build/rulings-active.md` whole (§1 "How debugging runs" K4297, "Speed" K4354; §4's new job-branch line, K4385), then **K4367 to the last line** of `build/rulings.md` whole, then `build/plan/fix-round-3-T51.md` whole (in force; additions at K4367 to K4399, its §11 the round's word batch).

## What happened this session

- Took over (K4367). Wave 1 merged whole: 20 jobs plus RECORD-CORE, and the providers added for wave 2 (CAPTURE #44 `captureseenin`, ACTION-CLOCKS #17 `remindersfor`, ACQUISITION #23, AFFORDANCES #41, PLANE #47, all merged; K4367 to K4397). Wave-2 STARTs checked against merged code and amended (K4370).
- **Why BOBs force-pushed, and the fix** (Bob asked, K4385): job branches were moved by hand-written git; now only `node /home/user/cp-jb/tools/mail.mjs jobbranch --product . --tranche T51 --module <m>` (civicos-process branch `prep/jobbranch-K4385`; check it out into a worktree if `/home/user/cp-jb` is gone). It never forces. rulings-active §4 says so.
- Design stream: DEC-405 (N1258), DEC-406/407 public registers (N1259), DEC-408 (notes, never published), DEC-409/410 follow the trail (N1260): all merged into the tranche (design files only), placed in `next.md` for T52 (K4269), ACKed through U445.
- T52 drafts: `build/plan/draft-T52-DEC406.md`, `measures-T52-DEC406.md`, `draft-T52-DEC409.md`; **nine decisions put to Bob** on the page https://claude.ai/artifact/MAAk8ZpjRve5y7fkutHnjG (K4392, K4396).

## Running jobs (addresses in `current.md`'s Jobs line)

- **ENTITIES #18** (wave 1, last): told B8 to declare `officeconfirm`'s description word for word as op-grades publishes it. When it merges: CHANGE to OP-DECLARATIONS #34 (spec it, then merge it), start SCREENS-SETTINGS #15 and SCREENS-ACTION #12 (STARTs ready; settings also waits on INTERFACE-SHELL #14).
- **OP-DECLARATIONS #34**: answered J30 (a); held until officeconfirm merges, then COMPLETE and merge.
- **CONTROL-PLANE #44**: told plane R74 merged (B20) and `money` added to its uses (B21); merge last in wave 2.
- **SCREENS-INQUIRY #19**, **SCREENS-INTAKE #14**: running.
- **INTERFACE-SHELL #14** (interface-shell R116 `cs.signer.sign(statements, {keyFile})`): merges before SCREENS-SETTINGS.
- Merged and archived this session: see K4367 to K4399. The module suite started at fead60ac8e (background task in BOB #242's container; its result lost with this session; re-run once per wave on the merged tranche).

## Do next, in order

1. **Take over** (§5.1). Archive BOB #242 once idle (row `BOB-final`, T51). Delete its routines: backstop (send_later, ~16:20Z, may have fired) and WATCH #242 `trig_013j7hLnCdLKMw7nM5gzpcks`; arm your own. Channel: UX-DESIGN #37, read through U445, nothing owed. Lanes: PERFORMANCE past P6, AI-DESIGN past A5, JOURNEYS past W4, INVESTIGATION-DESIGN past H43.
2. **Bob's nine T52 decisions:** ask him in one line to answer in your session (he may have answered in BOB #242's: read its last events with `list_events` before asking). Record each in his words; then write T52's plan from the two drafts (read both whole) with his answers.
3. **Finish wave 2** as above; merge each at once (providers first: interface-shell, then settings, intake, inquiry, action, control-plane last).
4. **After the round** (plan §9): send the word batch (plan §11) to UX-DESIGN in one HANDOFF; regenerate in the manifest's order (member-roster `order.mjs` changed: `uses` edges added, K4399); checks; the scanner image republished (`container-images.yml`); redeploy biosmoke8 by push to `deploy-test/biosmoke8/{dry-run,deploy}`; targeted re-walk; the performance lane's re-measure (K4354); the final pass; then T51's close (§5.7): design MERGE first, `main` merged in, every module's tests, the close PR; the process repository's PR (M-T51-6) carrying `prep/cause-job-K4273`, `prep/words-arms-K4208`, `prep/stale-test-K4349`, `prep/jobbranch-K4385`.

## Accepted reds, by name, until the act named

Plane R24 and screens-settings R39 (T52); journey-check R17 and its walk-dependent local-arm tests; store-door R17; promotion `row-census`; coverage's held ids (K4236); case-checker R13, R25 until the round's regeneration (K4355); the words check's op-grades `plain`/`inline` findings until regeneration (K4384); control-plane's nonce/page tests and `plane/fix3-r74` until CONTROL-PLANE #44 merges (K4360, K4393); `affordances/t33:189` and op-declarations' spec reds until OP-DECLARATIONS #34 merges (K4369, K4379); acquisition `checks.test.mjs` R29 R31 until the design's `refusal.CAPTURE_NOT_KEPT` row lands (K4373); op-declarations `t36:306` (`capturecredentiallist` has no help text; its affordances row goes in the completion round, K4381).

## Acts on main or sessions (reviewed acts, §5.8)

- `main` moves only by T51's close PR (§5.7 (3)), the design stream's MERGE first (§5.7 (1), K1177); no refusal of either recorded. The process repository's `main` by PR at the close (K4275: its direct push was refused).
- Job branches: only by `mail jobbranch` (K4385); a force-push is never written (refused at K3977, K4384).
- Deploys to biosmoke8: by push to `deploy-test/biosmoke8/{dry-run,deploy}` (K4296); none yet this session.

## Open with Bob

The nine T52 decisions (registers and following the trail) on https://claude.ai/artifact/MAAk8ZpjRve5y7fkutHnjG; "All as recommended" or exceptions.
