# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #239 (`session_016bEJoZvnY3TsPuvNxNZRDf`, depth 1, parent ROOT #8 `session_01R3hvN64bYHG3vPQmYmaeLR`, secondary account), 2026-10-21 ~09:10 UTC, at 52 % of its window. **T51 is OPEN** on `tranche/T51`; **fix round 2 is running** (wave 1 nearly done, wave 2 starting). Read `build/rulings-active.md` whole (§1 "How debugging runs", K4297, governs order), then **K4302 to the last line** of `build/rulings.md` whole, then `build/plan/fix-round-2-T51.md` whole (the round's plan, in force by K4303; BOB's changes are marked K4303 there and in the rulings).

## What happened this session

- Took over (K4302); the walk's findings files were already pushed, nothing asked of Bob.
- Planned fix round 2 from `walk-T51-build/CAUSES.md` (K4303): 92 of 96 causes in jobs; STARTs in `build/plan/starts-T51-F2/`. Requirement lines written before each job (K4303, K4307, K4308, K4309, K4310, K4312, K4316, K4317, K4319).
- 26 jobs merged and archived with rows (K4307–K4321): retrieval, case-disclosures, monitoring, cause-reading, cause-conclude, strength, public-read, case-authoring, review, queue-producers, queue, screens-entry, cause-assistant, screens-inquiry, citation, cause-action (twice), screens-daily, people, events, screens-investigate, cause-ocr, cause-halves, filings, cause-shell (twice), screens-publish.
- Added mid-round, each a hard cause found by a job: PEOPLE (C7), EVENTS (C54/C6 by captures, K4310), CONTRADICTION (`contradictionflag`, R61, DEC-394), WIZARD-SCRIPTS (registry re-take at 0310c4953d), CAUSE-HALVES (C41, C17), FILINGS (C65's real site), EXTRACTION (C17 re-read).
- **DEC-394 (UX-DESIGN U429) merged into the tranche** (K4311): drafts chooser and live review links (screens-publish, C49), project documents (screens-inquiry), requests for later and stored login (screens-intake), naming a subject and the contradiction flag (screens-inquiry). ACK B442. Item 2 (federal offices) is with Bob through that lane.
- CA24 diagnosed live (read-only): the founder's bare `admin` viewer; fixed in review (K4306).

## Do next, in order

1. **Take over** (§5.1). Archive BOB #239 once idle (row `BOB-final`, T51). Delete its routines: backstop `trig_011qoERrVJsyAsHpmUNYTr5y` (09:01Z, may have fired) and any later backstop it armed; WATCH #239 `trig_016hj2SnN6KvDPaLyG344M3u` (09:40Z). Arm your own.
2. **Read and merge the COMPLETEs waiting** (a haiku worker reads them, K4269): CAUSE-CAPTURE-T51 (`session_01GFqkWRF1arvd4PeKMk724o`, J2–J3; cause form: acquisition, capture, sources; past half its window, archive at merge; its J2 REPORTs: reading-pipeline `bytesOf`, provenance `captureGrade` batch, control-plane continuation document and 504 sentence, screens-intake `render_pending`/`file_name`/picker), CONTRADICTION #14 (J7–J8, R61), EXTRACTION #28 (J6), SCREENS-ACTION #11 (J13–J14; it had not read its START B19 when it posted: check it applied B19 before merging). Cause jobs: ownership in list form from `/home/user/cp-prep` (a worktree of civicos-process at `origin/prep/cause-job-K4273`; recreate with `git -C /home/user/civicos-process worktree add /home/user/cp-prep origin/prep/cause-job-K4273`).
3. **WIZARD-SCRIPTS #21** (`session_01JThqS87JjBveokSN6hH16A`, haiku) is in a long turn (no push for 44 min at 09:08Z): if still quiet at your first check, RESUME, then restart one model up. When it merges: CHANGE SCREENS-PUBLISH's C49 (DEC-394 (1)) to a new SCREENS-PUBLISH session, and the op-declarations t50 R73 red clears with CONTRADICTION's merge.
4. **Start the rest of wave 2** as their providers merge (STARTs in `starts-T51-F2/`, each naming its module's own branch and record; `-2` files are second jobs of the same module): screens-settings, screens-intake, screens-daily-2, screens-investigate-2 (need CAUSE-CAPTURE's C14 read); screens-inquiry-2 (needs WIZARD-SCRIPTS and CONTRADICTION for DEC-394 (3a, 3d, 3e)); control-plane (C15, C52, C12 and `interfacewords`' `v`, K4317); plus a SCREENS-PUBLISH job for C49 once the registry is re-taken. Each START has had BOB's additions (marked by K-number) appended above "Your causes": read them.
5. **Words batch to UX-DESIGN** (one HANDOFF when wave 2 opens, K4270: none holds a merge): the rows jobs asked for, listed in K4309, K4312, K4313, K4317, K4319 (scanner remedy, read N of M words, Opened {date}, web leg paragraph label, C58's flow/success, Matter choose/none rows, routes-none, queue keys, standards held and cut, contract choice rows, member-proposal label, `shell.member.unknown`, the Sign step's count line, "Published: edition N").
6. **After the waves:** the whole suite (two at a time, K4272), every generator in the manifest's order (ocr-worker's and agent-worker's bundles are stale; setup-words rows), `checks/run.mjs`; then the redeploy (rulings-active §1): **the scanner image first** (C84, plan §6: dispatch `container-images.yml` on `tranche/T51` (it is on `main`), write the printed digests into `fleet-member.json` and `wrangler.jsonc`, bundler R36), then push the tip to `deploy-test/biosmoke8/dry-run`, then `.../deploy` (each deploy needs Bob's approval in the refused session, rulings-active §2; not pre-approved for this session or yours); smoke; re-walk every cause's findings plus INFO-2026-0042 (re-capture: parts-only copies are not repaired, CAUSE-CAPTURE) and a live `op=capture` of a 21 MB PDF; then the final pass.

## Accepted reds, by name, until the act named

Plane R24 and screens-settings R39 (T52); journey-check R17 and its 13 walk-dependent tests; store-door R17 (hand-row deletion); promotion `row-census`; coverage's held ids (K4236) and the not-yet-met ids of the jobs not merged; op-declarations t50 R73/R21 (until CONTRADICTION and WIZARD-SCRIPTS merge, K4315); ocr-worker's 5 bundle tests (until the regeneration, K4316); interface-shell R23 (DEC-394's `drafts.newest` rows hold sample text: QUESTION B443 to UX-DESIGN, K4321); screens-publish R10 (until its C49 job, K4321).

## Running at handoff

CAUSE-CAPTURE-T51 #1, WIZARD-SCRIPTS #21, CONTRADICTION #14, EXTRACTION #28, SCREENS-ACTION #11 (addresses in the plan's Jobs line). Design lane: UX design #36 (`session_01N188yDWfxJHtvptW5hirUW`, same account; ring it after each post), B443 unanswered. Lanes' HANDOFFs unchanged (H43, A5, W4).

## Acts on main or sessions (reviewed acts, §5.8)

- `main` moves only by T51's close PR (§5.7 (3)), with the design stream's MERGE first (§5.7 (1), K1177); no refusal of either recorded.
- Each deploy to biosmoke8 and the `container-images.yml` dispatch: Bob's one-line approval in the refused session (rulings-active §2, K1715); none pre-approved.

## Open with Bob

- The exact P7 / mechanics §6b / §11 text for K4297 (stale tests fixed by BOB; red tests never gate a test-copy deploy), rendered: https://claude.ai/artifact/VTF21FrrPStmqXr4CSEoT8 (file `build/plan/proposed-stale-test-rule.html`); on his "I approve the stale-test text", apply it on civicos-process (a branch and PR at T51's close, as K4275) and record a K.
- Federal offices (C64): the design lane put it to Bob directly; its ANSWER follows his reply.

## Open for BOB (not Bob's)

- wizard-scripts' `wizards` declares `state` though its arm reads it from the query (K4230).
- Registry account labels to secondary at T51's close (K4251); `prep/cause-job-K4273` and `prep/words-arms-K4208` to the process repository's `main` by PR at the close (K4275).
- Small, for the close: case-authoring R77's not-reached minutes shape; `impact.mjs` lists `plane/r42-entry.mjs` as a test (K4320); notice-producers' duplicate notices (C69's live half) checked in the re-walk (K4308).
