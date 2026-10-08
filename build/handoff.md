# Handoff

**Status** · Replaced whole at each handoff; holds only where things stand and what comes next. Written by BOB #138 (`session_01HPS1DqHHqTRjKz5fiM8LfW`), 2026-10-08 ~09:30 UTC, for BOB #139. Read `build/rulings-active.md` first; this BOB's rulings are K2171–K2193.

## Open with Bob (each waits on him; none blocks the work)

All three questions are on one rendered page, https://claude.ai/artifact/TuYfyFijT6SayH1mBqSM21 ("T37 Questions for Bob"); re-watch it from your session (`ArtifactComments` watch) and point Bob at it.
1. **T36's close, step (3)** (§5.7 (3), §16). Fast-forwarding `main` to `tranche/T36`'s tip and merging `dist/cut-0.81.0` into `main` were refused before as "Merge Without Review" (K1454, K1906), approved once (K1909), pre-approved for BOB #136's session only (K2137); not on the standing list. BOB #138 asked Bob for the line in its session (K2171); no answer. Ask again in **your** session: "Approved: at T36's close, fast-forward main to tranche/T36's tip, and merge dist/cut-0.81.0 into main. Standing list: not added." Then record the approval (§16 form) and act; `archive/T36.md` stays `CLOSING` until `main` is at it. `tranche/T36`'s tip is `ceec200633` (the closing commit plus BOB #137's handoff and BOB #138's metrics row).
2. **Wizard library version 2** (wizard-scripts R22, Bob's approval; plan "For BOB" 1): four scripts ("Set up and claim", "Publication ceremony", "Check a claim", "Follow a proceeding"); recommendation: approve all four. Needed before L11's START (T37-25); a script unapproved then stays at version 1, named, and red 7 / red 31 stays.
3. **Photo metadata in published photos** (N779; plan "For BOB" 2): recommendation B (every published photo a metadata-free copy, the group keeping the original). Needed before L8's START; if unanswered, N779 stays in `next.md` with its reason.
4. **Key custody**, three questions on https://claude.ai/artifact/TB55RCpWXtBEWUanVnCA3A (no comments as of 09:30). Re-watch it.
5. **Weekly meter reading** for T36's close and T37's opening (asked).

## Where things stand

- **T37 is open** on `tranche/T37` (from `tranche/T36`'s tip, K2171; `main` @ `e08cd35ecb` untouched). 46 jobs in `plan/current.md` (folded at the opening with DEC-178, DEC-180–DEC-182, N775–N777; the census adds T37-47 and T37-48). L1 (6 jobs, K2180), L2 (3, K2186) and L3 (3, K2192) are closed: merged, regenerated, checked (format, architecture, coverage 4,227/4,227, channels: 0 failures), sessions archived, rows in `metrics/T37.csv`.
- **L4 is running** (K2193): READING-PIPELINE #8 `session_01NrApu29PkaxgKV2pTicqhV` (T37-9), EXTRACTION #16 `session_01Afy7CyYbu7EgvpPingjWAQ` (T37-45, test), CONTENT #15 `session_01NPBftQhCWzUZX1ASP6uBqi` (T37-10); STARTs posted (B1 each), started 09:28.
- **Prepared:** L5's STARTs (`plan/starts-T37/{events,standards,progressions,retrieval}.txt`); retrieval R74 and reading-pipeline R28 worded. Not yet: L6 onward STARTs and requirement wording (L6: capture-requests T37-47, skills, answers, agent-runner, agent-worker; L8's N757 shares are the largest: case-carriage, case-grammar, case-disclosures, public-read, case-checker, case-authoring, publication; write them with a worker's draft and BOB's review, as K2175 did for L2–L3).
- **Reds:** plan rule 6 items 1–17; item 17 is `plan/t37-red-census.md` (63 `test/m` reds on the tranche @ `4023b1e6e2`, 49 found unnamed, each with its owner and clearing entry, K2189). Host-governor's nine → N784 (T38).
- **Channel:** UX-DESIGN has not read B102 (BOB's QUESTION on the Photos step: gate, mark withdrawal, uncoverable formats; each with the reading L8 takes if unanswered). INVESTIGATION-DESIGN's `HANDOFF.md` unchanged at `f53cd6ffbe`.
- **`next.md` (T38):** N748, N751, N779 (Bob's), N780 (images where Containers pull: agent-runner's cut names `ghcr.io`), N781 (terms register: two unquoted paragraphs), N782 (image-codecs R1's table shape), N783 (membership at 3,970 lines: split before its next job), N784.
- Timers (delete mine by id at takeover): backstop `trig_016qnN8yCDJjVbtxRYkXKL8w` (09:31; re-arm while your start is pending), WATCH #138 `trig_0148yvzyRFgSpuYVWExVpifC` (10:11, into ROOT).

## Next steps, in order

1. Take over (§5.1): archive BOB #138, its `BOB-final` row under T37; arm your backstop and WATCH; re-watch both artifacts.
2. Ask Bob for the T36 close line (Open with Bob 1) and point him at the questions page.
3. Watch L4 (§5.4); merge each job (§5.5); close L4 (§5.6: regenerate in the manifest's order, checks, archive, rows); start L5 from the drafted STARTs.
4. Alongside (§5.9): L6's STARTs and requirement wording, then L8's (N757's shares; UX-DESIGN's B102 answer, if any, folded first).

## Process notes

- A layer close's regeneration can run in a separate `git worktree` (K2186) when the main checkout is busy; never symlink into an existing `node_modules` (link only where none exists), and remove the links before leaving.
- `mail.mjs addjob --name` needs a literal space (`"<MODULE> #k"`).
- A job's COMPLETE crossed by a BOB entry stays open until it reads it (K2176); a CHANGE re-opening a merged job is merged again (K2178).
- After a container restart: `npm ci --ignore-scripts` in agent-runner, `npm ci` in sheet-worker and file-scanner before `fleetbundles` (node_modules survived the one restart this session).
