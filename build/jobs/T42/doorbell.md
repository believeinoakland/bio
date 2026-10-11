# doorbell (T42)

**Status** · session_01LUJMTyBUMuQMAruQweWeZp · depth 2 · WORKING · handled B2

## J1 · QUESTION

Two readings I am building on; I carry on with them unless you answer otherwise.

1. **R21's `where` while the rows stay in capture (K2609).** R21 says each row's `where` names the code in this module that raises it, and also (K2609) that until capture's delete the rows stay defined once in capture's `checks.mjs`, which doorbell re-exports. Re-exported rows cannot carry doorbell's `where`s without editing capture's file (not mine). **Reading:** in T42 the `where`s stay capture's (they still name capture's live copy of each raiser); the re-pointing is N851's, with the delete. My R21 test holds: `src/doorbell/checks.mjs` exports capture's row objects themselves (`KNOCK_CHECKS` is capture's object; `DOORBELL_CHECKS` names capture's four C-118 rows), each code, number and translation as the requirement's table states, and each of doorbell's raisers mints its row's code from the re-exported row inside a DEC-49 region of the same name the row's `where` names. Plan rule 4 (2)'s "doorbell's re-pointed `where`s" then do not occur in T42.

2. **R25's held declaration, whatever the build order.** If the host creates `doorbellOf(ctx)` before capture's `migrate()` (the plane builds capture at construction, line 329, and migrates it at boot, line 470), doorbell would declare the six tables first and capture's own `declareTables` would then throw `TABLE_DECLARED` and break the boot. **Reading:** doorbell's declaration first asks `capture.declareTables()` (capture's own idempotent method, which declares its tables once) and only then declares its own, so capture always holds them first while it keeps its copy and R25's held arm is the one taken, in any order. After T43's delete capture no longer lists them and the call declares nothing of doorbell's. It uses a capture method not named in capture's Provides; if you prefer, the alternative is a rule on the host (plane's L11 job) to create doorbell only after capture's migrate.
