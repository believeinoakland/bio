# control-plane (T13)

**Status** · session_01V4YD1GggxTVp7D89Qjz5po · depth 2 · COMPLETE · handled B2


## Completion (CONTROL-PLANE #4)

**Entries applied.**
- **N321** (2ae7254e93): `op=projectstage` declared in `ops.mjs` (`classes: ["admin", "member", "probe"]`, `mutating: false`), `viewer` stamped through `REC30_VIEWER_READS`, forwarded to publication R44's store route. Reported J1 for affordances.
- **N333** (881c24b76e, 4235c62a3d): the store's door is `src/control-plane/dispatch.mjs` again, as CONTROL-PLANE #2 built it (d2bbae2f75), on today's code: `dispatch(req, store)` (R26 body, route and envelope), `existenceRead` with `PROJECT_NAMING_READS`/`_NOT` (R27), `storeInternalError` (R25's store half), and the Durable Object class `Store extends` legacy-store's, whose `fetch` is the door. `src/index.mjs` (legacy-index) imports `Store` from there (one import line). Legacy-store keeps `routes(url, body)` (the map, returned); its frame, the two static tables, `#existenceRead` and the now-unused `#existenceAct` are removed (121 lines). Since K418/K421: `doAnswer` carries the store's correlation id only from a `STORE_INTERNAL_ERROR` reply with a UUID, and `storeSilent(op, correlation)` carries it (forward, `relayAnswer`, `reviewAnswer`). `projectstage: ["project"]` joins `PROJECT_NAMING_READS` (publication answers the same C-70.1 through the same `existenceAct`). R25–R27's `test.todo`s are tests (`dispatch.test.mjs`, `envelope.test.mjs` R25/R32). R25's `not yet met` mark struck in `build/requirements/control-plane.md`.
- **RECORD-CORE #7 J1**: `MODULE_CHECK_FILES` reads `src/record-core/checks.mjs` (edge added by BOB, K440); `dec49Row("MINT_EXHAUSTED")` is C-59.6; an R22 test drives every row of every file the door reads, and the forwarded decoration.

**Check rows for promotion to stamp (N318).** Added: **C-69.4 `STORE_INTERNAL_ERROR`** in `src/control-plane/checks.mjs` `DISPATCH_CHECKS` (`where`: `src/control-plane/dispatch.mjs internalAnswer > is-store-internal-error`), **awaiting stamp**. No row moved or retired.

**Ownership, for BOB's review.** `ownership.mjs` fails on one added line, `bio-plane/src/store.mjs:2851` `routes(url, body) {`: the route map's closures call legacy-store's private methods, so the map has to stay a method of legacy-store's class, and a method needs a header. Net legacy-store change: 1 added, 121 removed; legacy-index: 1 import line replaced.

**Found in other modules (reported, not changed).**
- legacy-tests (N333's re-anchors): `test/project-sight.test.mjs` 11g0/11g read `static PROJECT_NAMING_READS` from `store.mjs` source; the tables are now `src/control-plane/dispatch.mjs` exports (also `Store.PROJECT_NAMING_READS` on the exported class). Its behavioural arms pass. `test/d484-refusal-translation.test.mjs:125` floors `store.mjs` at 222,052 bytes; it is now about 213,100 (the frame left), so that floor needs re-pinning. Legacy suites that boot `src/index.mjs` are unaffected (`airun.test.mjs` checked: pass). A suite running `store.mjs` itself as its Worker script now gets a class with no `fetch`; point it at `src/index.mjs`'s `Store` or `src/control-plane/dispatch.mjs` (whose default export is the same forwarder).
- instance-setup (`src/setup.mjs` `instanceSetupStore`): its wrapper answers its own routes before `super.fetch`, so those routes pass outside R26's frame (no BAD_JSON, no existence read, no internal-error catch). Not a regression from this job; for BOB to weigh against R26 ("the routes are the modules' own maps").
- legacy-index (`src/index.mjs`): its own `storeSilent(...)` sites don't pass `out.correlation`. The answer is still R25-safe, but the operator's id is missing on those paths; a one-word improvement for its next job.
- capture: `CAPTURE_CHECKS.NOT_FOUND`/`NO_SUCH_KNOCK` are not read by the door (J2 Q2; N347).
- Generated artifact made stale: `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`, built from the plane's source), reported, not rebuilt.
- Requirements marks: R24's (D-679) and R19's last sentence (D-586) in the Status line look met by T12's work (R24's relay test, and R19's test driving the governance and identity acts at the mint); not struck here because this job's work did not meet them.

**Greps.** `projectstage`, `STORE_INTERNAL_ERROR`, `dispatch.mjs`: no hits in `civicos-ui/` or affordances' lists.

**Deferred.** None.

**Tests and checks** (after merging `tranche/T13` @ K440):
- `node --test bio-plane/test/m/control-plane/`: tests 45, pass 45, fail 0, todo 0.
- `node --test bio-plane/test/m/`: tests 2749, pass 2732, fail 0, todo 17.
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs control-plane`: 0 failures. `checks/coverage.mjs control-plane`: 34 of 34 live ids named, 0 failures. `checks/ownership.mjs control-plane tranche/T13`: 1 failure (`store.mjs:2851`, above).

Size (session_01V4YD1GggxTVp7D89Qjz5po): test runs 11, module lines 6,123

## J1 · REPORT

N321 done and pushed (2ae7254e93). The op row, for affordances to account: `projectstage: { classes: ["admin", "member", "probe"], mutating: false }` in `bio-plane/src/control-plane/ops.mjs` (after `projectdirectory`); not in SESSION_OPS or NEEDS (a read). `viewer` stamped through `REC30_VIEWER_READS` in `src/control-plane/index.mjs` (the same list as projectvisibility/projectparticipants/projectrequests); forwarded to publication's existing store route `projectstage` (publication/index.mjs:3611). Interface test in `test/m/control-plane/doors.test.mjs` ("R2, R17 (N321)"). No hits in `civicos-ui/` or affordances' lists. Not yet in store.mjs `PROJECT_NAMING_READS` (publication R44 answers EXISTENCE itself); I weigh that with N333 when the table moves to dispatch.mjs. Starting N333.

## J2 · QUESTION

Q1 (edge). RECORD-CORE #7 J1's ask (MODULE_CHECK_FILES gains `src/record-core/checks.mjs`, so dec49Row("MINT_EXHAUSTED") reads C-59.6) needs a `uses` edge control-plane → record-core in `build/modules.json`; it is missing, and `checks/architecture.mjs` fails on it (control-plane/index.mjs and envelope.test.mjs). Best reading: add the edge (record-core is layer 2, no order issue); I have built it that way (with an R22 interface test) and will commit it; please add the edge on the tranche. Q2 (a finding, your call): capture's `src/capture/checks.mjs` holds CAPTURE_CHECKS.NOT_FOUND and NO_SUCH_KNOCK, which the door's DEC-49 reader does not read (capture is not in my uses either), so a forwarded refusal with those codes gets no code/check/translation (R22). Best reading: not mine to add now — `NOT_FOUND` is a generic code, and reading capture's row would put capture's sentence on every module's NOT_FOUND; it wants capture renaming its code or a ruling. I leave it out unless you say otherwise.

## J3 · COMPLETE

N321, N333 and RECORD-CORE #7 J1 applied; record "Completion (CONTROL-PLANE #4)" has the details. Row awaiting stamp: C-69.4 STORE_INTERNAL_ERROR (control-plane checks.mjs). test/m/ whole 2732 pass, 0 fail, 17 todo; control-plane 45/45, no todos; format, architecture and coverage clean. ownership: one added line for your review, store.mjs:2851 `routes(url, body) {` (the route map calls legacy-store privates, so it stays a legacy-store method; net legacy-store +1/-121). For legacy-tests: project-sight 11g0/11g (tables now in dispatch.mjs) and d484 byte floor on store.mjs (now ~213,100 < 222,052). Stale: bio-plane/dist/bio-plane.bundled.mjs. Other findings (instance-setup routes bypassing the door frame; legacy-index storeSilent sites not passing the correlation) are in the record.
