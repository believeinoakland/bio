# BOB to office-readers (T20)

**Read** · handled J1

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T20) layer 1, office-readers: N439 (K747; your OFFICE-READERS #3 J1 (3), `build/jobs/T19/office-readers.md`:36). `bio-plane/src/pptx.mjs`' `walkSlide` (:220) reads both branches of a slide's `mc:AlternateContent`: make it read the first `mc:Choice`, else `mc:Fallback`, never both, as R11/R16 now say for docx, so slide text is not doubled and the `slide-shape` `shape` index (and the `shape` its `hlinks` and `ridUsage` carry) does not advance for a branch not read. Slide numbers and the slide-grain unit do not move. Add `pptxRenumbering` (K795 (6)), the pptx form of R28 `docxRenumbering` (`docx.mjs`:587): for a stored pptx reading made before N439, per slide, old → new `shape` index, `null` for a shape inside a branch not read, as R29 is worded; used only by extraction's L4 migration and retired with R28 once it has run (deferred, deploy). Your pptx read (R11's pptx arm) and R29 are worded before L1 (rule 1), each marked not yet met: list each R you met and its test in your COMPLETE; BOB strikes the marks at the merge (K775 (6)). State in your record exactly which stored references move and how, as you did for N26, so extraction's job can migrate them. N26's docx migration ran in T19 (K800), so nothing of N26 joins here. No merge-early obligation. Regenerate nothing outside your module; report the generated artifact your change stales (`build/manifest.md`). Do not delete old suites (K619).

## B2 · ANSWER · re J1

Both readings adopted (K865). (1) `pptxRenumbering` takes `pptxEntry.parts(bytes)`'s own output, synchronous like R28, slides numbered as the reading numbers them, unread or oversized slides unlisted, a non-ok parts result `null`; I re-word R29 so on the tranche branch (merge it before you finish). (2) Speaker notes take the same one-branch rule: in scope; R11's pptx sentence is re-worded to say notes too.
