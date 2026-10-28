# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #327 (`session_018Bhcee9DRsThq3toTorHkE`, depth 1, parent ROOT #10 `session_01XHjMEPkzmkLycoWtxb4yn6`; Bob's primary account) for BOB #328, 2026-10-28 ~01:45Z, at about 38 % of its window (refresh.md). No step is half done. **T53 round R1 is OPEN** (the one build round, K5567); **layer 1 is running** (layers 2-11 not started). Read whole: K5606, K5624, K5625, K5629, K5630, K5637 (`build/rulings.md`), `build/plan/current.md`'s Layer 1 blocks.

## Bob's direction now

- **One round, R1** (K5567). Work found goes to its module's open job, else a not-started layer's START, else the completion round.
- **The AI catalogue key ceremony waits for Bob** (Bob, 2026-10-27 ~23:10Z: "We can do the key ceremony when I get back."). The route is ruled (K5625): an offline page, `bio-plane/scripts/catalogue-keys.html` (signatures R57, met, K5634; SHA-256 87f1993cb4e726ecaed5d7101b05ef8ad018fe55cbea17496421e9c89738fcf5). When Bob is back: publish one rendered page with the download link, the SHA-256 and the plain steps of sitting 1 (the steps and the route's reasoning: `build/plan/key-ceremony.md`, a worker's draft BOB #327 reviewed; K5625 overrides it where they differ: the page is signatures' R57, built and met). The lines then replace the test lines in `CATALOGUE_KEYS` by a signatures change (open job or completion round), R50's test run. Sitting 2 (sign the seed) when ai-catalogue's seed payload exists (layer 2).
- Questions page https://claude.ai/artifact/SrK7xHyWMbW8TJntxkKzkv: **none open**. Watch it (`ArtifactComments watch`).

## Your takeover

`proc takeover --tranche T53 …` owes a `TAKEN OVER` message to me; I delete my routines (backstop `trig_01BDRanTbDWnBn4dNjWmggUR` and any later one) and reply. Before any merge in this checkout: `git fetch -q --deepen=2000 origin tranche/T53`, then `npm ci` where `node_modules` is missing (`build/situations/job.md`). A merge takes 2-10 min (bundles regenerate); run a batch of merges as ONE background command, and never write the tranche from this checkout while it runs (the merge's staged files are not yours to commit; the Stop hook names them "uncommitted").

## Process changes today (civicos-process main @ 11bfe29)

- PR #22 (K5606, RD35): `job complete` and `proc tests` regenerate the manifest's artifacts in the job's tree for the run and restore them; ownership ignores them; a merge conflict only in them takes the tranche's copy. Jobs never commit generated rows.
- PR #23 (RD36): `layer start --layer L --modules <m>` starts only the named modules of a started layer. Use it for a module given entries mid-layer, and for a job whose session was archived (`job route` alone does not owe a start: the create_session hook then refuses).
- Known quirk: after `job archived`, `job route` titles the successor `#1` (it counts sessions from the tranche's record); the hook allows only the printed title, so the session is titled "#1" and recorded `job started --name "<M> #2"`. Fix it in civicos-process when convenient (nextK should read the job branch's record).

## Layer 1: what is open, in order

Merged today: signatures (K5607, K5634), id-spaces, subresources, structured-text-reader, mail-reader, format-registry, doctypes (K5613, K5626), image-cover, doc-clean (K5615, K5632), pdf-worker, reader-container (K5617, 54/69, reds inherited), record-grammar, calc-grammar, odf-reader (K5621, K5631), legistar-reader, ocr-worker, image-codecs (K5627), file-scanner (K5633), office-readers (K5635), ooxml (K5636).

Open jobs (all live sessions; `proc status` for each):
1. **RUNTIME-LIMITS** (`session_018BhcegsnZTq6ndhV2RKA4f`): T53-511 sent: flip every reader row to its standard except `document.clean_bytes`/`part_bytes` (alpha, K5630) and `office.text_bytes` (standard 20 MiB; `streamed_text_bytes` 100 MB, K5637); fix ooxml's inherited R34 red. Merge it, then tell OFFICE-READERS "runtime-limits merged" (it then fixes its 14 fixtures, T53-537, and completes).
2. **OFFICE-READERS** (`session_018BhcegdvdcHawV5kVZ1wKW`): waits on (1).
3. **OOXML #1** (`session_018BhcedTff8SmCMqu2EScxc`): T53-524 merged (K5640; ooxml R39, K5641). Its R34 red is RUNTIME-LIMITS' to fix (item 1). Nothing owed.
   **MAIL-READER** (`session_018Bhcefa3SdZX44kR48Ukpf`): T53-525 sent (import ooxml's `readCfb`, delete `cfb.mjs`); merge when COMPLETE.
4. **READER-CONTAINER** (`session_018BhcedfcFpkDwfqT6uTLcn`): T53-538 sent (fleet-member files). After it merges, BOB runs `container-images.yml` for reader-container (K5120; never built in a session, K1898), records the digest (`node bio-plane/scripts/bundles.mjs --record-image reader-container ReaderContainer <digest>` per BUNDLER's note), then tells BUNDLER (`session_018BhcecEeYk8AL3QJSwTuwv`, WAITING) to move its own tests (fleetbundles lists, R35 image count 3→4, bundler.test.mjs:1084 class count). If enrolment cannot be green this round, its hard reason is the image publish (P19, a deployment); say so in a ruling.
5. **IMAGE-COVER**: merged with T53-513 (K5638). Nothing owed.
6. **PDF-READER** (`session_018Bhcefr6qakyreu8WK9cuR`): R51 sent (an `unresolved` entry names `over: "direct_object"`, K5641). When it merges, tell DOC-CLEAN (`session_018BhcedJp6SW8wmUGjgoTVP`) "pdf-reader R51 merged": T53-539 (its refusal states the bound).
7. **JURISDICTIONS #2** (`session_018BhcefMFW1bhVhh3w9sjUp`, titled "#1", sonnet): T53-6 (the four shipped layers), R127-R133, T53-14, T53-502; its four points answered (K5618). It is the biggest job left; if it blocks on context, archive and start its successor with `job archived` then `layer start --modules jurisdictions`.
8. **file-scanner**: R37 (a render fetches nothing, K5629) is met by its K5633 work but not struck (its Met named R36 only): strike it at its next completion, or as a wording edit with a ruling.

Then **layer 1 close** (`situations/merge-close.md`): first prune `build/tests-english-baseline.json` of every converted file's line in one commit (K5583 (2)). Jobs reported: setup-words word-list, text-chain 4 files, roster-reader, docprofile 4, bundler 3, file-scanner `on-own.test.mjs`, court-doctypes assess and readers, calc-grammar 2, record-grammar 2, legistar-reader, odf-reader 3, id-spaces, runtime-limits `runtime-limits.test.mjs: 2`, doc-clean `fixture-answers.test.mjs: 1`, doctypes (all its lines). Re-run the words check's `--baseline` to confirm each. The 8 transient format findings of K5578 (1) must be gone.

## Before each later layer's START (K5629's owed lines, BOB writes them)

- Layer 4: content R63-R64 from `build/plan/beta/planning/lines-A8-typed-page.md` (T53-529 waits on them).
- Layer 5: events, confirm N1259-c R38's keys of `followedRegister` (T53-530).
- Layer 6: reading-guides' line for jurisdictions R126's `attributionLacks`/`countedReview` (T53-531; the id R18 vs R19 is BOB's). Note R126's K5527 deltas (`countedReview`) are not yet in `build/requirements/jurisdictions.md`: fold them first (JURISDICTIONS #2's job carries R126 work if it is in its entries; else at its next CHANGE).
- Layer 9: filing-templates R15 and R35 reworded to cite jurisdictions R126 (T53-532).
- Layer 2 (from #326's handoff, still owed): take its requirement lines from `origin/bob/T53-req-l2-3` (c2614164) just before its START (K5571), review the owed drafts (sources R23, doorbell R31 `inboxView`, DEC-455 `previewmore` at capture's START), checks, `proc layer start --layer 2 --usage <status>`. ai-catalogue's `paths`/`tests` set at START (K5578 (1)); its seed signing `[waits: the key ceremony]`.
- U512-U519 (DEC-479 to DEC-486) merge with layer 3's first job (#325's handoff item 4, #326's).

## Lanes

PLATFORM #2 working (its folder merged at d908b67898; it will ask BOB to deploy plat-s1 steps 1d-1f: deploy per BOB #325's handoff item 5, `deploy-plane-only.mjs plat-s1`, account 20b5…7f72 only). JOURNEYS #4 idle: asks whether the walkers' leftovers on biosmoke8 are removed (BOB's: leave them until the re-walk) and a redeploy before its re-walk (after this round's fixes). PLANNING #5 stopped (L58). TESTS-SWEEP #1 archived (its civicos-process change is in main). AI-DESIGN, CAPABILITIES, FILES READY, nothing owed.

## Rulings today, mine (K5606-K5641)

K5606 generated artifacts in jobs; K5607-K5623, K5626, K5627, K5631-K5636 merges; K5618 jurisdictions' four points; K5624 the readers' rows (T53-510 is the entry; messages and ooxml's START named it T53-503); K5625 the key ceremony's route and R57; K5628 image-cover streams rows; K5629 layer-1 findings folded (format-registry wording, file-scanner R36/R37, entries T53-520 to T53-536); K5630 signatures' page path, doc-clean's rows stay alpha; K5637 reader bounds (office.text_bytes 20 MiB), office-readers fixtures (T53-537), reader-container enrolment (T53-538); K5638-K5640 merges; K5641 ooxml R39 (CFB export), pdf-reader R51, doc-clean T53-539.

## State worth knowing

- Models: haiku for test-only, sonnet otherwise, default for new modules.
- `proc status` QUIET or a job's silence: read it with `get_session` before acting (K506).
