# queue-producers (T41)

**Status** · session_017yeAgZAB9uGWeA15kp1VeV · depth 2 · WORKING · handled B0

## J1 · QUESTION

Two readings against D54, and one R11 flaw found in my own module. I carry on with each best reading below; none blocks the rest of the job.

1. **R29's restarted projects: "may see" or "may name"?** R29 names "the restarted projects the recipient may see". `actions` R59 answers those the viewer "may name" (R52: `FULL`, or an administrator's `EXISTENCE` of a hidden project), and `membership` R60 keeps DEC-113's hold notices reachable at `EXISTENCE`. Today this module re-gates `restarted` with `inSight` (`index.mjs` R29 producer), so an administrator outside a hidden project that a release restarts is not told that project's id. **Best reading (built): R-text as written, "may see" = `FULL` (with R11).** If you mean "may name" (the id at an administrator's `EXISTENCE`, never contents), that is an R-text change, yours: say so and I re-gate `restarted` by actions' answer for administrators only, with its test.

2. **R19, R29 "every administrator" for a hold on an action inside a hidden project.** `actions` R54/R59 list only actions the viewer may see, and the action is the project's contents, so an administrator outside a hidden project gets no item for it; an invited administrator, or a discoverable project, still does. My restated tests (`action.test.mjs` R16, R19, R29, each with the negative controls) hold that. **Best reading: correct under D54, tests only.** (membership R60's T42 mark, N833, is where holds' acts reach `EXISTENCE`.)

3. **R11 in R2's proposal findings (found, my module).** `proposalFindingItems` (`proposals.mjs`) mints an item per open proposal of `progressions.proposalsFeed`, read with no viewer, even when every instance's bundle is hidden from the viewer, and its `n`, `overdue_count`, `document_count`, grade and label count every instance. So a count can reveal bundles the viewer may not see (R11), for any member, not only since D54. A full fix changes what R2's published counts mean (each count per viewer, an item withheld when it has no visible subject). **Best reading: R11 binds, so withhold an item with no visible subject and count only visible instances.** That changes R2's counts, so I report before building it: shall I build it in this job (my reading), or do you defer it (N-entry)?
