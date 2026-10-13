# people (T47)

**Status** · session_01RqNJSwaQHYSnZPXzUrGVfv · depth 2 · RUNNING until 2026-10-13T21:11:32Z (users' tests (14 modules)) · handled B2

## J1 · QUESTION

R37, my readings of what the text leaves open; I am building on them now, and only an answer that changes one changes what I build.
1. **Questions.** A question names the entity when one of its resolutions (`entities` R35) has a `bundle_id` whose `object_type` is `inquiry` (record-core R37). Resolutions are keyed by a capture's bundle, so in practice this counts captures held in an inquiry bundle; a person fact's `question` (R9) is not counted.
2. **Projects.** A resolution's bundle names its project: `bundles.project` (record-core R34/R37), or the bundle itself when its `object_type` is `project`. A project counts only when the viewer sees it (`membership.inSight`); a hidden project is never counted or named.
3. **Sight of a mention.** A resolution counts only when `membership.hiddenBundles(viewer)` does not hold its `bundle_id` (R43/R88: one rule). Every resolution counts whatever its grade, `established` or reported defects (a name tied is a name tied).
4. **Newest added.** `newest_added` is the latest `register.registered` (provenance R48) among the visible captures naming the entity, or null when none is visible. `since` keeps rows whose `newest_added` is at or after now less 30, 90 or 365 days.
5. **Works on.** A project the viewer works on is one in which they are a participant in state `joined` (`membership.participation`, R74); invited, leaving or other states do not make `mine`.
6. **Today.** A person's `today` is each `holds` line (`lines`) valid on today's date, as `{line_id, title, capacity, office: {entity, label}, body: {entity, label} | null}`, `body` the office's `post_in` or `part_of` target. An organisation's is `{kind, sector, note}` (its registry note, "what it is"). `office` (the filter) is a body's entity id: a person is kept when one of those holds lines is to that body, or to an office whose `post_in`/`part_of` line goes to it. `q` matches, case-folded, a name or alias (`entities` aliases), or the label of an office or body in `today`.
7. **Cursor.** An opaque token encoding the last row's order key (`mine`, `newest_added`, entity id); the next page starts strictly after that key, so a page never skips or repeats a row.
No new `uses` edge: entities, lines, membership, provenance and record-core are already used.

## Completion (PEOPLE #6, T47)

**Entry applied.** T47-92: R37 `peopleDirectory` (`op=peopledirectory`), on J1's seven readings as BOB confirmed them (B2, K3106). Rows: the entities of kind `person` and of entities' organisation kinds (`institution`, `body`, `movement`). Offices and other kinds are never rows, and neither are the group's members. Counts and `newest_added` come from `entities`' `resolutions` (its R35) joined to record-core's `bundles` (its R37) and provenance's `register` (its R48). Sight is `membership.hiddenBundles` (R88), with projects through `inSight` (R80) and `mine` through `participation` state `joined` (R74). `today` is `{posts: [{line_id, title, capacity, office, body}]}` for a person: the `holds` lines held on today's date, each office's body from its `post_in`/`part_of` line. For an organisation it is `{kind, sector, note}`. The cursor is an opaque order key. The read writes nothing and has no new table. The op is served in people's own map only; its declaration, grade, help and route are L11's. **No new `uses` edge.**

**Code and tests read whole.** I read my requirements and my code (`index.mjs`, `checks.mjs`, `schema.mjs`) whole, and `fixture.mjs` and `reads.test.mjs` myself. A helper in this session read candidates, checks, facts, identity, invariants, recordedby and sight tests in full and wrote me a digest citing each test (mechanics §17 (3)). For the used modules I read only the services my Uses names: entities R35, R5 and R6, record-core R37, provenance R48, membership R43, R74, R80 and R88, lines `linesOf`. The design I read is DEC-203 and `people` in `mock-screens.js` on `claude/gallant-brown-zg0wc1`, read with `git show` and not edited.

**Improvements in my module.**
- The R21 test now includes the directory among the person reads that must never reveal a source link (`sight.test.mjs`).
- R27's ops-map list now names `peopledirectory`.

**Deferred: none.** Flaws noted, kept as they are:
- R7's `limit: 0` answers the default 50. R7 says 1–200 with default 50, so 0 reads as absent. That is defensible and differs from R36's clamp to 1; I left it.
- R29 and R32 are source-text tests (forbidden words, place names). They are invariants written that way by their requirements.

**Found in another module.**
- `affordances`' test "R12: each new module's op map holds exactly the ops graded for it" (`affordances/t33.test.mjs:147`) is now red. People's map serves `peopledirectory`, which no grade table holds yet. It turns green when L11's T47-48 grades the op (and T47-53, op-declarations R61, declares it). It is not mine to change; reported to BOB.
- `op-declarations/t38.test.mjs:76` is red on `tranche/T47` and green on my branch. It is unrelated to people; my change did not cause it.

**Tests and checks.**
- people: `node --test bio-plane/test/m/people/`: tests 53, pass 53, fail 0 (directory 7, sight 4 among them).
- The modules that use people (retrieval, calculations, strength, answers, corpus-export, ratification, case-disclosures, case-authoring, consequences, scheduler, affordances, notice-producers, op-declarations, plane, and migrate-released): tests 1943, pass 1916, fail 26. On `tranche/T47` it is also 26 fail. The fail sets are identical but for the affordances R12 red above (new, expected) and op-declarations t38:76 (base only). All other reds are inherited.
- `node checks/format.mjs`: 0 failures.
- `node checks/architecture.mjs bio people`: 12 product files, 0 failures.
- `node checks/coverage.mjs bio people`: 37 of 37 live ids named by a test, 0 failures.
- `node checks/ownership.mjs bio people tranche/T47`: 0 failures.
- `node checks/run.mjs`: format 0 failures, architecture 0 failures over 3083 files, channels 0 failures. Coverage has 44 failures, all other modules' (L11 not yet built); none is people's.

Size (session_01RqNJSwaQHYSnZPXzUrGVfv): test runs 9, module lines 2171

## J2 · REPORT

affordances' test "R12: each new module's op map holds exactly the ops graded for it" (bio-plane/test/m/affordances/t33.test.mjs:147) is red since people's map serves peopledirectory (R37), which no grade table holds yet; it turns green with L11's T47-48 (grade) and T47-53 (op-declarations R61). Not people's to change. Also: op-declarations/t38.test.mjs:76 is red on tranche/T47 and green on my branch, unrelated to people.
