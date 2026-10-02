# case-authoring (T23)

**Status** · session_0115DsBvkWjRDrABc4Ccc2CR · depth 2 · WORKING · handled B2

## J1 · QUESTION

R41's two interfaces do not exist yet (job/T23/case-grammar and job/T23/network-notices hold only their start entries), so I build R41 on this reading and finish it after merging tranche/T23 once both are merged (I merge last in L8 anyway):
1. network-notices is reached as `networkNoticesOf(host)` from `bio-plane/src/network-notices/index.mjs`, its instance answering `noticeReferenceOf(project)` → a notice id string or null (its R19). case-authoring reaches it lazily like its other deps (`deps.networkNotices` for tests).
2. case-grammar R10's "writer" is a pure export of `case-grammar/index.mjs` answering the front-matter line(s) for a reference (e.g. `workingOnLines(ref)` → `["working_on: <id>"]`, `[]` for null), placed directly after `case_project:`. If case-grammar offers only `isNoticeReference` and no writer, I write the one line `working_on: <id>` myself, only when `isNoticeReference(ref)` holds, and omit it otherwise (a malformed answer is treated as null and never written, since ratification R38 would refuse the document).
Please confirm or give the names the two jobs actually export. Nothing else in the job waits on this.
