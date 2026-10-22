# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #250 (`session_01G6Txo7f9iCv4SnYdk5Zypv`, depth 1, parent ROOT #8 `session_01R3hvN64bYHG3vPQmYmaeLR`, secondary account), 2026-10-22 ~09:45 UTC, at about 40 % of its window, at a clean point (every job entry answered, every merge committed). **T51 is OPEN** on `tranche/T51`; **fix round 5 is running** (5 jobs live). Read `build/rulings-active.md` whole, then **K4529 to the last line** of `build/rulings.md` whole, then `build/plan/fix-round-5-T51.md` whole (sections 2b and 2c are this session's) and `build/plan/fix-round-5-step0.md` whole.

## Bob's direction today (in force)

- "the focus is on getting an alpha-level release deployed as efficiently as possible" (Bob, 2026-10-21; K4459, K4460). Weekly meter 53 % (K4516).

## What happened this session (K4529-K4539)

- Fix round 5 reviewed (K4530: E2's acquire half, E12, E13 added from PERFORMANCE read whole); three stale tests fixed by BOB (R117, R129 N5, R100). Step 0 read live (K4532): **the alarm's ledger is wedged since 05:57Z** behind INFO-2026-0111's reading row (E2 (d) confirmed); E14 added (Timeline lacked the events vocabularies); E9 put to Bob.
- 13 jobs started (K4531, K4532). **Merged:** publication, reading-pipeline (session kept open), affordances, screens-publish, acquisition, interface-shell, screens-intake, doorbell (K4534-K4539). Three more stale tests fixed by BOB (K4537); screens-intake `uses` gains test-support (K4538). N1264 (E10 (ii), the session fold) to next.md on a measurement (K4533).

## Running jobs (mail check; doorbell routine into each, K3686)

| job | session | state | waits on |
|---|---|---|---|
| PDF-READER #10 | `session_014rsq68z5SGk7R183eVVx8C` | WORKING | its own work: object table < 110 MB, R42's second term (B7, J4 ruled), E11 |
| CAPTURE #47 | `session_01VM4D7r3cUFZacyS8LqnGx2` | merging acquisition (B21) | E13 done; E5 call to `textTypeOf`, then COMPLETE |
| EXTRACTION #33 | `session_018SGhEZ3jJD7Da7xorwia8V` | WAITING (J15) | pdf-reader's merge for `c5b-memory` (B17); `defer=1` arm (B18); E1 repair (B19) |
| CONTROL-PLANE #47 | `session_01ScsNRTFgkShQFLDCyhHJBM` | RUNNING its seam test | B35 (J25 answers), B36 (E8 composition test from acquisition's 68845de064), B37 (acquisition merged) |
| PLANE #50 | `session_01AipmqTnUkdaqEHwuH2y95j` | WAITING (J27) | pdf-reader **and** extraction merged (reading-pipeline is), then its L run and COMPLETE (B35) |
| READING-PIPELINE #21 | `session_01SnD31Lo4LuZRr5JLS6rug9` | merged, kept | a CHANGE when pdf-reader merges: R42 re-measure table |

## Do next, in order

1. **Take over** (§5.1): archive BOB #250 once idle (row `BOB-final`, T51); delete its backstop `trig_01UopnBe8PUaHRFYoz4yvTkG` and WATCH #250 `trig_01Sa8cRbK5RQL4HLLS2qDrxA`; arm yours (a layer runs: backstop too); `node_modules` (K4113); `/home/user/cp-close` at civicos-process `prep/T51-close-v2` (`git worktree add`; use its `tools/mail.mjs`, which has `jobbranch`).
2. **On pdf-reader's merge:** CHANGE to EXTRACTION, READING-PIPELINE (R42 table) and, once extraction is merged too, PLANE. Merge order per plan §3: plane last, control-plane before it.
3. **E9** starts only on Bob's answer (open below): A → a job on screens-action hiding "Keep as a template" from those `filing-templates` refuses (`cs.can("templatesave")` is a class test today); B → filing-templates' rule changes; C → a requirement change (Bob's words) on filings and filing-templates. Record his words (K1762), post to lanes (K3082).
4. After every job: regenerate (manifest order), verify, checks, the whole suite in two halves, K4426's check per cause (a table like `k4426-check-T51.md`), **one redeploy** (K4296's route: `deploy-test/biosmoke8/dry-run`, then `deploy`), the targeted re-walk (plan §7 (3), brief like `walk-T51-rewalk4/BRIEF.md`; also Timeline (E14) and PERFORMANCE re-timing with `in-<route>` and `read_split`), one final pass. The live ledger (E2) must drain after the deploy: read `owedwork` first.
5. **T51's close** (§5.7): U448 then U449 merged into `main` first, `main` merged in, every module's tests, the close PR; the process PR from `prep/T51-close-v2`. Close audit: journey-check's older `not yet met: T51` marks (R20, R21, R23-R26, R28), case-disclosures R33, corpus-export R11, R12.

## Accepted reds, by name, until the act named

Promotion `row-census`; file-safety R24 and plane R24 `release.test.mjs` (stale design rows: U448's merge at the close); journey-check R17 (T52); extraction `c5b-memory` and doc-clean `measure` R4 until pdf-reader and extraction merge.

## Acts on main or sessions (reviewed acts, §5.8)

- `main` moves only by T51's close PR (§5.7 (3)), the design MERGEs U448 and U449 first (§5.7 (1), K1177); no refusal recorded. The process repository's `main` by PR at the close (K4275).
- Job branches only by `mail jobbranch` (K4385); never a force-push (K3977, K4384).
- Deploys to biosmoke8 by push to `deploy-test/biosmoke8/{dry-run,deploy}` (K4296's approval covers the T51 build; not refused at K4423 or K4520); none until round 5's K4426 points are checked (K4426, K4428).
- Sessions: archive each job at its merge (reading-pipeline after its R42 table); lanes' sessions are not BOB's to archive.

## Open with Bob

- **Who may keep a filing as the team's template** (E9; asked 2026-10-22 ~08:55): a member invited to a project but not yet joined prepared, approved and sent a records request, then was refused "Keep as a template". Options: **A (recommended)** joined members only, the button hidden from others; B anyone who made and sent the request; C nothing weighty (sending a filing included) until the invitation is accepted. No answer yet.

Lanes: AI-DESIGN A40, JOURNEYS W4, INVESTIGATION-DESIGN H43, PERFORMANCE P14 unchanged. Channel: UX-DESIGN through U449, nothing unread either way.
