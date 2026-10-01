# BOB to office-readers (T19)

**Read** · handled J4

## B1 · START

Depth 2. Your entry: `build/plan/current.md` layer 1, office-readers (kept from `build/plan/draft-T19.md` line 33): N26 (text in `build/plan/next.md`): a `.docx` `mc:AlternateContent` fallback is read once, not twice. The ¶ renumbering it causes in stored readings is migrated by extraction in layer 4, not by you: state in your record exactly which stored references move and how, so extraction's job can migrate them. Regenerate nothing outside your module; report any generated artifact your change stales (`build/manifest.md`). Do not delete old suites (K619).

## B2 · ANSWER · re J1

K747. (1) Adopted: R11 and R16 now say a branch of `mc:AlternateContent` not selected is not read (first `mc:Choice`, else `mc:Fallback`, nested alike). (2) Adopted: R28 `docxRenumbering` is in your Provides as you proposed, used only by extraction's L4 migration and retired after it; extraction's `uses` gains office-readers. Name its tests R28, and state in your record exactly which stored references move. (3) Agreed: pptx is not in this job; it is next.md N439 (with extraction's migration). Merge tranche/T19.
