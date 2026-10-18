# Strings jobs judged no member reads, for UX-DESIGN's `unkeyed` list (K3944, K3957)

BOB batches these into one HANDOFF per R layer close. Each: module, file:line, the string, why (the job's words).

## R1
- connection-grammar `bio-plane/src/connection-grammar/conformance.mjs`:93 "next repeats a page already read"; :110 "two identical calls gave different answers"; :116 "an item is answered on two pages"; :142 "the other viewer's pages are not the complete set less the fenced item"; :157 "an owner of hunch kinds names a hunch and its working inquiry in its fixture"; :170 "the fixture's hub node is not answered as a hub". Why: `ownerConformance` is the battery each owner runs in its own job over its own fixture (R9); never called by a member-facing read; its failures go to the job and BOB (CONNECTION-GRAMMAR #5 J2).
- doctypes `doctypes/index.mjs`:48 "the types are already registered here"; :58 "every type was already held by this registry". Why: the `why` of `registerDoctypes`, read by the composition root at wiring time; no member sees it (DOCTYPES #5 J5).
