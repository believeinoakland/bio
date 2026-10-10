# actions (T41)

**Status** · session_01To13zdek2Zn7rXSM6hPTP7 · depth 2 · WAITING ON BOB (J1) · handled B2

## Work (in progress)

- Reading set (mechanics §17): measured over 300 KB (START: 859 KB; `index.mjs` alone 203 KB, the tests 200 KB). Read whole myself: `requirements/actions.md`, layer 9's row and contract in `build/layers.md`, `src/actions/index.mjs` (3,108 lines), `t34`, `t27` and `fixture.mjs`, and the services my entry uses (membership R43, R44, R60, R77, R78, R85 and their code `sight`, `visibilityOf`, `existenceAct`; progressions R5 `readProgression`; intent R33 and `registerNoneExistsReader`; action-grammar R13; publish-schedule R1, R8; ratification's fixture). A worker read whole the rest (`schema.mjs` and `acts`, `write`, `read`, `t11`, `t12`, `t17`–`t20`, `t22`, `t33`: 158,771 bytes) and summarised it, citing file and line: the hold tables and `ACTIONS_TABLES`; no test there touches a hidden project or an administrator's sight; the registrations asserted at start (none counts them all); the records_request writes a `seeks` check must leave unchanged (it runs only when `seeks` is stated); the exact key sets and `where` regions to keep. Nothing it left out mattered.
- Suite at START: 95/96, the one red `t34`:219 (rule 4 (13), K2548).
- Done: R52, R56–R60 by "may name" (`#mayName`: `FULL`, or `EXISTENCE` of a hidden project, which membership answers only to an administrator neither invited nor joined); R60 already read no viewer's sight, now stated and tested. `t34`'s stub re-pointed to `w.schedule.scheduleEdition` (publish-schedule R1). New `t41.test.mjs` (7 tests, each failing against the FULL-only rule). Suite 103/103.
- Next: R70, R71 when action-grammar's CHANGE lands (J1, answered B2, K2552).

## J1 · QUESTION

R70/R71 against action-grammar R13 (T41-46a, not yet merged): R13 leaves two things to its job that my write must match: (1) the shape of `facts` that `seeksFindings(fm, facts, findings)` takes, and (2) the code of its row. My best reading, which I build on until your CHANGE brings the merged grammar: `facts` is what I read per distinct progression key through `progressions.readProgression({progressionKey})` — for each key `{found, stages: [stage_key…]}` (a key not held reads `found: false`, which is R70's "a progression it does not hold" finding); and I refuse with the first error finding's own `code`/`check` (whatever R13's row names it), carrying all findings, before any write. R52–R60 and the t34 re-point go ahead now; R70/R71 are wired when the CHANGE lands. If action-grammar's job settles a different `facts` shape, the CHANGE saying so is all I need.
