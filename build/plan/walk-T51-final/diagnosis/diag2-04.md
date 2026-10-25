# Second diagnosis of the BROKEN rows of sittings 04a and 04b (K4426)

Read: both records whole (04a 86 rows, 2 BROKEN; 04b 106 rows, 15 BROKEN) and the 04b scripts. Product at `origin/tranche/T51` (cc72ed69b5), detached worktree; nothing in `/home/user/bio` touched. `fix-round-10-T51.md` read whole, `later-ux.md` searched.

Skipped (already in `diag-04.md`, same record, row, check): 04a R30 (d) heldat; 04b R39 refusals (7 MiB base64), R39 profile words, R39 title with the raw knock id, R39 "Already held" holder. Rows below are the other 12 BROKEN rows (04a 1, 04b 11).

## Table

| record / row | verdict | owning module | one-line cause |
| --- | --- | --- | --- |
| 04a R36 (221,376-cell workbook not refused) | SPECIFIED + WALKER-ERROR (stale figure) | workbooks (no change) | the bound is 250,000 cells (workbooks R20); the coverage row's old figure is stale; fix round 10 §1 R21(a) says no defect |
| 04b R40 `sourcepersonlinks` by `source` answers none | DEFECT | people | `source` is a stamp the door deletes from every query; the read takes `q("source")` |
| 04b R41 `sweepset` / `sweepratify` refused as "automated credential" | DEFECT (also hits the screen) | link-sweep | its `DECLARED_OPS` rows declare no `stamps`, so the door never stamps `author` |
| 04b R136 (a) removal flagged on first 404; R136 (b) redirect never read as "moved"; R137 refusing watch reads "scheduled" | SPECIFIED as built; REQUIREMENT GAP (doctrine decided, never written into monitoring) | monitoring | monitoring R4/R8/R32 say 404 = removed at once, redirects followed unseen, list states due/scheduled/unscheduled/ended |
| 04b R143 NO_HOME / `alarm_at` | ALREADY PLACED | plane / store-assembly / scheduler | fix round 10 §1 G5: R25 designed wait (not a defect), R28 |
| 04b R146 (a) authority tasks "unassigned, role group-admin" | DEFECT | tasks | `#routeTask` ignores the project the document is filed in (`bundleInfo().project`); only a project-type bundle or a `cites` edge counts |
| 04b R146 decide (issuer and basis in no read) | DEFECT against provenance R66 (member-visible reads stay stale `undetermined`) | provenance (+ the reads that show the register) | the decision lives only in `authority_decisions`, read by the C-18.9 check alone |
| 04b R214 (3 refusals with no `translation`) | SPECIFIED + WALKER-ERROR (read at the wire, not on the screen) | none | the screen draws `refusal.<CODE>` design rows that exist for all four codes |
| 04b OV-15 (words: "secret", "confidential", British spelling) | WORDS (one part ALREADY PLACED: later-ux.md:117) | UX design stream / setup-words | design-origin rows use "secret phrase", "Confidential", "recognised"; the overlay rule says otherwise |
| 04b R100 `actioncreate` accepted for a non-participant | DEFECT | actions | `actionCreate` promotes without `actorMemberId`, so promotion R53's participant check never runs |

---

## 1. 04a R36: a 221,376-cell workbook is not refused `WORKBOOK_TOO_LARGE`

Record line 85 (also D2). Saw: `addworkbook` of a 36,896 x 6 xlsx (1.8 MB) answered `ok:true`; the coverage row expected a refusal with count and bound.

**Verdict: SPECIFIED, and WALKER-ERROR (the row's figure is stale).**

1. Root cause. The bound is 250,000 cells, not 221,376. `bio-plane/src/read-bounds.mjs:157-160`: `/* the analysis workbook: its add holds up to 250,000 cells ... */ cells: same(250000, k("workbook", "cells"))`; `bio-plane/src/workbooks/index.mjs:45`: `export const WORKBOOK_CELLS_MAX = boundOf("workbook", "cells");`, refused at `:77` `cellsTooLarge(...) => refusal("WORKBOOK_TOO_LARGE", ...)` only above it. Requirement: `build/requirements/workbooks.md` R20 "An analysis workbook is held whole, up to 250,000 cells". `fix-round-10-T51.md` §1 G4/G6 line: "R21(a) is no defect (the bound is 50 MiB); R21(c) and R34 are re-walk asks (a 250,001-cell xlsx by the default recipe ...)". The walker's own note says it "did not try 250,001 cells". The row to run is 250,001 cells.
2. Tests: they exist and pin the boundary: `bio-plane/test/m/workbooks/g137e.test.mjs:69` (250,001 cells refused with count and bound, nothing written), `g44-large.test.mjs:55`.
3. Failing-first test: none to add (behaviour correct). The corrected walker case is the 250,001-cell xlsx through `addworkbook` at the door (re-walk ask, already placed as R21(c)).
4. Owner: `workbooks` (no change). Placement: ALREADY PLACED as fix round 10 §1 "G4 and G6 placed (K5056)": R21(a) no defect, R21(c) re-walk ask. Platform: none.

---

## 2. 04b R40: `sourcepersonlinks` read by `source` always answers none

Saw: by `source` `{"ok":true,"count":0,"links":[]}`, by `person` `count:1`, for the member on the sight list. Script `s-r40.mjs:133`.

**Verdict: DEFECT.** The walker sent the read the way the requirement describes it; the screens do not send it (no `sourcepersonlinks` in `screens-*`), so there is no screen defect, but any caller of the door is affected.

1. Root cause. `bio-plane/src/people/index.mjs:1843`: `sourcepersonlinks: () => p.sourceLinksOf({ source: q("source"), person: q("person"), viewer: q("viewer") }),`. The door deletes `source` from every query before the store sees it: `bio-plane/src/control-plane/index.mjs:649-650` `const QUERY_STAMPS = Object.freeze(["viewer", "identity", "author", "by", "actor", "who", "origin", "administer", "aiCred", /* T35 (R58): who is calling, the door's alone (admission R21) */ "source", "country"]);` and `:1391` `for (const k of QUERY_STAMPS) inner.searchParams.delete(k);` (set again only for an op that declares `source` as a stamp, `:1415-1416`; `sourcepersonlinks` does not). So `q("source")` is null, and `sourceLinksOf` (`people/index.mjs:1496-1499`) with `source` and `person` both empty takes the `: []` arm: `const rows = filled(source) ? ... : filled(person) ? ... : [];` and answers `{ok:true,count:0,links:[]}`. The sibling source ops read `q("source_id")` (`bio-plane/src/sources/index.mjs:819` `sourcerung: () => s.rungOf({ source: q("source_id") ?? b.source, ...`). Requirement: `people.md` R21 "`sourceLinksOf({source | person, viewer})` (`op=sourcepersonlink`)": a read by source is specified. The same read also answers an empty list rather than a refusal, so a caller cannot tell the argument was lost.
2. Why tests missed it: `bio-plane/test/m/people/*.test.mjs` call `sourceLinksOf({source})` on the module directly; nothing sends `op=sourcepersonlinks&source=...` through the door, where the strip lives.
3. Failing-first test: through the door, with a signed-in member session (`bio-plane/test/m/control-plane/r8-kit.mjs`, a new file `bio-plane/test/m/control-plane/r39-sourcepersonlinks.test.mjs`): `entitycreate` a person, `sourcepersonlink {source, person, evidence, sight:[member]}`, then `GET op=sourcepersonlinks&source=<SRC-...>` as the listed member must answer `count: 1`; as an unlisted member `count: 0` (control). Red now (count 0).
4. Owner: `people` (`bio-plane/src/people/index.mjs:1843`; also declare the read's `fields` with the new name, op-declarations R80 row). The new argument name (`source_id` as sources has it) is BOB's detail ruling. Uses `sources`, `entities` (not the platform). Platform: none (Node and Miniflare).

---

## 3. 04b R41: `sweepset` and `sweepratify` refuse every member as "an automated credential"

Saw: `MACHINE_CANNOT_SET_SWEEP "Only a named member defines or ratifies a sweep, and this came from an automated credential."`, `sweeps` lists 0. Script `s-r41.mjs:117` (the owner's member session).

**Verdict: DEFECT.** The screen sends the same act the same way, so the member's "Define a sweep" (`screens-intake/watching.mjs:104`, `:201` `op: "sweepset"`) and the ratify press always show the machine refusal words (`watching.mjs:202`, `:206`).

1. Root cause. `bio-plane/src/link-sweep/index.mjs:83` reads the actor from the query: `sweepratify: () => s.sweepRatify({ sweep: b.sweep ?? null, ratified: b.ratified, author: q("author"), viewer: q("viewer") }),` (and `:81-82` `sweepset` likewise). The gate `bio-plane/src/link-sweep/sweep.mjs:564-565` refuses an empty author: `const who = typeof author === "string" ? author.trim() : ""; if (!who || isMachineIdentity(who)) return { refusal: sweepRefusal("MACHINE_CANNOT_SET_SWEEP", ...` The door stamps only what an op's declaration lists: `bio-plane/src/op-declarations/declared.mjs:74` `export const stampsOf = (rec) => (rec.stamps ? [...rec.stamps] : rec.classes === null ? [] : ["viewer"]);` and `op-declarations/index.mjs:1534` builds `OP_STAMPS` from it for owner-declared ops. link-sweep's rows (`link-sweep/index.mjs:98-103`) are `sweepset: { classes: ["admin", "member"], machineClasses: [], mutating: true, needs: "contribute", weight: "reversible", ... fields: {...} }` with no `stamps`, so the default is `["viewer"]` and `author` (deleted from the caller's query by `QUERY_STAMPS`, `control-plane/index.mjs:1391`) is never set. The sibling written the same week states it: `bio-plane/src/monitoring/index.mjs:3352` `namedrequestset: { ..., needs: "contribute", stamps: ["author", "viewer"], ...`. Requirement: `link-sweep.md` R13/R14 (member session; `author`, `viewer`). 2. Why tests missed it: `bio-plane/test/m/link-sweep/contracts.test.mjs:54` builds `new URLSearchParams({ op: "sweepset", author: "member:alice", viewer: "member:alice" })` by hand, handing the arm the stamp the door would never have supplied; `sweep-write.test.mjs` calls `sweepSet({author})` direct; `declared-ops.test.mjs:36-54` checks `accepts`/`requires`/`needs` only, never `stamps`; `bio-plane/test/m/plane/sweep.test.mjs:101` checks only the arm names.
3. Failing-first test: `bio-plane/test/m/control-plane/r41-sweepset.test.mjs` (through the door with a member session and `r8-kit.mjs`): `projectcreate`-owner session posts `sweepset` with the walker's body and gets `ok:true` with a minted sweep id; `sweeps` lists it with `ratified:false`; `sweepratify {sweep, ratified:true}` by the owner answers `ratified:true`; control: the same call with a machine credential is refused `MACHINE_CANNOT_SET_SWEEP`. Red now. Also a link-sweep unit: `DECLARED_OPS.sweepset.stamps` and `.sweepratify.stamps` equal `["author","viewer"]` (R15).
4. Owner: `link-sweep` (`bio-plane/src/link-sweep/index.mjs:98-103`, add `stamps: ["author", "viewer"]` to both rows; op-declarations R81 needs no hand row because the ops are owner-declared). Screens unchanged. Platform: none. Not placed in fix round 10 or later-ux (grep: `sweepset` appears nowhere there). The registry's "sweepset owed (DEC-382)" does not excuse the refusal.

---

## 4. 04b R136 (a), R136 (b), R137: removal, redirect and refusal are read more crudely than the architecture decided

Rows: R136 (a) "removal noticed after the confirmation window and flagged as possible concealment"; R136 (b) "moved behind a redirect reads 'moved', not 'deleted'"; R137 "a watch on the refusing address shows refused with the reason and stays due". Saw: first 404 -> `removed`, `reeval_raised`, Queue `source-removed` at once; a 301 to the same bytes -> `unchanged` with no word of a move; a 403 tick -> status null, the list item `{"state":"scheduled", ... "next_at":"2026-10-26T15:03:05Z", "last_checked":...}` with no reason.

**Verdict: SPECIFIED as built; REQUIREMENT GAP (BOB's).** The code follows `monitoring.md` literally; the walker's expectations come from the architecture document and the coverage map, which the requirements never absorbed.

1. Root cause, with evidence.
   - (a) `bio-plane/src/monitoring/index.mjs:908`: `if (res.status === 404 || res.status === 410) { status = "removed"; note = answered; }`; the promotion flag follows at `:1121` `const flags = status === "removed" || (status === "modified" && !settledQuiet);`. Requirement R4 "404 or 410 is `removed`", R8 "Flagged is `removed`, or `modified` unless ...". No requirement of `monitoring.md` (grep: concealment, window, confirm: none) states a confirmation window or a concealment word. The source of both is `docs/architecture/BIO_Functional_Architecture_v3.md:203-206` ("flagged as potential evidence of concealment") and its resolution note `:499-502` ("presence comparison with redirect-matching and a confirmation window for removals", July 2026).
   - (b) The tick's fetch (`monitoring/index.mjs:830-833`, `governedFetch(tickAddress, { fetch: (u, i) => this.#fetch(u, i), ... })`) follows redirects and the code never inspects them: grep of `monitoring/index.mjs` for `redirected` and `res.url` finds nothing. So the answer is for the final address's bytes: same bytes -> `unchanged`, other bytes -> `modified`, dead -> `removed (the source answered 404)`, as the walker saw. No requirement states a "moved" reading (`monitoring.md`: no "redirect"; `acquisition.md` R14 records `redirected` only at capture).
   - R137: R4 "Any other non-success ... is unreachable: no status, the reason stated"; the tick's answer and the observation row carry it (`status null "the source answered 403"`, observation `LOOKED_INDETERMINATE`, R11). The member's list reads only R15/R16/R32 states `due`, `scheduled`, `unscheduled`, `ended` (`monitoring/index.mjs:2876-2881`), and the tick writes `last_checked` for an unreachable look too (R8), so the next check is a day away and no word of the refusal reaches the Watching list. No requirement asks for a refused state or the last outcome on the list row.
2. Why tests missed it: tests pin R4/R8 (`bio-plane/test/m/monitoring/tick.test.mjs`, `ticks.test.mjs`); the window and the move are in no requirement.
3. Failing-first tests (after BOB writes the requirements): in `bio-plane/test/m/monitoring/` (owning module's tests), the walker's cases through `monitor`: (a) one 404 tick leaves `source_status` unchanged and states "not yet confirmed", a second tick after the window flags `removed` and the concealment word is the screen's; (b) a 301 to a new address answers a `moved` reading naming the target, not `unchanged`/`modified`; (c) a 403 tick leaves the list row `state` "refused" with the reason and still due. Through the door: `bio-plane/test/m/control-plane/` with `r8-kit.mjs` (the `monitoring` list read).
4. Owner: `monitoring` (`bio-plane/src/monitoring/`, requirements R4, R8, R32), words to the UX design stream (the concealment sentence, "moved", "refused"). The decisions are not Bob's: the doctrine (concealment flag, redirect-matching, a confirmation window) is already decided in the architecture; the window length, the moved reading and the list row are BOB's details. Depends on the platform only for the window's clock (scheduler ticks); Miniflare covers it. Not in `fix-round-10-T51.md` or `later-ux.md` (grep: none). R136 (a)/(b) also flagged "built state unconfirmed" in `walk-T51-final/coverage/04-documents-part2.md:12`.

---

## 5. 04b R143: first reading `NO_HOME`, `alarm_at` null while owed

Saw: first poll `["owed","NO_HOME",1]`, then the reading finished; `alarm_at` null on the first poll.

**Verdict: ALREADY PLACED.** `fix-round-10-T51.md` §1 "G5 placed (K5057)": "Not defects: R25 (the walker filed 8 minutes after uploading; plane R97's designed wait; the next brief says file before polling) and R28a (a past `alarm_at` between firings is the platform delivering when the thread is free ...; `last_mem` is NULL on workerd by plane R92)"; R28b plane (a timer-free work figure). The record itself counts R143 as "KNOWN (placed in fix round 10) ... KNOWN R25, G5; KNOWN R28, G5".

1. Cause: `bio-plane/src/extraction/index.mjs:916` `if (!home || ...) return left("NO_HOME");` is the designed wait for the capture's home (owed job retried; store-assembly R74). The walker filed before polling (`s-rest.mjs:136`) but the first attempt ran before the promotion landed; the next poll shows the reading finished. Not re-verified beyond the code and the placement.
2. Tests: placed items carry their own tests (fix round 10 §1).
3. Failing-first test: none new.
4. Owner: `plane` / `store-assembly` (R25), `scheduler` (`bio-plane/src/scheduler/index.mjs:818` `alarm_at: alarm ?? null`, R28). Placed.

---

## 6. 04b R146 (a): every authority task reads "unassigned, role group-admin" although the project has an owner

Record rows "authority undetermined at capture: exactly one task ... routed to a project owner" and F9(a). Saw: 9 tasks, 0 of 9 routed to an owner or a named member; first item `assignee unassigned, role group-admin, detail null`; the project's owner is `watcher`. The documents were filed as the Add screen files them (`s-r41.mjs:39-47` `filed()`: `acquire {project}` then `CAPTURE_SCREEN.parts.promoteDocument(... project)`).

**Verdict: DEFECT.**

1. Root cause. `bio-plane/src/tasks/index.mjs:189-238` `#routeTask(bundleId)`. Arm 1 only if the bundle itself is a project: `if (b && b.object_type === "project") { const o = ownerOf(bundleId); ...`. Arm 2 only for a project with a `cites` edge to the bundle (`SELECT r.bundle_id AS project_id, r.kind FROM refs r JOIN bundles pb ON ... object_type = 'project' WHERE r.target_id = ?`). Arm 3 the earliest active administrator that is not the founder (`.find((m) => m !== "admin" && this.#membership.inSight(...))`), and finally `return { assignee: "unassigned", assignee_role: "group-admin", ... }` (`:238`). A document filed into a project carries the project in its front matter (`promotion.md` R53: "Every bundle is committed with the project its document states ... `record-core.bundleInfo().project` holds it"), not a `cites` edge; `tasks/index.mjs` already reads `info.project` elsewhere (`:852` `const project = info.type === "project" ? target : info.project;`) but `#routeTask` never does. In a team whose only administrator is the founder, the task is `unassigned`. Requirement `tasks.md` R1: "routed to an active owner of the bundle when it is a project, else to an active owner of the first project (by id) with a live `cites` edge to it, else to the earliest active administrator ... else `unassigned`". The code is R1 as written; R1 omits the project the document is filed in (the in-code comment assumes a project reaches an Information bundle by citing it).
2. Why tests missed it: `bio-plane/test/m/tasks/inbox.test.mjs:35-36` builds the DOC with a `cites` edge from the project (`word("tasks.why.owner_cites_record", ...)`), the only way a test could reach the project arm; no test files a document with the project's front matter and drains.
3. Failing-first test: `bio-plane/test/m/tasks/inbox.test.mjs`: a captured document committed with `project: PRJ` (no `cites` edge, no project-type bundle), an active owner `olga`; `taskDrain` routes its `authority-undetermined` task to `olga`, role `project-manager`, basis `tasks.why.owner_referred_project` or a new key; control: a document with no project and no edge still routes by the administrator rule. And the walker's case through the door: `bio-plane/test/m/control-plane/` (door test with `r8-kit.mjs`): `acquire` into a project, promote, drain, then member `op=tasks` shows the owner as assignee.
4. Owner: `tasks` (`bio-plane/src/tasks/index.mjs:189`), requirement `tasks.md` R1 amended by BOB (a detail: add the filed-in project first, before the `cites` project). Uses `record-core` (`bundleInfo().project`, R34), already used. Platform: none. Not placed in fix round 10 or later-ux. (Sub-point, WORDS: the task row carries no basis at all, the grammar is closed (`tasks/index.mjs:187-188` "never stores it on the task"), so the Queue draws only the address as summary and `detail` null; the coverage row's "its basis" is not drawable. That is a design question for the UX stream, not a code fault.)

---

## 7. 04b R146 (decide): after `taskdecide` the stated issuer and basis appear in no read

Saw: `taskdecide determined` and `undetermined_after_review` succeed, `AUTHORITY_NO_BASIS` without a basis; afterwards "the document's own authority: state undetermined, basis 'no assertion was supplied and no mechanical determination is implemented; recorded 2026-10-25T15:03:05Z for resolution through the task list'", the issuer appears in none of the document, grade note, provenance file, tasks or Queue reads; it is held in `authority_decisions`.

**Verdict: DEFECT against provenance R66's own sentence (the decision is recorded, but the member-visible reads keep showing the stale `undetermined`).** BOB should confirm whether a member-facing read is intended; the requirement text says so.

1. Root cause. The write works: `bio-plane/src/provenance/index.mjs:1492-1495` inserts into `authority_decisions`; `authorityOf` (`:1502-1515`) answers the standing value. Only two readers use it: `containerResolver().authority` (`provenance/index.mjs:696-704`, "C-18.9 reads a document's authority state, issuer and basis from it before the document's own") and the register check (`provenance/register-checks.mjs:247-248` `const aState = decided ? decided.authority_state : d.authority_state;`). No op or screen reads `authorityOf` (grep over `bio-plane/src`: no other caller; no `authorityof` op), and the document's `data/provenance.json` entry still states the acquisition-time `authority_state: "undetermined"` (`capture/index.mjs:1367-1368`, `acquisition/index.mjs:1840`), which is what `op=image`/`document` and the grade note read. R66: "`containerResolver()` ... so every reader of a document's authority sees one standing value and a stale `undetermined` is never read after a decision" - true of the checks, false of every member read. `screens-daily.md` R75 specifies the form only; no requirement says where the answer shows.
2. Why tests missed it: `bio-plane/test/m/provenance/authority.test.mjs` proves `authorityOf` and the C-18.9 check; tasks' tests prove one transaction; nothing reads the document as a member after a decision.
3. Failing-first test: `bio-plane/test/m/provenance/` (new `authority-read.test.mjs`): after `declareAuthority({outcome:"determined", authority:"City Clerk", basis})`, the read a member uses for the document's provenance (the op that serves `data/provenance.json`'s document entry, or the new read) states `authority_state: "determined"`, `authority: "City Clerk"` and the dated basis; `undetermined_after_review` states the basis and `reviewed: true`; control: a capture with no decision answers the register's value alone. Through the door: `bio-plane/test/m/control-plane/` (`taskdecide` as the owner, then the member's document read).
4. Owner: `provenance` (new member read of `authorityOf`, or overlay in the read that serves the register), then the screen that draws the document's source line (`screens-inquiry`, UX words). The shape of the read is BOB's detail ruling; whether a member-facing "who issued it" line is drawn is UX. Platform: none. Not placed in fix round 10 or later-ux (grep: `authorityOf`/`taskdecide`: none).
   A plain `taskresolve` leaving the document undetermined (F15) is SPECIFIED: `tasks.md` R21.

---

## 8. 04b R214: three refusals carry no `translation` (`NO_PSEUDONYM`, `HOST_COOLING_OFF`, `NO_SUCH_TASK`)

Script `s-overlay.mjs:29-50` reads `r.translation` on the raw door answer and says "the screen may supply its own by code, which is not drawn offline".

**Verdict: SPECIFIED, and WALKER-ERROR (read at the wire; a member sees the screen).**

1. Root cause. The shell draws a refusal from the screen's own word, then a `refusal.<CODE>` row, then the wire `translation`, and only then an uncatalogued code: `bio-plane/src/interface-shell/browser.mjs:341-353` `refusalOf`: `const key = ... "refusal." + a.code; if (has(key)) return { words: w(key, ...) }; if (a.translation) ...; if (a.coded) return { words: w("refusal.uncatalogued") + " <code>" ...`. Design rows exist for all of them (`bio-plane/src/setup-words/rows.mjs:7803` `refusal.HOST_COOLING_OFF`, `:8007` `refusal.NO_SUCH_TASK` "No task like that exists that you can see. Nothing was changed.", `:7959` `refusal.NO_PSEUDONYM`, `:1170` `refusal.SOURCE_REFUSED`; all `design` origin). `NO_PSEUDONYM` is also not reachable by a screen: the about-knocker screen always names the pseudonym (`knocksof` from a knock). The wire answers (`doorbell/index.mjs:773`, `tasks/index.mjs:629`, `monitoring/index.mjs:842`) carry `detail` and `reason`, which is the module's contract; no requirement makes a wire `translation` mandatory for these. (`SOURCE_REFUSED` in the walker's list carries its sentence by the screen row, as the 04a UI rows show.)
2. Tests: not applicable (behaviour correct); the shell's fallback is `browser.mjs:341-353` above.
3. Failing-first test: none (behaviour correct). A re-walk should read these on the screen at 390/1280 px.
4. Owner: none. Platform: none.

---

## 9. 04b OV-15: "secret", "confidential", British spelling in member words

Record row OV-15. Saw: 29 rows with "secret" (e.g. `screen.doorbell.secret.label`, `screen.doorbell.refused.weak`), 3 with "confidential" (`screen.action.confidential`, `.scope.confidential`, `.scope.open`), 3 British (`screen.doorbell.consent.refused.secret`, `doorbell.index.no_secret_recognised`, `sources.checks.that_secret_was_not_recognised`).

**Verdict: WORDS (to the UX design stream). One element ALREADY PLACED.**

1. Root cause. The rows are the design stream's own words: `rows.mjs:3435` `["screen.doorbell.secret.label","A secret phrase (optional)",...,"design"]`, `:3440` `refusal ... "A secret phrase needs at least 20 characters."`, `:10384` `screen.doorbell.receipt.secret "Your secret phrase: {secret}"`, `:1660` `["screen.action.confidential","Confidential: seen inside the team and never published.","adopted from screens-action's own rows",...,"design"]`. The overlay rule (`coverage/overlay.md:47` check 15) says "never 'secret' or 'confidential'; American English". So the design stream's rows and its own overlay disagree; code does not decide. British spelling: `rows.mjs:9450` `screen.doorbell.consent.refused.secret` "That secret was not recognised" (origin `design`) beside `rows.mjs:16313` `refusal.SECRET_NOT_RECOGNISED` "That secret was not recognized" (American, design); the two code-origin rows (`doorbell.index.no_secret_recognised`, `sources.checks.that_secret_was_not_recognised`) are wire stand-ins. 
   ALREADY PLACED: "an unrecognised document" is `later-ux.md:117`; the other hits are not in `later-ux.md`.
2. Why tests missed it: the words check (`bio-plane/test/m/setup-words/`) holds "group" and a few banned words, not "secret", "confidential" or British spellings.
3. Failing-first test: once UX decides, a `setup-words` check over member-read rows for the agreed vocabulary (`bio-plane/test/m/setup-words/`), red on the rows named above.
4. Owner: UX design stream (the words), then `setup-words` (rows) and `screens-publish`/`screens-intake` only if keys change. Platform: none. Goes to `later-ux.md` when BOB commits the record (the record's F14).

---

## 10. 04b R100: `actioncreate` is accepted for a member who is not in the project

Record row R100 (G74). Saw: `actioncreate` by `strangerone` with `document.project = PROJ-2026-4515-contract-records`, a project she never joined and was not invited to: `ACCEPTED ACTN-2026-0005`; her document promoted into the same project through the Add screen's promote: refused `PROMOTE_NOT_A_PARTICIPANT`. Script `s-r100.mjs:128-135`.

**Verdict: DEFECT.** The screen sends the same act (`screens-action/actionnew.mjs:124` `op: "actioncreate"` with `project` in the document), but it takes the project from the page the member is on, so a stranger meets it only by hand-sending or by guessing a project id; the hole is at the door.

1. Root cause. Promotion's participant check is conditional on a stamp: `bio-plane/src/promotion/index.mjs:698-701`: `const filedInto = projectOf(sentFm, promotedType); const filer = typeof pkg.actorMemberId === "string" && pkg.actorMemberId ? pkg.actorMemberId : null; if (!replay && filer && filedInto && !membership.participation(filedInto, filer)) { ... return { ok: false, reason: "PROMOTE_NOT_A_PARTICIPANT", ...`. "Only a session's member is asked (`actorMemberId` ...)". `actionCreate` never sets it: `bio-plane/src/actions/index.mjs:2077-2083` `this.promotion.promote({ bundleId: id, base: null, snapKey, author: who || null, viewer: viewer ?? (who || null), files: [...], meta: {...} })`, no `actorMemberId`, so `filer` is null and the check is skipped. Other project-record writers do pass it: `intent/index.mjs:224` `actorIdentity: author, actorViewer: viewer ?? author, actorMemberId: member`, `monitoring/named-requests.mjs:86`, `investigation/index.mjs:1021`, `store-door/pull.mjs:72`. (Actions' other promote calls, `index.mjs:1607`, `:1943`, `:2206`, `:2323`, `:2406`, also pass none; BOB should have the fix job read them.) Requirement: `promotion.md` R53 "(G74; BOB's decision, P17, from K4557): a member files a document into a project only when she is its member or invited to it"; `actions.md` R47 "`actionCreate` is the same write as a promotion of an action document ... its refusals are the promotion's".
2. Why tests missed it: G74's tests drive `promote` with `actorMemberId` (`bio-plane/test/m/promotion/r7-foreign-project.test.mjs`) and the Add screen (`.../screens-intake/r7-project-picker.test.mjs`); actions' tests call `actionCreate({document, author})` with no stamp and no non-member case.
3. Failing-first test: `bio-plane/test/m/actions/` (a new `create-participant.test.mjs`): `actionCreate` of an action document naming project P, author a member who is neither participant nor invited, refused `PROMOTE_NOT_A_PARTICIPANT` and nothing written (`listBundles` unchanged); control: an invited-not-joined member and a participant succeed, and the machine path (no member) is unchanged. The walker's case through the door: `bio-plane/test/m/control-plane/` with `r8-kit.mjs`: the stranger's `actioncreate` is refused with the same code and sentence as her promote.
4. Owner: `actions` (`bio-plane/src/actions/index.mjs:2077`: pass `actorIdentity`, `actorViewer` and `actorMemberId` as `intent` does, via `membership.positionalMember(viewer, author)`). `actions` already uses `membership`, `promotion`. Platform: none. Not placed in fix round 10 or later-ux (G74 appears there only for the Add screen's refusal words, `later-ux.md:108`).

---

Grouping: sections 3 and 10 share a class (an act's actor not carried to the owner); section 2 is a third form (an argument named like a stamp). One check over owner-declared ops would find all three classes; BOB's call.
