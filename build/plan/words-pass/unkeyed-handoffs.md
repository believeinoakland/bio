# Strings jobs judged no member reads, for UX-DESIGN's `unkeyed` list (K3944, K3957)

BOB batches these into one HANDOFF per R layer close. Each: module, file:line, the string, why (the job's words).

## R1
- connection-grammar `bio-plane/src/connection-grammar/conformance.mjs`:93 "next repeats a page already read"; :110 "two identical calls gave different answers"; :116 "an item is answered on two pages"; :142 "the other viewer's pages are not the complete set less the fenced item"; :157 "an owner of hunch kinds names a hunch and its working inquiry in its fixture"; :170 "the fixture's hub node is not answered as a hub". Why: `ownerConformance` is the battery each owner runs in its own job over its own fixture (R9); never called by a member-facing read; its failures go to the job and BOB (CONNECTION-GRAMMAR #5 J2).
- doctypes `doctypes/index.mjs`:48 "the types are already registered here"; :58 "every type was already held by this registry". Why: the `why` of `registerDoctypes`, read by the composition root at wiring time; no member sees it (DOCTYPES #5 J5).
- court-doctypes `court-doctypes/index.mjs`:24 "no register function was given". Why: `registerCourtTypes`' wiring `why`, read by the composing code (COURT-DOCTYPES #2 J2).
- jurisdictions `jurisdictions/index.mjs`: the 102 plain strings left after JURISDICTIONS #14 J4 (the `detail` of each `validate` refusal, R10, and `combine`'s `NOT_A_LIST` detail, :1653). Why: read by the author of a place's profile data, who fixes the file; no member or installer screen shows them (R10 names the author as reader) (J3). The list: run `node checks/words.mjs <bio> jurisdictions`.
- roster-reader `roster-reader/lines.mjs`:24 (`NOT_NAME_WORDS`), :40 (`UNIT_WORDS`). Why: recognition vocabulary, word lists the reader matches against, not sentences (ROSTER-READER #3 J2).
- subresources `bio-plane/src/subresources.mjs`:402, the render companion's Content-Security-Policy string. Why: wire grammar read by the browser (SUBRESOURCES #5 J4).
