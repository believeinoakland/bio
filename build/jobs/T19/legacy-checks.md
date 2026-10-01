# legacy-checks (T19)

**Status** · session_01BjfEuoaa6XVXhVaMbV2YC9 · depth 2 · WAITING ON BOB (J1) · handled B1

## J1 · QUESTION

Three points from the importer check, each with the reading I am working on now.

**Q1 · Two listed deletions still have a module-test importer in a later layer.** Measured on `job/T19/legacy-checks` @ 35d05bab1a, over every file importing the catalogue (named, namespace and dynamic imports):
- `MECHANICAL_FIELD_SETS`: `bio-plane/test/m/promotion/moved.test.mjs`:146 compares promotion's registry with `C.MECHANICAL_FIELD_SETS` (namespace import, :7). Promotion is layer 2.
- `VERSION_NOTICE_CHECKS` (C-80): `bio-plane/test/m/content/transcribe.test.mjs`:119–123 compares content's copy with `catalogue.VERSION_NOTICE_CHECKS` (dynamic import). Content is layer 4.

Deleting either fails a module test that is not mine to change. **My reading:** both are held under rule 1, like C-22 and the rest: promotion's L2 job and content's L4 job each drop their comparison and delete the catalogue's copy (both modules have `legacy-checks` in their `from`). I leave both in place and say so in my record. Every other name on my list has no importer outside the old suites and the generated bundles.

**Q2 · `isMachineMinted` overlaps record-grammar's move.** My entry deletes it (K653 BOB-1: no reader). record-grammar's entry moves "the machine-work labels (`CONTENT_MINTED_BY_PLANE` … `isMachineMinted`, …)", which names it as the end of the moved range. Once it is in record-grammar's paths I cannot delete it. **My reading:** record-grammar moves the range without `isMachineMinted`, and I delete it from the catalogue after record-grammar merges. Please confirm, or tell record-grammar. (`isSufficiencyClaimed` sits just before that range and is deleted now.)

**Q3 · Order of C-2.7 and the wrapper.** record-grammar removes `checkBundle` and its structural arms from the catalogue, and C-2.7's code sits between them. To avoid a conflicting merge, I delete C-2.7 and build the wrapper after record-grammar merges, as your START says for the wrapper. One correction to the list: the catalogue's `CONTENT_HASH_RE` is not C-2.7's alone. `correspondenceFindings` (C-2.10) also uses it, so it stays until action-grammar or actions takes C-2.10 (layer 9). It is not exported, so no importer is affected.

Done meanwhile, not yet committed: `SUGGEST_LEVELS`, `CIVICOS_CONTACT_URL` and `civicosUserAgent`, C-83 `RENDER_CAPTURE_CHECKS`, `DRIVE_CAPTURE_CHECKS` and `isSufficiencyClaimed` deleted, each leaving a one-line note. N437's three comments re-worded. Five stale `where`s fixed: C-28.13 now names `src/acquisition/index.mjs` (`awaiting stamp`), and C-32.1 and C-33.10–.12 now name `src/ratification/release.mjs`. N70's and N44's promotion rows already resolve: every promotion `where` names a live function and region.
