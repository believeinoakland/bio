# promotion (T13)

**Status** · session_01JwRGiAAQuCSCteSnVJeMBi · depth 2 · WORKING · handled B1

## J1 · QUESTION

R50's census, my reading (legacy-tests' suite must compute the same digest, so I state it exactly; I carry on under it):
1. Files: every .mjs/.js under any module's `paths` in build/modules.json, except test files (a `test/` directory, `*.test.mjs`, `*.control.mjs`) and scripts that run when imported (`bio-plane/scripts/`, `bio-plane/migrate/`, `civicos-ui/check-*.mjs`). store.mjs, index.mjs and control-plane/index.mjs cannot be imported under node, and export no row table.
2. A table is an exported plain object. A row is one of its values carrying a string `check` matching /^C-\d+/. Its code is its key. A missing `where` or `translation` is null in the line.
3. Duplicates: one table object reached by two exports (a re-export) counts once, and one row object in two tables (connections' view of THEME_CHECKS) counts once. Two distinct row objects with one check id count twice: C-41.1–.15, held by ratification and the catalogue, and C-96.1 while membership and the catalogue both hold it.
4. Sort by check, then code, in plain JS string order (code units, not numeric). The lines are JSON.stringify([check, code, where, translation]), joined with "\n" and no trailing newline, then SHA-256 over UTF-8.
On tranche/T13 today (before record-core and membership) this gives 818 rows, digest daa4554642a8bd6a9b28b2d53903b3133191e62a03f756e85da3061b51c49af2. I pin it after both merge.
