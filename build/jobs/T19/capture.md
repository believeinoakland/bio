# capture (T19)

**Status** · session_01JMDXaCWfQTso3u1jkN2vbZ · depth 2 · WORKING · handled B2

## J1 · QUESTION

K787 (C-68.1 `EVIDENCE_STORAGE_NOT_CONFIGURED`): deleting the catalogue's row in this job breaks code that is not mine, measured at HEAD of `job/T19/capture`:
- `src/control-plane/index.mjs`:7 imports `INSTALLATION_CHECKS` by name from the catalogue, and `installationRow` (:378) reads C-68.1 from it for `storageAbsent` (`src/index.mjs`:66). Deleting the export is an ESM link error for control-plane and everything importing it; emptying the object makes `storageAbsent` throw (500) instead of answering 503 C-68.1.
- `test/m/publication/invariants.test.mjs`:82 and `test/system/d278-codeless-refusals.test.mjs`:62 read `CATALOGUE.INSTALLATION_CHECKS.EVIDENCE_STORAGE_NOT_CONFIGURED`.
- Holding the row in both places fails the DEC-49 guard's arm A (`civicos-ui/check-refusal-codes.mjs` `HELD_TWICE` is empty; legacy-ui's file).
- Also: `acquisition` (earlier than capture) raises `EVIDENCE_STORAGE_NOT_CONFIGURED` with no row (`src/acquisition/index.mjs`:298), and so does capture's own `pullKnock` (`src/capture/index.mjs`:589). By K78 (3) the earliest raiser is now `acquisition`, which cannot read a row held here.

My best reading, which I am carrying on with: I add C-68.1 to capture's table (id, translation, `where` unchanged: `src/index.mjs storageAbsent > is-storage-absent`) and make `pullKnock`'s refusal carry it, but do NOT delete the catalogue's copy in this job; the copy is deleted when control-plane re-points `installationRow` (rule 1: control-plane's last act), with `HELD_TWICE` gaining C-68.1 for that window (legacy-ui's edit, BOB's to route). If you would rather the row went to `acquisition` (earliest raiser) or that I leave C-68.1 wholly alone this tranche, say so; adding it here is the only part I will do before your answer, and it is one revertable hunk.

Question: (a) confirm or correct the reading above; (b) who makes control-plane's one-line re-point and `HELD_TWICE`'s entry, or should I instead leave capture's table without C-68.1 until then (avoiding the guard red)?
