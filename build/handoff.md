# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #328 (`session_018BhcefyAzc8476i2q7nQ5q`, depth 1, parent ROOT #10 `session_01XHjMEPkzmkLycoWtxb4yn6`; Bob's primary account) for BOB #329, 2026-10-28 ~03:35Z, at about 38 % of its window (refresh.md). No step is half done. **T53 round R1 is OPEN** (the one build round, K5567). **Layer 1 is closed** (K5663; its 38 sessions archived with their rows). **Layer 2 is running**: 8 jobs started 03:21Z, PROJECT-ROSTER already merged (K5665). Layers 3-11 not started. Read whole: K5645, K5657, K5663, K5666 (`build/rulings.md`), then `build/plan/current.md`'s Layer 2 and 3 blocks.

## Bob's direction now

- **One round, R1** (K5567). Work found goes to its module's open job, else a not-started layer's START, else the completion round.
- **The AI catalogue key ceremony waits for Bob** (Bob, 2026-10-27 ~23:10Z: "We can do the key ceremony when I get back."). Route ruled (K5625): the offline page `bio-plane/scripts/catalogue-keys.html` (signatures R57, met, K5634; SHA-256 87f1993cb4e726ecaed5d7101b05ef8ad018fe55cbea17496421e9c89738fcf5). When Bob is back: publish one rendered page with the download link, the SHA-256 and the plain steps of sitting 1 (steps and reasoning: `build/plan/key-ceremony.md`; K5625 overrides it where they differ). The public lines then replace the test lines in `CATALOGUE_KEYS` by a signatures change (completion round), R50's test run. Sitting 2 (sign the seed) once AI-CATALOGUE's seed payload exists (T53-75 `[waits: key ceremony]`).
- Questions page https://claude.ai/artifact/SrK7xHyWMbW8TJntxkKzkv: **none open**. Watch it (`ArtifactComments watch`; I registered a durable watch on it).

## Your takeover

`proc takeover --tranche T53 …` owes a `TAKEN OVER` message to me; I delete my routines (backstop `trig_01ATbm8Ev2jVL7mchEaVUBuP`, 04:03Z, and any later) and reply. In this checkout before any merge: `git fetch -q --deepen=2000 origin tranche/T53`, `npm ci` where `node_modules` is missing (`build/situations/job.md`), and **for a merge that brings a new lockfile** (a new fleet member), install that member's `node_modules` from the job branch's lockfile first (`git show origin/<jb>:<dir>/package-lock.json` into a scratch dir, `npm ci`, move `node_modules` in; K5659), else the bundles regenerate stale and the merge is undone. A batch of merges runs as ONE background command; never write the tranche while it runs, nor while a worker runs `proc` there.

## Process changes this session (civicos-process main @ 9665746)

- PR #24 (RD37, K5645): `proc merge --module <m> --with <m2>` merges jobs that must land together (each red alone) as one commit, each gated as if alone. Used for bundler + reader-container (K5658).
- PR #25 (RD37b, K5657): `proc job complete --with <m2>` tests a job on its branch merged with its COMPLETE partner's for the run only.
- Both certified by fixture (red on the old code), 258/258. Known quirk still open (from #327): after `job archived`, `job route` titles a successor `#1` (nextK should read the job branch's record); title as printed, record `--name "<M> #2"`.

## Layer 2: running (all sessions live; `proc status` for each)

MEMBER-ROSTER `session_018BhcefiiLZYzriCJJmrdXE`, RECORD-CORE `session_018Bhcefjn5o22km4fr7kbme`, MEMBERSHIP `session_018BhcefgcLdaAA53reT314Q`, AI-CATALOGUE `session_018BhceegGiraj92rsxu2cuC` (default model, new module), AI-ACCOUNTS `session_018Bhceei38Q79BHcdtVPMFz`, CREDENTIALS `session_018Bhceesg4XYzpL7ZX32uiC`, PROMOTION `session_018BhcegYHK2EwFjRJE5A3Md` (all sonnet). PROJECT-ROSTER (haiku) merged K5665; its session stays to the layer close.
- Answered (K5666): CREDENTIALS `aicredential` in AI_GRANT_OPS (carried to answers T53-548), R84's id `ca-officers` (acquisition T53-547), told "merge the tranche". AI-CATALOGUE check family C-156 (next new family C-157, BOB assigns), its START parameters as proposed: fold them into `ai-catalogue.md` when it merges (it names each in its record).
- RECORD-CORE T53-68 is `[waits: study S1-S4, Bob's decision]`; AI-CATALOGUE T53-75 `[waits: key ceremony]`: a COMPLETE leaving them unmet is right (name them in the round's report as P19 deferrals).
- Merge order: `modules.json` order, upstream first; promotion last in its layer (K1965). At the close: `proc layer close --layer 2`, then archive its sessions (a sonnet worker did layer 1's 38 in 5 min, one `proc job archived` at a time).

## Before each later layer's START (BOB writes these lines)

- **Layer 3**: its requirement lines from `origin/bob/T53-req-l2-3` (c2614164; capture, acquisition, doorbell, file-safety, sources, mail-door, provenance) applied three-way just before its START (`git diff <merge-base> origin/bob/T53-req-l2-3 -- <files> | git apply -3`), never earlier (K5377); review the owed drafts first: sources R23, doorbell R31 `inboxView`, DEC-455 `previewmore` (capture). U512-U519 (DEC-479 to DEC-486) merge with layer 3's first job, file-safety before doorbell.
- Layer 4: content R63-R64 from `build/plan/beta/planning/lines-A8-typed-page.md` (T53-529).
- Layer 5: events, confirm N1259-c R38's keys of `followedRegister` (T53-530).
- Layer 6: reading-guides' line for jurisdictions R126's `attributionLacks`/`countedReview` (T53-531; R18 vs R19 is BOB's). JURISDICTIONS met R126 (K5654): check its text carries K5527's `countedReview` before writing the line.
- Layer 9: filing-templates R15, R35 reworded to cite jurisdictions R126 (T53-532).
- Layer 11: plane T53-546 (g41 probe sized from `boundOf`, K5655).
- New modules in later layers: set `paths`/`tests` in `modules.json` at their START (K5578 (1)), as ai-catalogue's (K5663).

## Lanes

PLATFORM #2 working (its folder merged at d908b67898); it will ask BOB to deploy plat-s1 steps 1d-1f (`deploy-plane-only.mjs plat-s1`, account 20b5…7f72 only; BOB #325's handoff item 5). JOURNEYS #4 idle: the walkers' leftovers on biosmoke8 stay until its re-walk (BOB's); a redeploy before the re-walk after this round's fixes. PLANNING #5 stopped. AI-DESIGN, CAPABILITIES, FILES ready, nothing owed. Design channel: BOB's writer line is this session's (`mail.mjs xwriter`); unread U512-U519 (above). At 03:05Z nothing new from any lane.

## Rulings this session (K5642-K5666)

K5642 plan prune; K5643, K5644, K5647, K5651, K5652, K5654, K5656, K5658 (joint), K5660, K5662, K5665 merges; K5645 joint merge (RD37), the 85 % bar kept; K5646 reader-container's image row; K5648 xlsx.declared_text 25 MB (T53-540/541); K5649 entries; K5650 jurisdictions' two calls (R114 reworded) and its findings placed (T53-542 to T53-545); K5653 reader-container's image digest `sha256:c1422b26…250b`; K5655 office-readers R46 reworded, plane T53-546; K5657 job complete --with; K5659 English baseline lowered (688/1,846 to 649/1,692); K5661 file-scanner R16 reworded (scan bound from runtime-limits); K5663 layer 1 closed, layer 2's lines; K5664 plan prune; K5666 layer-2 answers.

## State worth knowing

- Models: haiku for test-only, sonnet otherwise, the default for a new module.
- reader-container's tests skip without 7z, ExifTool and libheif's codecs (15 of 73 here); skips are not reds.
- `build/plan/current.md` is near its 51,200-byte limit: move each closed layer's block whole to the archive at its close (as K5664).
