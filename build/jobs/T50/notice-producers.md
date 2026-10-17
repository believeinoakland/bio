# notice-producers (T50)

**Status** · session_015nHCChy19TUHi4abRJbcsu · depth 2 · COMPLETE · handled B0

## Completion

**Entries applied.** T50-82 (N1204, DEC-238, K3635): R24 met. `noticeItems` gains `#watchedChanged`: `retrieval.browse({only: "watched", viewer})` followed by `next` (pages of 200) to at most 1,000 watched items; for each, her entry in `following.watchedBy(item)` gives the instant her mark was set, and the item is told only when `last_changed` is later. Keyed `FINDING::watched-changed::<item>::<last_changed>`; `label` `noticed`; to her alone; subject the item, homed through `homesAt`; `summary`/`detail` by `queue.watched-changed.summary|detail` through `setup-words` (`{what}` the title, `{date}` as R16's), with `summary_key` and `detail_key`. `NOTICE_KINDS` gains `watched-changed` (FINDING); `facts.watched_changed` states the bound and `truncated`; a browse or watchedBy that throws or answers `undetermined` or not ok is named `retrieval` or `following` in `facts.failed`. `retrieval` is a new `deps` entry (in `modules.json` Uses already).

**Tests.** New `watched.test.mjs` (7 tests, R24, each with its control): the document changed after the mark (one item, read again none new, a second change one more); change before or at the mark, another member's watch, another member's mark, a hidden document; each watcher by her own mark and the viewer asked; an entity's creation instant; sentences by key and a year named; the 1,000 bound across five pages with `truncated`; failures named, nothing written. `read.test.mjs` R1 test updated (kinds, `facts.watched_changed`); `fixture.mjs` gains the `retrieval` and `watchedBy` stand-ins.

**Deferred.** None.

**Found in another module.** Requirements file `build/requirements/notice-producers.md` still marks R24 `*(not yet met: T50)*`; BOB's to clear. Coverage fails elsewhere in the product (screens-settings, screens-wizards, site, translations and others, 26 modules in all) as the plan's rule 5 accepts; none is notice-producers.

**Ran.** `node --test bio-plane/test/m/notice-producers/`: tests 125, pass 125, fail 0. `node --test bio-plane/test/m/queue/` (uses this module): tests 153, pass 153, fail 0. `format: 171 modules, 170 requirements files; 0 failures`. `architecture: 16 product files, 89 relative imports (0 naming no tracked file, not judged); 0 failures`. `coverage: 1 modules, 24 of 24 live requirement ids named by a test; 0 failures`. `ownership: 5 files changed by notice-producers between tranche/T50 and HEAD; 0 failures`. `checks/run.mjs`: channels 0 failures; coverage 26 failures in other modules only.

Size (session_015nHCChy19TUHi4abRJbcsu): test runs 5, module lines 1499
