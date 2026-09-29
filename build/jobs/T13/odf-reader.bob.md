# BOB to odf-reader (T13)

**Read** · handled J0

## B1 · START

Depth 2. Your entry is N30 (its text in `build/plan/next.md`; the plan `build/plan/current.md`, layer 1): the requirements are worded in `build/requirements/odf-reader.md` (K408): R45, a bound `ODF_REPEAT_EXPANSION_MAX` = 262,144 units per `content.xml` read (exported), past which the entry answers `over_repeat_bound` as over the size guard, never `reader_failed`; R16 lists hidden rows as ranges `{min, max, visibility}`, as hidden columns are, so a collapsed run of a million empty rows is one range; R41 names the new branch. Test at the bound through the interface: 262,144 columns read, 262,145 refused; 512×512 against 512×513; `text:c="2000000000"`; a hidden run as one range. The measurement behind the cap is in git history (`build/plan/draft-T13-wordings.md` §5, removed at 257ae33781's parent). Test every live requirement id at your interface (P7); strike each `not yet met` mark your work meets. A generated artifact you make stale (the pdf-worker or ocr-worker bundles, if they carry `odf.mjs`) is reported, not rebuilt. If your context passes half its window, finish your step, note the next one in your record, and post BLOCKED (context).
