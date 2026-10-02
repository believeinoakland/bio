# affordances (T23)

**Status** · session_01BJL5mkZkgFmrfY1YKbQMsr · depth 2 · COMPLETE · handled B0

## J1 · QUESTION

`directorysubmission` (network-notices R23; in its op map `networkNoticesOps`, a read: "It sends nothing"). R32 names no grade and no `NON_ACTS` reason for it, and op-declarations R10 specs no `OPS` row for it, so as the requirements stand it is not in the control plane's table and my totality needs nothing for it. My best reading, which I have built: name it nowhere (R32: copy its words, invent none). If op-declarations or control-plane routes it with a `NEEDS` row, it reads `unpublished` until it has a `NON_ACTS` row; then I would add `directorysubmission: "read: …"` (the fields of a directory submission after publication, prefilled, keyed by (case, edition); sends nothing and writes nothing) on R7's general rule. Which do you want? Not blocking: the rest of the job is done on my reading.

## J2 · COMPLETE

Complete. Branch `job/T23/affordances` @ 2e22bd1a40 (from `tranche/T23`; nothing BOB changed since that I read).

**Entries applied** (`build/plan/current.md` T23 L11, affordances; B1): R32, by R7 and R27, R12's totality holding with it.
- `RUNG_ABSENT.whatchangedpropose`, ground `undetermined`, on R27's rule, as `templatepropose` (case-authoring R39).
- `RUNGS.noticepost` `attested` (network-notices R4, R24), as `caseratify`.
- `NON_ACTS`: `whatchangedpropose` and `noticepost` in R32's words, copied; the reads `escalationreasondraft`, `whatchangeddrafts`, `sweeps`, `noticeprepare` (writes nothing) and `notices` "read: …"; network-notices' public reads `activitymethod`, `noticespublic`, `groupkeyspublic` (its COMPLETE; K1150) "read: public, no credential". No new import.
- Tests (`catalogue.test.mjs`): a new R32 test with negative controls in the form of :853 (each op's rung or absence and ground beside its precedent; each reason as R32 words it; `unaccounted` over a table carrying the new ops answers nothing unpublished, unranked or stale; a misgraded op, a read carried ungated, an op carried by no row, and a new op left out are each seen). R2's `attested` list gains `noticepost`; R27's test keeps its count of 21 with `whatchangedpropose` beside it (R32); the T22 test no longer asserts the three N485 ops are named nowhere. A mutation (noticepost `reasoned`, a public read's reason changed) turns the R2 and R32 tests red.

**Open:** J1 (`directorysubmission`, named nowhere on my reading; not blocking).

**Deferred:** nothing.

**For other modules (REPORT):**
- op-declarations (R10): for the totality, the control plane's table must carry every op I name as gated, the reads included: a present `NEEDS` row (`null` for a read, as `heldcaptures`) for `escalationreasondraft` (R10 says "as `escalationstatus`", which has no row: it needs one now), `whatchangeddrafts`, `sweeps`, `noticeprepare`, `notices` and the three public reads, `contribute` for `whatchangedpropose` and `noticepost`. Until then `control-plane/totality.test.mjs` names exactly these ten stale (red 5).
- The plane bundle `bio-plane/dist/bio-plane.bundled.mjs` is STALE from my change to `src/affordances.mjs` (fleetbundles, red 12). Regenerated nothing.

**Tests and checks:**
- `bio-plane/test/m/affordances/`: 147 pass, 0 fail.
- Users: op-declarations 25 pass 0 fail; tasks 71/0; control-plane 113 pass 3 fail (`totality.test.mjs`:13 red 5, the ten ops above; `families.test.mjs`:47 K1150; `inbox-door.test.mjs`:81 red 9); plane 35 pass 1 fail (`worker.test.mjs`:39, red 6); queue 91 pass 2 fail (`catalogue.test.mjs`:34, :116, red 13).
- Whole `bio-plane/test/m`: 5184 tests, 5167 pass, 6 fail (exactly the six above, each accepted by name), 11 todo, 0 skipped.
- `bio-plane/test/system/fleetbundles.test.mjs`: plane bundle STALE (red 12).
- Checks: format 0 failures (87 modules); architecture 0 failures (13 files, 135 imports); coverage 32 of 32 ids named, 0 failures; ownership 3 files, 0 failures.

Size (session_01BJL5mkZkgFmrfY1YKbQMsr): test runs 11, module lines 3165
