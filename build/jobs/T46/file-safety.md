# file-safety (T46)

**Status** · session_01L9fT5LDwkBexXHHGqAyzH5 · depth 2 · COMPLETE · handled B0

## Working notes

**Reading (mechanics §17; K2032, K2053, K2083).**
- Read whole by me:
  - my requirements, `build/requirements/file-safety.md` (public and private);
  - all my code: `src/file-safety/` (`index.mjs`, `checks.mjs`, `formats.mjs`, `kinds.mjs`, `schema.mjs`);
  - all my tests: `test/m/file-safety/` (`fixture.mjs` and the nine test files);
  - my entry T46-7 and the "Rules at the opening" in `build/plan/current.md`;
  - layer 3's contract and the layer-3 sections of `build/layers.md`.
- Read by one helper in this session, whose digest cites each section: the Public parts of the 13 used modules (record-grammar, test-support, pdf-reader, ooxml, office-readers, odf-reader, file-scanner, record-core, membership, credentials, provenance, acquisition, capture). The sources stay binding.

**Entries applied.**
- **T46-7 (R42).** The six details now name "your group's Civicsmith", hold none of "copy", "instance", "plane" or "server", and still say what was not done:
  - `scanBatch` (R4): "Your group's Civicsmith has no virus scanner installed. No note was written."
  - `safeView` (R11): "Your group's Civicsmith has no safe-view maker installed. Nothing was rendered." (Before, it said nothing of what was not done; it now does.)
  - `renderBatch` (R12): "Your group's Civicsmith has no safe-view maker installed. Nothing was rendered."
  - `securityToolTest` (R29): "… no virus scanner installed, so no tool can be tested."
  - `requestSafeCopy` (R33): "… no virus scanner installed, so no tool can be asked."
  - `refreshReputationLists` (R41): "… no virus scanner installed, so no list was refreshed."
- Rows C-140.2 and C-140.13 are unmoved: code, number, `where` and translation. R8's `not_scanned: "SCANNER_ABSENT"` and R14's check `detail` stay codes.
- `checks.mjs`' comment over C-140.2 no longer says "beside this copy"; the header names R1–R42.
- New test `absent.test.mjs`:
  - R42: the six sites with no scanner bound, each with its code and row as before and its detail checked; the same through the routes; R8's and R14's codes unchanged; control: both rows pinned exactly; negative control: the old details match the refused words.
  - R42: with a scanner bound, no site answers either code.

**Found in my own module (P8).**
- `renderBatch`'s catch answers `RENDERER_ABSENT` ("The render queue could not be read. Nothing was rendered.") when its queue cannot be read, even with a renderer bound. The row's words then say no safe-view maker is installed, which is untrue. A fix needs its own code and row (as `DEEPER_CHECKS_UNREADABLE` is R36's), which is a requirement change. Deferred; asked of BOB in my REPORT. Its detail already meets R42.

**Found outside my module.**
- The plane bundle `bio-plane/dist/bio-plane.bundled.mjs` carries the old details; staled by this change (rule 5 (4); regenerated at the layer's close by BOB).
- No other module's source reads `SCANNER_ABSENT`'s or `RENDERER_ABSENT`'s details (grep over `bio-plane/src`).
- From the helper's digest:
  - Neither code is worded in any used module. DEC-149 applies to `detail` too (membership R112, credentials R48), which is what R42 asks.
  - `scheduler` R7 (`build/requirements/scheduler.md:49`) names both codes as a tick's answer; it reads the codes, not the details, so it is unaffected.
  - `odf-reader` R47 (the `active` list R6 and R14 use) sits below odf-reader's `## Private` heading, though its Status line names it as provided. That is a requirements-placement matter for BOB.

**Tests and checks** (on `job/T46/file-safety` after the change):
- `node --test test/m/file-safety/`: tests 55, pass 55, fail 0.
- Layer tests: none named in `build/manifest.md`. I changed no service another module uses (only the wording of a refusal's detail).
- `format`: 159 modules, 152 requirements files; 0 failures.
- `architecture`: 16 product files, 65 relative imports; 0 failures.
- `coverage`: 42 of 42 live requirement ids named by a test; 0 failures.
- `ownership`: 4 files changed by file-safety between tranche/T46 and HEAD; 0 failures.

Size (session_01L9fT5LDwkBexXHHGqAyzH5): test runs 1, module lines 4671
