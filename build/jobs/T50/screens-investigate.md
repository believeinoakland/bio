# screens-investigate (T50)

**Status** · session_013rCvroG5TmnM6uMv7dG6i7 · depth 2 · COMPLETE · handled B0

## J1 · REPORT

J1 REPORT (not blocking). (1) Composition: my base (tranche/T50 at START) holds the OLD wizard-scripts registry (no 'theme' screen, no owed aliaswithdraw) and interface-shell without R73, so interfacePage throws for the theme screen and for person's aliaswithdraw (R32). I test with an UNCOMMITTED local regeneration (build-data.mjs from the checked-in registry.json) and RE_POINTS edit, and will not commit either. My committed code composes only once wizard-scripts T50-17 (R41) and interface-shell R73 are merged into tranche/T50: please merge them first (they precede the screen jobs in L11's order) and send a CHANGE or RESUME; I will merge tranche/T50 then and re-run. (2) For others, found while building: no op serves the active profiles' proceeding_kinds (jurisdictions R51), so R36's kind choice reads affordances.vocabularies.proceeding_kinds when present and otherwise offers the four held kinds filtered by forum_kind (REPORT to affordances/jurisdictions); entities.namingDocuments candidates carry no page, so entity.naming.row is drawn only when a page is answered; the passage choice (form.choose.passage) has no selecting-words kit in interface-shell, so a chosen document means its whole-document extent until one exists. Continuing with tests.
