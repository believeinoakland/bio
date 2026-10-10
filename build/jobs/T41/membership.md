# membership (T41)

**Status** · session_011HAMj6VLhgKZ4DeMarJYTz · depth 2 · COMPLETE · handled B1

## Completion (MEMBERSHIP #32)

**Reading set** (mechanics §17): BOB measured 395 KB; membership's own code (3,621 lines, ~240 KB) and tests (~340 KB) alone are over 300 KB, so the over path (K2304). Read whole myself: `build/requirements/membership.md`; layer 2's row of `build/layers.md`; plan entry T41-3 and the opening's rule 4; K2408, K2409, K2435; `draft-T41-investigation.md` §3.5; DEC-188; `words.json`'s `handle.*` entries; every file of `bio-plane/src/membership/` (`index.mjs`, `checks.mjs`, `schema.mjs`); the tests the entry changed (`sight`, `module-order`, `hidden-bundles`, `t20-figures`, and the changed tests of `roster`, `participation`, `t19-seam`, `converts`, `t9-notice-sight-bounds`, `t14-rows-remedy-order`, `t40-handles`). Used services named in Uses: record-core `bundleInfo`, `declarePurge`, `registerAuditFinding` (as membership calls them; unchanged), record-grammar `MACHINE_CLASS_PREFIX`. A worker read the other 20 test files in full (293 KB) and wrote a ~1,400-word summary citing file:line for each statement: no assertion there is wrong under D54; one stale premise (`converts.test.mjs:156`, fixed: now also asserted at a discoverable project) and gaps in coverage of the new forms, all of which `t41-sight-words.test.mjs` covers. Nothing it left out mattered.

**Entries applied (T41-3).**
- **R43** `viewerPredicate`: the founder's viewer (both spellings) and an active administrator's see a project, and the bundles belonging to it, as a participant (any state) or when the project is discoverable (`project_sight`, R85's index); hidden projects they are not in, and bundles naming a project the index does not hold, are withheld (fail closed). Machine credentials unchanged. The founder's gate now has scope `participant` (was `member`); only the machine arm keeps `member`, so callers' `scope === "member"` see-all shortcuts no longer apply to the founder.
- **R44** `sight`: EXISTENCE's second form, an administrator (the founder included) neither invited nor joined to a hidden project. **R77** C-70.1 carries `owners` (current handles, R65 order; null for an owner with none, the founder) for that case only; its detail says which form. **C-70.1's translation re-worded** to be true of both forms ("You can see that this project exists, but …"): a row change for promotion's stamp (T41-6).
- **R88** `hiddenBundles`: null only for machine credentials; for the founder and administrators it names the hidden projects withheld and their bundles.
- **R18** the administrator's roster lists each member's projects by the reading administrator's sight: FULL ones whole; of a hidden one it is not in, only ownership (`{project, state: null, owner: true, existence: true}`). `op=memberlist` now reads the `viewer` stamp; with none, read as an administrator in no project (fail closed).
- **R60** nothing here grants an administrator a position; `rescueRefusal` (R75) and `sight` answer at a hidden project's EXISTENCE, so project-roster R5 and actions' hold reads can reach it. Detail sentences that said "an administrator sees every project" re-worded.
- **R120** `project_sight` holds `(project_id, setting)` only, no per-member admission, so the migration is a **no-op**: the boot's existing reindex is the whole rewrite, byte-identical, and no project's setting changes. The rule now lives in R43's predicate, which reads the index.
- **R83** `MODULE_ORDER` re-pinned from `modules.json`: `steps`, `reading-guides`, `question-explorer`, `investigation`, `publish-schedule` in their places; `module-order.test.mjs` pins each between its neighbours and tolerates the five (and `ai-use`) as not yet built; `setup-words` is no longer tolerated (merged). Clears rule 4 item 5 (membership's two and `t9…:158`; progressions' `order` test also passes now).
- **R123, R124, R126** `HANDLE_CHECK_PAUSED`, `HANDLE_CHANGE_NOT_A_MEMBER`, `HANDLE_CHANGE_UNCHECKED` take their translations from `HANDLE_WORDS['handle.refused.paused' | '.notmember' | '.unchecked']`, held verbatim from `words.json` and tested against it; the paused answer gains `minutes` (whole minutes until `retryAfter`, rounded up) for `{minutes}`. Three row changes for T41-6's stamp, numbers unchanged (C-96.48, .49, .51).

**Tests.** New `t41-sight-words.test.mjs` names R43, R44 (with the Terms), R77, R88, R18, R60, R120, R126, R123, R124, each with a negative control. Re-stated for D54: `sight`, `roster` (R18), `participation` (R32, R36), `t19-seam` (N426), `converts` (R45, R55), `t20-figures` (R114), `hidden-bundles` (R88), `t9-notice-sight-bounds` (R80), `t14-rows-remedy-order` (R87); `module-order` (R83, with a negative control); `t40-handles` (R126 by key).

**Ran.**
- `node --test bio-plane/test/m/membership/ bio-plane/test/members.test.mjs`: tests 198, pass 198, fail 0 (before: 187, 3 red, all MODULE_ORDER). No layer tests in the manifest.
- Users' suites (91 modules whose `uses` names membership, 102 test paths, run one path at a time): pass 6,865, fail 170. Each failing path re-run with membership's source from `origin/tranche/T41`: 23 of the 170 are red there too (not mine: row census, reading-pipeline, the cpdf20 fixture, answers, case-disclosures, case-authoring ×2, filings, affordances ×1, op-declarations ×7, answer-envelope ×2, query-language ×1); progressions' MODULE_ORDER red cleared. **147 new reds, every one from D54:** a test, a fixture or a product read that assumes the founder's or an administrator's FULL sight of a hidden project (the fixtures' projects are hidden unless set otherwise), except query-language's 6, whose fixture builds membership's tables by hand without `project_sight` (R120's contract table, which R43 now reads). By module (file:line of the first failing frame):
  - `project-roster` (8): `figures-purge.test.mjs:63`, `figures-purge.test.mjs:107`, `ownership.test.mjs:24`, `ownership.test.mjs:113`, `ownership.test.mjs:145`, `ownership.test.mjs:178`, `ownership.test.mjs:230`, `requests.test.mjs:24`
  - `credentials` (4): `t40.test.mjs:160`, `t40.test.mjs:290`, `t40.test.mjs:332`, `t40.test.mjs:529`
  - `provenance-routes` (2): `marked.test.mjs:126`, `table.test.mjs:40`
  - `acquisition` (2): `archivelist.test.mjs:156`, `archivelist.test.mjs:259`
  - `capture` (1): `knocker.test.mjs:685`
  - `file-safety` (1): `intake.test.mjs:105`
  - `observation-log` (1): `fence.test.mjs:95`
  - `money-checks` (2): `noticed.test.mjs:109`, `run.test.mjs:135`
  - `bias` (13): `debt.test.mjs:46`, `debt.test.mjs:79`, `debt.test.mjs:114`, `debt.test.mjs:141`, `debt.test.mjs:155`, `debt.test.mjs:183`, `debt.test.mjs:202`, `debt.test.mjs:245`, `debt.test.mjs:296`, `debt.test.mjs:354`, `debt.test.mjs:394`, `debt.test.mjs:456`, `migrate.test.mjs:33`
  - `query-language` (6): `converts.test.mjs:270`, `fields.test.mjs:76`, `projection.test.mjs:62`, `statements.test.mjs:111`, `statements.test.mjs:209`, `t33.test.mjs:157`
  - `retrieval` (1): `selections.test.mjs:326`
  - `workbooks` (2): `add.test.mjs:129`, `notes.test.mjs:46`
  - `inquiry` (3): `exports.test.mjs:53`, `findings.test.mjs:60`, `findings.test.mjs:108`
  - `citation` (3): `cite-refusals.test.mjs:75`, `cite-refusals.test.mjs:281`, `sever.test.mjs:83`
  - `basis-versions` (2): `t20-figures.test.mjs:74`, `t20-figures.test.mjs:131`
  - `ai-runs` (10): `converts.test.mjs:35`, `converts.test.mjs:140`, `converts.test.mjs:227`, `hidden-notices.test.mjs:55`, `hidden-notices.test.mjs:94`, `open.test.mjs:115`, `producers.test.mjs:85`, `producers.test.mjs:114`, `reads.test.mjs:128`, `reads.test.mjs:170`
  - `intent` (2): `amount.test.mjs:153`, `objective.test.mjs:313`
  - `case-carriage` (3): `marks.test.mjs:131`, `marks.test.mjs:201`, `withdraw.test.mjs:116`
  - `publication` (5): `convert-casesign.test.mjs:52`, `convert-casesign.test.mjs:129`, `convert-deliverer.test.mjs:45`, `t34.test.mjs:300`, `t34.test.mjs:375`
  - `network-notices` (6): `activity.test.mjs:129`, `prepare.test.mjs:13`, `reads.test.mjs:222`, `seals.test.mjs:26`, `seals.test.mjs:260`, `seals.test.mjs:325`
  - `case-authoring` (3): `converts.test.mjs:190`, `statement.test.mjs:25`, `whatchanged.test.mjs:174`
  - `review` (4): `copy.test.mjs:71`, `doors.test.mjs:57`, `doors.test.mjs:151`, `doors.test.mjs:184`
  - `conformance` (3): `determine.test.mjs:15`, `reads.test.mjs:68`, `reads.test.mjs:304`
  - `consequences` (9): `addressed.test.mjs:47`, `assessed.test.mjs:163`, `computed.test.mjs:183`, `person.test.mjs:61`, `person.test.mjs:82`, `reads.test.mjs:348`, `record.test.mjs:39`, `record.test.mjs:126`, `record.test.mjs:220`
  - `filing-templates` (5): `lifecycle.test.mjs:12`, `reads.test.mjs:188`, `reads.test.mjs:234`, `reads.test.mjs:298`, `reads.test.mjs:360`
  - `wizard-scripts` (7): `governance.test.mjs:70`, `governance.test.mjs:11`, `invariants.test.mjs:113`, `reads.test.mjs:29`, `reads.test.mjs:148`, `registry.test.mjs:62`, `use.test.mjs:31`
  - `affordances` (3): `converts.test.mjs:94`, `converts.test.mjs:157`, `plane.test.mjs:67`
  - `tasks` (1): `check.test.mjs:38`
  - `queue-producers` (3): `action.test.mjs:104`, `action.test.mjs:209`, `action.test.mjs:280`
  - `plane` (2): `findings.test.mjs:88`, `findings.test.mjs:145`
- **Product code in other modules using the founder's viewer as an internal see-all read** (now withheld hidden projects; each should read with no viewer or a machine one): `network-notices/index.mjs:187` (`#closed`, `projectStage` as `"admin"`: the network-notices reds), `case-authoring/index.mjs:974` and `:1735`, `inquiry/index.mjs:750` (`biasManifest` as `"admin"`), `ai-runs/index.mjs:201` (`read` as `"admin"`).
- Checks: `format` 0 failures; `architecture membership` 0 failures; `coverage membership` 94 of 94; `ownership membership tranche/T41` 0 failures.

**Deferred.** None.

**Found in other modules.**
- The 147 reds above, for rule 4 (11); the five product-code sites above; query-language's fixture needs `project_sight`.
- `control-plane`: `op=memberlist` should be stamped with `viewer` (it is not among the viewer-stamped ops today), so R18 reads the asking administrator's own sight; until then the roster reads as an administrator in no project (fail closed: hidden projects by owner only).
- Rows changed for T41-6's stamp: C-70.1 (translation), C-96.48, C-96.49, C-96.51 (translations by key).
- `words.json`'s `handle.refused.unchecked` names bare "Civicsmith"; R112 asks "your group's Civicsmith" or no name. The words are the UX stream's, read by key, so not changed here; for the stream to note.
- Generated artifacts staled: the plane bundle (accepted red 12).

Size (session_011HAMj6VLhgKZ4DeMarJYTz): test runs 24, module lines 3690

## J1 · COMPLETE

T41-3 complete (job/T41/membership, pushed). D54: R43 founder and administrators see a hidden project and its bundles only as participants (discoverable unchanged); R44 EXISTENCE's second form; R77 C-70.1 carries `owners` for that case (C-70.1's translation re-worded for both forms); R88 hiddenBundles null only for machines; R18 roster by the reading administrator's sight (op=memberlist reads `viewer`); R60 rescueRefusal and sight reachable at EXISTENCE; R120 migration a no-op (project_sight holds no per-member admission; boot reindex byte-identical). R83 MODULE_ORDER re-pinned (five new modules; clears rule 4 item 5). R123/R124/R126 the three handle refusals read handle.refused.* by key; paused answer carries `minutes`. Rows for T41-6's stamp: C-70.1, C-96.48, C-96.49, C-96.51.
membership 198/198; format, architecture, coverage (94/94), ownership 0 failures.
Users' suites (91 modules, 102 paths): 147 new reds, all from D54 (rule 4 (11)), listed by module with file:line in the record's Completion; query-language's 6 are its fixture lacking `project_sight`. Product code using the founder viewer `"admin"` as a see-all read, now blind to hidden projects: network-notices/index.mjs:187, case-authoring/index.mjs:974 and :1735, inquiry/index.mjs:750, ai-runs/index.mjs:201. control-plane should stamp `viewer` on op=memberlist (R18). Plane bundle stale. Record: build/jobs/T41/membership.md.
