# reading-pipeline (T49)

**Status** · session_01GqCLDeeJthzed1vQ19Mi4Q · depth 2 · WORKING · handled B1

## Completion (T49-6)

**Reading.** Read whole: `build/requirements/reading-pipeline.md` (public and private), my entry (`build/plan/current.md` T49-6 and rule 6), the layer 4 header in `build/layers.md` (it has no per-layer contract section beyond the order and the amendments), all of `bio-plane/src/reading-pipeline/index.mjs` (the other two files, `hooks.mjs` and `readingprov.mjs`, are untouched and were not read), `acquisition`'s `profilesAsText` and the profile record (`acquisition/index.mjs`:105–114, 1320–1350), `formats.mjs`:130–200 (the HTML entry), `extraction`'s `indexUnits` (`extraction/index.mjs`:843–890, which takes these units unchanged), and the tests that name a requirement my entry changes (`read.test.mjs` for R1, R15, R22/R24; `fixture.mjs`; `hooks.test.mjs`'s first test and the tier-4 test in `transcribe.test.mjs`, for the scenario set). My other tests were run, not read.

**Measure first (START note 1).**
- Which captures reach R1's branch (`!wireable && textRead`): a single part, `profiled_from_text: true` (acquisition's `profilesAsText`: not multipart, at most `PROFILE_TEXT_MAX` = 8 MiB, and a declared type matching `text/*`, `application/xhtml+xml`, `application/xml`, `application/json` or `application/*+xml`), and a format entry with neither `text` nor `structure`. Of the 12 registered entries exactly two have neither: `html` (both null) and `zip`. `zip` is not a textual type, so it never has `profiled_from_text`. In practice the branch is therefore: HTML pages, and every other textual type no entry reads (plain text, JSON, XML, Markdown, and any text whose bytes detect as `undetermined`). CSV has `text` and is R2's.
- How many exceed the bound: the bound is exact, 8,388,608 bytes. An HTML or plain-text capture of more than that has `profiled_from_text: false` and takes R1's "not read as text" branch (`non-textual or too large`), with no reading attempted and now, as before, no units; a multi-part capture likewise. I could not count them in the live instance: it answers `NOT_AUTHENTICATED` to an unauthenticated read, as `capture`'s job found, and I looked for no credential. The count is a read of the held captures' `profile.profiled_from_text` and `capture.bytes` at biosmoke8, BOB's live walk. The figure that matters for the index is the other side of the bound: a captured page under 8 MiB gets units, capped by R15 at 512 KiB on the wire.

**Entries applied.**
- R32: `read`'s R1 branch now draws `text_units` from the decoded text through `textUnitsOfText` (new, exported), for every capture read as text with no entry that reads it, whatever the content type's reader answers. The paragraph is a run between blank lines; `para` counts the paragraphs from 0 (a run of no character is no paragraph); each is passed through `textUnitsFor`, so R15's cap, the 512 KiB wire bound, `truncated` and the named gaps apply unchanged. For an HTML capture (the detected format `html`) the text is first `visibleTextOfHtml` (new, exported): comments, `head` (its `title` included), `script`, `style` and `template` contents are dropped (an unclosed one to the end of the text), every tag is removed with its attributes (block tags end a paragraph, `br` a line), the source's own line breaks are no paragraph break, and character references are decoded last (named: 40 common ones; numeric, decimal and hexadecimal; an unknown name is left as written). Text counts (R17) and provenance (R14) are still over exactly the decoded text the reader was handed; the reading, its `entities` and `position_why` are unchanged; no format-registry entry was added. A text with no glyph, a capture not read as text, a PDF and an office capture answer as before.
- N1065 (R22): the two-name sample in `read.test.mjs` is replaced by `text-units.test.mjs`'s test, which composes the module's outward text over about forty branches (failures of every kind, tier 2's three stops, tier 3's member answers and loop notes, tier 4's every stop and a success, the provenance sentences, the hooks' refusals and the module's constants) and finds none of `jurisdictions`' full place list (each profile's `covers`, read through its `list`, with the "City of" and "County" forms).
- Rule 6: N1075 nothing to key (none of this module's sentences is keyed in `words.json`; its only hits are the brand name); N1068 the one "labelled" was a code comment (`index.mjs` R29), re-spelled "labeled"; the `admin` grep finds nothing in the module; N1073 `draft-T49-N1073-hand-lists.md` lists none of my tests; D29 not applicable (no screen).

**Decisions of detail, mine (for BOB's `rulings.md`, if BOB wishes).**
1. The HTML `head` (so the page's `title`) is dropped, as it is not visible text in the page. If Find should reach titles, say so and `visibleTextOfHtml` keeps the `title`'s text as its own first paragraph.
2. Only a capture whose detected format is `html` is stripped of markup. XML read as text (and the like) is cut into paragraphs as written, tags included, since the requirement names HTML only.
3. `pre` and other whitespace-significant content collapses its whitespace, like the rest of an HTML page.

**Deferred.** None in this module.

**Found in another module.**
- `extraction` (R22, its tests): the requirement's test list also names "Through `extraction` (`extraction/index.mjs`:727, unchanged) the capture's `capture_text` holds its words, and Find reaches them." That arm cannot be a `reading-pipeline` test (`extraction` is after this module, and `modules.json` gives my tests no edge to it). I proved the first half once by hand with a scratch test (not committed): an HTML capture read by `read` and handed to `extraction`'s promotion projection writes `capture_text` rows `{"kind":"doc-para","para":0,"run":null}` "Budget hearing" and `para` 1 "The council adopts the harbor plan." with `chain_kind` `undetermined`. Find's search over those rows I did not run. An `extraction` test of both belongs to its module (or `retrieval`'s), not to this job.
- The plane bundle (the generated artifact of `plane`, plan rule 5 (5)) is stale by this change to `reading-pipeline/index.mjs`, as BOB's layer-close regeneration expects; I did not touch it.
- The 19 coverage failures in `node checks/run.mjs` are other modules' ids (admission, affordances, agent-worker, ai-runs, control-plane, interface-assets, interface-shell, journey-check, op-capabilities, screens-*, setup-words, site), none this module's.
- `R32` still carries *(not yet met: T49)* in `build/requirements/reading-pipeline.md` and the Status line: BOB's to remove (requirements are BOB's).

**Tests and checks.**
- `node --test bio-plane/test/m/reading-pipeline/`: 120 tests, 120 pass (8 are new, in `text-units.test.mjs`: R32 HTML, R32 plain text, R32 with R15's wire, the no-glyph control, the not-read-as-text control, the R2 over-strictness arm, R32 with the content type's reader unchanged, and R22).
- The modules that use this one: `m/extraction/`, `m/content/`, `m/events/`, `d606-perpage-ocr`, `tier2-wire`, `system/pdf-worker-binding`: 382 tests, 382 pass.
- `node checks/format.mjs`: 170 modules, 169 requirements files; 0 failures.
- `node checks/architecture.mjs reading-pipeline`: 28 product files, 92 relative imports; 0 failures.
- `node checks/coverage.mjs reading-pipeline`: 32 of 32 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs reading-pipeline tranche/T49`: 3 files changed by reading-pipeline (now); 0 failures.
- `node checks/run.mjs`: format 0, architecture 0, channels 0; coverage 19 failures, none this module's (above).

Size (session_01GqCLDeeJthzed1vQ19Mi4Q): test runs 9, module lines 1724
