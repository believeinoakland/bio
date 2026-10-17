# queue-producers (T50)

**Status** · session_013oTX6cfuAxb88Kb1HEvjLd · depth 2 · COMPLETE · handled B1

## J1 · COMPLETE

Entries applied (T50-20): R41 (`project-invitation`, `OBLIGATION::project-invitation::<project>::<member>`, via `projectList`'s `participation: "invited"`, at most 50 in id order, age from her own `projectParticipants` row's `created`, the unnamed summary `queue.project-invitation.summary.unnamed`, offering `projectjoin`) and R42 (`project-request`, `OBLIGATION::project-request::<project>::<requester handle>`, one per open `projectRequests({projectId})` for each project the member owns, at most 50 in id order, to every owner, age from `asked`, offering `projectrequestanswer` with its two answers). Both are read in `feedItems` (R8), carry no project home, and every sentence is read by key through setup-words' `word`. New dep: project-roster (`projectRosterOf`, injectable as `deps.projectRoster`). Also: if project-roster's `project_join_requests` table is not migrated in a caller's world, R42 answers none (as R23 does for case documents).

Deferred: the member-facing English of R1–R39 (every older producer builds its summary and detail inline; words.json holds none of those sentences). Plan rule 6 says a sentence no key holds is a REPORT, not inline English, so I did not rewrite them; this needs the design lane's keys first, then a job per producer group. Not touched.

Interfaces I chose, for BOB to fold (not stated in R41/R42):
1. R42 "her own comment drawn as her own words": the item carries `quote: {by, text}` (null when she wrote none) apart from `summary`/`detail`, and the option `projectrequestanswer` carries `answers: [{answer: "grant"|"decline", label}]` (labels `screen.home.request.grant`/`.decline`). `queue`'s mint (R57) and `screens-daily` must pass both through; if they want another shape, tell me.
2. The inviter: `basis.inviter` is null until project-roster's `projectInvitations` (N1209, T51).

Found in other modules:
- project-roster: `projectList` has no cursor and caps at 200 projects, so a member invited past the 200th would get no item (published as `basis.bound.list_truncated` only). Also `projectRequests` answers the requester by handle only; a requester with no handle is skipped (R42 keys on the handle, which `projectrequestanswer` also takes).
- action-producers: 3 tests fail on `tranche/T50` already (R23 verbatim words, two R24 detail tests); not from this job.
- wizard-scripts and machinery-producers have not merged into `tranche/T50` yet (START asked me to merge after both); R41/R42 use neither, and I merged `tranche/T50` as it stands (e61d85a0de). Tell me if you want a re-merge later.
- The plane bundle and `program.mjs` are stale from this change (queue-producers is bundled into the plane): regenerate at layer close.

Tests and checks (from /home/user/bio; checks from civicos-process):
- `node --test bio-plane/test/m/queue-producers/`: 83 pass, 0 fail (new: projects.test.mjs, 8 tests; world.mjs gains the real project-roster, a `handle` option).
- Users' tests: `test/m/queue/` 153 pass; project-roster 78; machinery-producers 31; notice-producers 118; instance-setup places, host-governor holding, monitoring understanding 26: all pass. action-producers 50 pass, 3 fail (the same 3 before my change).
- `node checks/run.mjs /home/user/bio`: format 0 failures; architecture 0 failures; coverage: queue-producers named 30 of 30 live ids (the 25 failures are other modules'); ownership 0 failures.

Size (session_013oTX6cfuAxb88Kb1HEvjLd): test runs 9, module lines 3019
