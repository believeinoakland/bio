# cause-reading-t51 (T51)

**Status** · session_01SLQwf64sdkoxwxHo2cwjnj · depth 2 · COMPLETE · handled B0

## Completion

**Cause met: C19** (MAJOR), `reading-pipeline` R32 as amended by K4303 ("Landmarks of furniture"). The source named in CAUSES (`text-chain/textchain.mjs:854-866`) is stale: `visibleTextOfHtml` lives in `bio-plane/src/reading-pipeline/index.mjs`; `text-chain` needed no change and is unchanged.

- **Code** (`reading-pipeline/index.mjs`): `visibleTextOfHtml` now drops `nav`/`role=navigation` as before, then reads only the contents of every outermost closed `main` element (else every closed `article` element, in page order); with neither, it drops `header`, `footer`, `aside` and `role=banner|contentinfo|complementary|search` with their contents (nesting counted by the element's own name; an element with no end tag is not guessed at). Inside a `main` or `article` those landmarks are kept. Skip links and template tokens go as before. The reader still gets the whole decoded text, so R17 counts and R14 provenance are unchanged; `para` stays contiguous from 0 over the passages kept, so the units of a page read with its furniture are identical to those of its `main` read alone (a passage cited keeps resolving to the same words).
- **Tests** (`test/m/reading-pipeline/text-units.test.mjs`, R32): six new tests written first and seen failing (header/footer/aside + main yields main only; landmarks dropped without a region; kept inside article/main with nav still dropped; main over article, several regions, nesting; no-landmark and no-element controls; determinism and non-HTML untouched). Two existing R32 controls changed because K4303 changes them: words after `</main>` are no longer passages, and `role="banner"` is no longer kept (the control now uses `role="status"`).
- **Requirement file:** removed the "(not yet met: T51)" mark from R32 in `build/requirements/reading-pipeline.md` (K4210: a job writes its own lines; the ownership check lists this file, accepted at merge).

**Deferred:** none.

**Found / observations for BOB (no module changed):**
1. `subresources` R8 counts `role="main"`/`role="article"` as body regions; K4303's R32 names the `main` and `article` *elements* only, and I built it as written. A page whose body is a `div role="main"` with a site `header` outside it keeps that header's words. Aligning R32 to R8's roles is a one-clause change to the line and a few lines of code; BOB's call.
2. Citations resolve against the stored reading's units. A page read before this change and re-read afterwards is renumbered (K4194 already did the same for `nav`); `extraction`'s re-read has a mover for `docx` only. Stored readings are untouched until re-read.

**Tests and checks run (tranche tip merged, `fda6d6356a`):**
- `bio-plane/test/m/reading-pipeline/`: 143 tests, 143 pass, 0 fail. `bio-plane/test/m/text-chain/`: 130/130.
- Direct users of what changed (`extraction`, `events`, `content`) and the module's two legacy tests: extraction+events 283/283; content + d606-perpage-ocr + tier2-wire 144/144. (`impact.mjs` lists 108 modules through the transitive closure; none reads `visibleTextOfHtml`: it is exported only to its own tests.)
- `checks/run.mjs`: architecture 0 failures; words 0 failures; format 1 failure (`build/rulings.md:4298`, K4301's standing-list line: not mine); coverage failures are other modules' not-yet-met ids (reading-pipeline: 34 of 34 named).
- `checks/ownership.mjs text-chain,reading-pipeline origin/tranche/T51 job/T51/cause-reading-t51` (from `prep/cause-job-K4273`): 4 files, 1 listing: `build/requirements/reading-pipeline.md` (accepted, K4210).

Size (session_01SLQwf64sdkoxwxHo2cwjnj): test runs 9, module lines 3799
