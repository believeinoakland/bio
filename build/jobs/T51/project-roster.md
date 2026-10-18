# project-roster (T51)

**Status** · session_014aLWC4WN3XfDCb6R5QrKZf · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

QUESTION (R35): `projectInvitations` must name who invited the viewer, i.e. read `project_participants.invited_by`. That column is not in `membership` R120's stated read contract (columns: project_id, member_id, state, owner, owner_order, comment, created), and `membership.participation` (R74) answers only `{state, owner}`. I may not read an uncontracted column (R120: "No other column is part of the contract").
Best reading: BOB amends membership R120 to add `invited_by` to `project_participants` (the column exists and R118 writes it: `invite` sets `invited_by` = `by`; `rescue` sets it too). Until then I read it in my SQL join, and I will keep that one read in a single private helper so it is easy to re-point. Please confirm (or tell me to read it another way, e.g. a membership service). I carry on with R36, R37 and the rest of R35 meanwhile.

## Completion record (T51-12)

- **Entries applied:** R35 `projectInvitations` (`op=projectinvitations`; `invited_by` read in one SQL join, membership R120 amended by B2/K3838), R36 `projectList` `after`/`next`, R37 `member_id` on both `projectRequests` lists (R14, R26 amendments). A47 "Before you vote": nothing changed, as B1 note 3.
- **Deferred:** none.
- **Found in other modules (report to BOB):** `op-declarations` needs a spec for the new op `projectinvitations` (and `projectlist`'s new `after` parameter); the test "each T45 owner's map is served whole by the tables" (op-declarations) now fails on it. `plane` and `op-grades` likewise need the op's grade/route. Six other failures in the files that name my services (ACT_HELP, interface-shell, row-census, R53 stake screen, R54/R60) fail identically without my change (inherited).
- **Tests:** `node --test bio-plane/test/m/project-roster/`: 87 pass, 0 fail (new: `t51-invitations-paging.test.mjs`; ops.test.mjs, project-list.test.mjs expectations gain `next`). Checks: format 0 failures; architecture 0 failures; coverage project-roster 37 of 37; ownership 0 failures. `checks/run.mjs`: other modules' coverage failures only (agent-harness R17, agent-runner R36–R40, capture R96, journey-check R19, promotion R58), none mine.
- Size (session_014aLWC4WN3XfDCb6R5QrKZf): test runs 8, module lines 1,448

## J2 · COMPLETE

COMPLETE: R35, R36, R37 (R14, R26 amended) met; 87 module tests pass; format, architecture, coverage (37/37) and ownership checks show 0 failures. Report: op-declarations needs a spec for op projectinvitations (and projectlist's new 'after'); its test 'each T45 owner's map is served whole by the tables' fails until then; plane/op-grades likewise. Details in the record.
