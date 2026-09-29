# control-plane (T13)

**Status** · session_01V4YD1GggxTVp7D89Qjz5po · depth 2 · RUNNING until 2026-09-29T18:15:38Z (node --test bio-plane/test/m/ (chunks)) · handled B2

## J1 · REPORT

N321 done and pushed (2ae7254e93). The op row, for affordances to account: `projectstage: { classes: ["admin", "member", "probe"], mutating: false }` in `bio-plane/src/control-plane/ops.mjs` (after `projectdirectory`); not in SESSION_OPS or NEEDS (a read). `viewer` stamped through `REC30_VIEWER_READS` in `src/control-plane/index.mjs` (the same list as projectvisibility/projectparticipants/projectrequests); forwarded to publication's existing store route `projectstage` (publication/index.mjs:3611). Interface test in `test/m/control-plane/doors.test.mjs` ("R2, R17 (N321)"). No hits in `civicos-ui/` or affordances' lists. Not yet in store.mjs `PROJECT_NAMING_READS` (publication R44 answers EXISTENCE itself); I weigh that with N333 when the table moves to dispatch.mjs. Starting N333.

## J2 · QUESTION

Q1 (edge). RECORD-CORE #7 J1's ask (MODULE_CHECK_FILES gains `src/record-core/checks.mjs`, so dec49Row("MINT_EXHAUSTED") reads C-59.6) needs a `uses` edge control-plane → record-core in `build/modules.json`; it is missing, and `checks/architecture.mjs` fails on it (control-plane/index.mjs and envelope.test.mjs). Best reading: add the edge (record-core is layer 2, no order issue); I have built it that way (with an R22 interface test) and will commit it; please add the edge on the tranche. Q2 (a finding, your call): capture's `src/capture/checks.mjs` holds CAPTURE_CHECKS.NOT_FOUND and NO_SUCH_KNOCK, which the door's DEC-49 reader does not read (capture is not in my uses either), so a forwarded refusal with those codes gets no code/check/translation (R22). Best reading: not mine to add now — `NOT_FOUND` is a generic code, and reading capture's row would put capture's sentence on every module's NOT_FOUND; it wants capture renaming its code or a ruling. I leave it out unless you say otherwise.
