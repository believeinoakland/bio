# BOB to membership (T38)

**Read** · handled J4

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T38), layer 2, membership: T38-4 (N783; N793; K657, K1185), and rules 2 and 9. Read also K617, K624, K2186, K2249, K2270 and K2271 (their lines in `build/rulings.md`) and `build/plan/membership-split.md` (variant C1′ is the boundary).
Your requirements: `build/requirements/membership.md` (read whole); changed at this START, each not yet met: T38: thirteen ids retired "moved to `project-roster`"; R82, R96, R59 retired and split into R113–R115; R116 `onProjectInvited` and R117 `onProjectHidden` (two notice slots in R79's form); R118 `participationWrite`; R119 `memberByHandle`; R120 the read contract; R33, R45 through the slots; R83's note; R11, R36, R60, R75, R84, R111 re-pointed. Build R113–R120 first and push early: project-roster (T38-3) codes against them. Then, after project-roster merges (BOB tells you with a CHANGE), merge the tranche, delete your copy of what moved (its code, rows, tables' ownership as the study says, and the moved tests) and re-point any caller inside your module. Move nothing a test outside your `tests` uses as setup (the setup acts stay yours, K2270).
(K657, K1185) R83's `MODULE_ORDER` re-pinned to `modules.json` (project-roster directly after membership): `test/m/membership/module-order.test.mjs` (:16; a neighbour pin in `SINCE_T33` :52–57, the layer assertion :69) and `t9-notice-sight-bounds.test.mjs`:188 go green; this clears rule 6 item 4.
(N793; rule 9) `NO_SUCH_MEMBER` (C-64): give it its row (correct the comment at `checks.mjs`:264) and export the helper that answers it with its row; your own eight mints use it. credentials, tasks, setup-page, instance-setup and control-plane call it in their own jobs.
**P6:** 3,970 lines at the opening; about 3,300 expected after: report it.
Reading set (mechanics §17): measured at this START: 408 KB (own requirements 50 KB, the used modules' public parts 93 KB, code 265 KB), an over-estimate (it counts each used module's whole public part): read as mechanics §3 asks (each used module's Purpose and the services your Uses names). Measure that set, with your tests, first. At most 300 KB: read it whole and state so in your record. Over: (1) trim nothing; (2) no further split in T38; (3) read whole yourself your requirements, layer 2's row of `build/layers.md`, the code and tests your entry changes and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task, the requirements it serves and what follows; state in your record what you read whole, the summary's size and what it cites, and whether anything it left out mattered.
Merge order in L2: project-roster (copy) → membership (delete, R83) → credentials → promotion last.
Inherited reds: the plan's rule 6 list as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.

## B2 · ANSWER · re J1

Readings 1-3 stand (K2275). R121 written for noSuchMember (C-96.39; merge tranche/T38 to read it); instance-setup drops C-64.18 in T38-23. Merge order revised: you merge FIRST with R113-R121, N793 and R83, your copy of the moved acts still in place; COMPLETE as soon as that holds and push. project-roster then codes against you and merges; after it, a CHANGE asks you to delete your copy and re-point, and you complete again.

## B3 · CHANGE

(K2276, K2278) project-roster is merged into tranche/T38. Merge the tranche and do your second half: delete your copy of the moved acts, rows and tables (the study's C1' list; leave the setup acts R32-R36, R45), R114 (COUNT_KEYS loses projectOwnerVotes) and R115 (your purge declaration loses project_join_requests, project_owner_votes, project_owner_decisions: this clears project-roster's two figures-purge reds; run them). Also R6 and R7 as now written: NOT_AN_ADMIN first, before NO_SUCH_MEMBER and the other target facts (K2276: no one who may not act learns whether a member exists); re-pin t14-rows-remedy-order.test.mjs:198. Then COMPLETE again with your size.

## B4 · CHANGE

(K2279) Correction to R121: C-96.39 is already credentials' SIGN_IN_PAUSED (R38, since T35). Re-number your NO_SUCH_MEMBER row to C-96.47 (free across bio-plane/src) in this second half, comments and tests included; merge tranche/T38 for R121's corrected text.
