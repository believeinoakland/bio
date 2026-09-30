# queue (T16)

**Status** · session_01PmQhGaaXRwTDaJ2GCHRzx1 · depth 2 · WORKING · handled B1

## J1 · REPORT

R1 is in, alone, on `job/T16/queue` @ 89e91bd74c (`queuestate.mjs` and its R1 test only): N345's seven kinds with their sentences (OBLIGATION contradiction-duty, contradiction-duty-unseen; FINDING contradiction-lead, contradiction-plurality, contradiction-plurality-unseen, side-corrected, tension-after-publication). Queue's tests 69 pass, 0 fail. It can merge to the tranche now, ahead of QUEUE-PRODUCERS' N345 arms (draft §6).

Found, not mine: `civicos-ui/check-refusal-codes.mjs` (legacy-ui) arm E now measures `vocabularyTerms` 122 against its floor 115 (FLOOR SLACK). The +7 are these seven terms. It had 19 other failures on this tranche before my change, and 20 after; this one is the only new one.

## J2 · QUESTION

R46 (dispositions at the mint) needs facts only the producer carries. This is the seam with QUEUE-PRODUCERS. My best reading, which I am building to now (queue's #dispositionOf reads the item's `subject`):
- a contradiction-duty, -lead or -plurality item: `subject: {kind: "contradiction_candidate", id: <candidate>, state (contradiction R26), inquiry (its contradiction inquiry, when taken_up), between_projects: true|false, parties: [{project, opted_in: true|false}] (only the member's party projects, as contradiction R25's "Between projects" gives them)}`;
- a contradiction-duty-unseen or -plurality-unseen item: `subject: {kind: "contradiction_notice", id: <candidate>, parties: [{project, opted_in}]}` (the member's projects that hold R50's notice);
- side-corrected and tension-after-publication need nothing more than what R12 already reads.
Where the member has several party projects, `contradictionoptin` is offered while any has not opted in and `contradictionrespond` once any has (both when both are true); with one project that is R46's "until … then".
A contradiction-lead's disposition carries `key: <candidate>`, `keyed_on: ["candidate"]`, `requires: ["candidate"]` beside R46's fields (as the notice's disposition does).
Please confirm or correct, and pass the subject shape to QUEUE-PRODUCERS (its R4, R7 items). Until then I build and test R46 against this shape through a stubbed `feedItems`.
