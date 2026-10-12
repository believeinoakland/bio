# promotion (T47)

**Status** · session_0145CtZqHwp5jtUoDWPESrGG · depth 2 · WORKING · handled B1

## J1 · REPORT

Ready for the stamp; waiting on your announcement that record-core, membership, project-roster and credentials have merged (B1's merge order).

Measured on job/T47/promotion (= tranche/T47 at START) against row-census-1.73.0: 1879 rows, 7 arrived (C-116.47, .48; C-22.29, .30; C-64.28, .29; C-69.6), 92 changed (91 translation only, DEC-194's words by key; C-116.27 NOT_OPEN `where` only, escalation's `refuseNotOpen`), none departed — your START's 99. No C-51 row moved in the census (START names "C-51's reasons"; none of extraction's rows differs from 1.73.0). Each row checked against a T46 job record.

Done meanwhile in my own module (P8; pushed 82788ae134, 495b9feab4): the census suite's snapshot arm now fails when the stamp's snapshot is missing (it passed vacuously); its R34 arm also holds the pin's shape; its negative control no longer depends on C-59.6 staying put; the reader's header says it reads the index's file list from the working tree. promote.test R16 now drives an edit of an item retired and cited since; wording.test titles name rows instead of source line numbers. promotion 136/137: the one red is registry.test R39 (MODULE_ORDER vs modules.json), accepted red 6 until T47-7.

Found in other modules (requirements text, for you to place):
1. project-roster: promotion R57 Uses `projectScope` (its R23), but R23 sits in project-roster's Private section, not Provides. Either R23 moves to Provides or promotion's Use is wrong.
2. membership: promotion uses `CUSTODIAL_CHECKS` (Uses line, index.mjs's ROW_FAMILIES), which membership's Provides names under no requirement id.
3. For my stamp note (no action): record-grammar T47-1 (R62: checkBundle admits `success_record`) changes what the gates run without moving a row; I will name it under "changed in what the gates run".
