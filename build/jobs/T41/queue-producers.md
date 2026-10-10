# queue-producers (T41)

**Status** · session_017yeAgZAB9uGWeA15kp1VeV · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

Two readings against D54, and one R11 flaw found in my own module. I carry on with each best reading below; none blocks the rest of the job.

1. **R29's restarted projects: "may see" or "may name"?** R29 names "the restarted projects the recipient may see". `actions` R59 answers those the viewer "may name" (R52: `FULL`, or an administrator's `EXISTENCE` of a hidden project), and `membership` R60 keeps DEC-113's hold notices reachable at `EXISTENCE`. Today this module re-gates `restarted` with `inSight` (`index.mjs` R29 producer), so an administrator outside a hidden project that a release restarts is not told that project's id. **Best reading (built): R-text as written, "may see" = `FULL` (with R11).** If you mean "may name" (the id at an administrator's `EXISTENCE`, never contents), that is an R-text change, yours: say so and I re-gate `restarted` by actions' answer for administrators only, with its test.

2. **R19, R29 "every administrator" for a hold on an action inside a hidden project.** `actions` R54/R59 list only actions the viewer may see, and the action is the project's contents, so an administrator outside a hidden project gets no item for it; an invited administrator, or a discoverable project, still does. My restated tests (`action.test.mjs` R16, R19, R29, each with the negative controls) hold that. **Best reading: correct under D54, tests only.** (membership R60's T42 mark, N833, is where holds' acts reach `EXISTENCE`.)

3. **R11 in R2's proposal findings (found, my module).** `proposalFindingItems` (`proposals.mjs`) mints an item per open proposal of `progressions.proposalsFeed`, read with no viewer, even when every instance's bundle is hidden from the viewer, and its `n`, `overdue_count`, `document_count`, grade and label count every instance. So a count can reveal bundles the viewer may not see (R11), for any member, not only since D54. A full fix changes what R2's published counts mean (each count per viewer, an item withheld when it has no visible subject). **Best reading: R11 binds, so withhold an item with no visible subject and count only visible instances.** That changes R2's counts, so I report before building it: shall I build it in this job (my reading), or do you defer it (N-entry)?

## J2 · REPORT

**queue's test fixture, made red by my R37 change (queue, T41-55).** R37 now reads `publishSchedule.scheduledEditions` directly (no type guard, the entry). `queue`'s world (`bio-plane/test/m/queue/world.mjs`:128) fakes `publication` but gives queue-producers no `publishSchedule` dep, so a member's read now reaches the real `publishScheduleOf(host)`, which builds the real `publication` and its users over queue's fixture schema and throws (`no such column: grade_source`, `leg-earning/schema.mjs`:162). Red with my branch, green without: `bio-plane/test/m/queue/action.test.mjs`:104 ("R8, R15–R18, R20, R21 (K728, K921) …"); queue's other 128 tests pass. The fix is queue's, one line in its world's fakes: `publishSchedule: { scheduledEditions: () => ({ ok: true, editions: [], limit: 500, cursor: null }) }`. Suggest it rides T41-55 (queue merges after me in L11), the red accepted by name from my merge until then. instance-setup's tests: 130/130 with and without my change. Plane: not run (rule 4 (20) holds plane tests red until T41-49).

## J3 · REPORT

**Two more of queue's tests, made red by K2581 (3) (queue, T41-55), adding to J2.** R2 now withholds a proposal finding with no instance the viewer may see (K2581). Two of `queue`'s tests fake a proposal with `n: 1` and `instances: []`, a shape `progressions.proposalsFeed` never answers (its R18: a proposal carries its instances; `progressions/index.mjs`:1312), so that proposal is now rightly no item:
- `bio-plane/test/m/queue/converts.test.mjs`:263 ("R6, R8 (queue): an OBLIGATION and a FINDING under one contract …"; its fake at :264–267);
- `bio-plane/test/m/queue/feed.test.mjs` ("R6: limit clamped to 1–500 …"; its fake at :13–16).
Green without my branch, red with it. The fix is queue's: give each fake proposal one instance in progressions R18's shape (`{progression_key, entity_id, grade, grade_determined, overdue}`) and a `progression_instances` row placing a bundle the reader sees (queue's world has the table, `world.mjs`:60), as my own fakes now do (`producers.test.mjs`, `proposals.test.mjs`). With J2's, three queue tests are red from my merge until T41-55: `action.test.mjs`:104, `converts.test.mjs`:263, `feed.test.mjs`'s R6 limit test; queue's other 125 pass. instance-setup: 130/130.

## J4 · COMPLETE

**Completion (T41-53).**

**Entries applied**
- (N823, K2438) R37 reads `scheduledEditions` from `publish-schedule` (its R4, read as the plane: `{after}` only), through a `publishSchedule` dep (`publishScheduleOf(host)`); the type guard that silently dropped the scheduled items is gone, so a provider without the read throws. `basis.source` is `publish-schedule.scheduledEditions`. Rule 4 (13)'s queue-producers share cleared.
- (N822, D54) `action.test.mjs` R16 (:104), R19 (:209), R29 (:280) re-stated: an administrator neither invited nor joined to a hidden project is told nothing of its contents; negative controls an invited administrator and the project set discoverable, each at FULL. Rule 4 (11)'s three cleared. `shared.test.mjs` run: green, it reads only as the `class:admin` machine credential, so none of its tests assumes an administrator's sight; unchanged. `docket.test.mjs` R30 gains the same D54 check.
- (K2581 (1)) R29's restarted projects as actions R59's "may name": FULL, or a hidden project an administrator sees at EXISTENCE (its id; its action stays withheld); a member at a discoverable project's EXISTENCE is not told it. Tested with both controls.
- (K2581 (3)) R2's new mark: each proposal finding's `n`, `overdue_count`, grade, kind and the cardinality group's `n`, `document_count`, grade, and their sentences, are counted over the instances the viewer may see (one `subjectsOf` bundle at least); a proposal or group with none is withheld. Tested directly (`proposals.test.mjs`) and through `feedItems` with D54 (`producers.test.mjs`), each with the every-instance-seen control. Two existing fakes given progressions R18's published instance shape (`grade`, `overdue`).
- Each new test was run against the code before it and fails there.
- Comments: D54's `hiddenBundles` note (R2 shared-question page) and R37's publication citations corrected.

**Marks met:** R37, R2 (K2581).

**Final `uses`:** unchanged: `publish-schedule` (R37) is already listed; `publication` stays (R23's `caseDocumentFacts`; case-tensions' provider is registered by publication, the `#caseTensions` getter).

**Deferred:** none.

**Found in other modules:** queue's tests, J2 and J3 (three reds from my merge until T41-55). No generated artifact made stale beyond the plane bundle (rule 4 (14)).

**Reading set (K2304).** Over 300 KB (code 228 KB + tests ~250 KB alone). Read whole myself: my requirements; layer 11's contract as the START and plan state it; `publish-schedule`'s public part and its `index.mjs` and `scheduledEditions`/`entryOf`; `membership` R13 terms, R43, R44, R60, R85, R88, its `sight`, `visibilityOf`, `reindexProjectSight`; `actions` R52, R54, R58, R59; `progressions` R18 and its proposal aggregation; the changed code (`index.mjs` :1–140, the R29 and R37 producers, `#actionPages`, `#bundleRedactor`; `proposals.mjs` whole); the changed tests (`scheduled`, `action`, `shared`, `world`, and the parts of `docket`, `feeditems`, `producers`, `proposals` I changed). Two workers read the rest in full: `index.mjs` and `proposals.mjs` (summary ~7 KB, every statement citing `index.mjs`/membership lines: each `#publication` read, every administrator-bound producer's gate, provider reads made without the viewer, silent `typeof` guards, defects), and the other 13 test files (~6 KB, citing file:line: ids per file, every assumption of an administrator's sight, the scheduled fakes, weak tests). What they found that mattered: the R11 count leak (J1 (3), now built) and R29's restarted gate (J1 (1)); nothing they left out bore on these entries. Noted, not this job's: `#wizardScripts.baseUpdates` has the same `typeof` guard (`index.mjs` R39 producer; wizard-scripts offers it, so it hides nothing today).

**Tests and checks**
- `node --test bio-plane/test/m/queue-producers/*.test.mjs`: 84 pass, 0 fail.
- Users: queue 125 pass, 3 fail (J2, J3, named); instance-setup 130 pass, 0 fail; plane not run (rule 4 (20)).
- `format`: 145 modules, 144 requirements files; 0 failures. `architecture`: 19 product files, 69 relative imports; 0 failures. `coverage`: 35 of 35 live requirement ids named by a test; 0 failures. `ownership` (tranche/T41): 10 files changed; 0 failures.

Size (session_017yeAgZAB9uGWeA15kp1VeV): test runs 17, module lines 3487
