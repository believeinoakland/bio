# network-notices (T34)

**Status** · session_01DaJwApJLkJ5MRFQbPXN5ud · depth 2 · COMPLETE · handled B2

## Completion

**Entries applied.** T34-87 (DEC-149's L8 share; K1784, K1811): every member-facing string of network-notices that called the group's Civicsmith "this copy" now says "your group's Civicsmith" or needs no name. BOB's four rows: C-127.4 `NOTICE_NO_GROUP_SLUG` ("Your group has no name recorded yet, and a notice is never anonymous. …", needs no name), C-127.5 `NOTICE_NO_INSTANCE_KEY` ("Your group's Civicsmith holds no signing key of its own, …"), C-127.12 `NOTICE_STALE` ("Your group's Civicsmith holds no prepared notice from you …"), and R21's `COPY_KEY_LABEL` ("this group's Civicsmith key": the public reads it with no credential, so not "your group's"; J1, answered by B2, K1833, with R21 re-worded on `tranche/T34`, merged). Reading the module whole found two more of the kind, applied under the entry's "every member-facing string": the `NOTICE_NO_INSTANCE_KEY` refusal's `detail` at both its sites (`index.mjs` #callerRefusal and postNotice: "no instance key is bound" → "your group's Civicsmith holds no signing key of its own"). Kept: "copy these fields" (R23, a copy of a document), the code names, the wire field `copy` of R21's answer, the formats and hash tags. No meaning changed; no requirement changed.

**Rows, each `awaiting stamp` (T34, changed translation; T35's promotion stamp moves `CATALOG_VERSION`, plan Rule 5 (4), K1750's pattern):**
- C-127.4 NOTICE_NO_GROUP_SLUG
- C-127.5 NOTICE_NO_INSTANCE_KEY
- C-127.12 NOTICE_STALE

**Tests.** New `test/m/network-notices/words.test.mjs` (4 tests): R1 (DEC-149) drives C-127.4 and C-127.5 (at prepare and at post) and checks each translation and detail whole; R4 (DEC-149) C-127.12 at both its causes; R21 (DEC-149) the key label, direct and through public-read's credential-free read; R1 R4 R21 every row's translation, the module's constants and every answer of a busy world hold no "this/the/your … copy|instance|plane" or "server", with a negative control. All four fail on the code before the change (0 pass, 4 fail) and pass after. No existing test asserted the old words (they compare against the exported rows and `COPY_KEY_LABEL`).

**Deferred.** None.

**Found in other modules** (J2):
- `docket` `checks.mjs`:101, :131 (C-129 rows, docket's own T34-87 rows) mirror C-127.4 and C-127.12; suggest the same wording so the two refusals read alike.
- `plane` `test/m/plane/store.test.mjs` "R2, R10 (K1416; control-plane R42): control-plane's step ranks …" fails on `tranche/T34` with or without this change (checked with network-notices' source restored); not among the reds BOB's START names.
- Generated artifacts made stale (mechanics §14): `bio-plane/dist/bio-plane.bundled.mjs` (and `release/` copies) hold the old wording; BOB regenerates at the layer close.
- promotion's `row-census.test.mjs` now also lists C-127.4, .5, .12 as changed; named `awaiting stamp` above.

**Ran.** `node --test test/m/network-notices/`: tests 72, pass 72, fail 0. Users: ratification 204/204; case-authoring 137/137; queue-producers 85/85; scheduler 81/82 (R12, K1708's named red); control-plane 166/168 (catalogue-end, K1789: fails at ADMINS_FIRST, and none of C-127's codes is in its pin; r53-routes.test.mjs:58, K1807); plane with migrate-released 110/111 (store.test.mjs above, not mine). promotion's row-census 7 pass 1 fail (the T34 changes, mine named above). No layer tests are named in `build/manifest.md`. Checks: format "127 modules, 126 requirements files; 0 failures"; architecture "12 product files, 65 relative imports (0 naming no tracked file, not judged); 0 failures"; coverage "1 modules, 30 of 30 live requirement ids named by a test; 0 failures"; ownership "4 files changed by network-notices between tranche/T34 and HEAD; 0 failures".

After B2 (K1833): the label applied, `tranche/T34` merged, module 72/72 and the four checks re-run, each 0 failures.

Size (session_01DaJwApJLkJ5MRFQbPXN5ud): test runs 13, module lines 1412

## J1 · QUESTION

R21's key label (index.mjs:101, COPY_KEY_LABEL) is read by the public with no credential (groupkeyspublic), so "your group's Civicsmith" would be wrong to a stranger and "this copy's key" is what DEC-149 removes. My reading, applied on job/T34/network-notices @ d1ad2668a9: "the group's Civicsmith key" (DEC-149: reword where "Civicsmith" could mean the software; here it names the group's own installation beside the answer's group slug). R21's requirement text still says "labelled as this copy's key"; its meaning is unchanged, so I read it as the label's meaning, not its words; the answer's field name `copy` is wire format and stays. Not blocking: the rest of the job is done on this reading; I complete on it unless you answer otherwise.

## J2 · REPORT

Found outside network-notices (record's Completion): (1) docket checks.mjs:101, :131 (C-129, its own T34-87 rows) mirror C-127.4 and C-127.12; suggest the same wording so the two read alike. (2) plane test/m/plane/store.test.mjs 'R2, R10 (K1416; control-plane R42): control-plane's step ranks …' fails on tranche/T34 with or without this change; not among the START's named reds. (3) Stale generated artifacts (§14): bio-plane/dist/bio-plane.bundled.mjs and release copies carry the old wording. (4) promotion's row-census now also lists C-127.4, .5, .12 changed; named awaiting stamp in my record.

## J3 · COMPLETE

T34-87 applied: C-127.4, .5, .12 translations, NOTICE_NO_INSTANCE_KEY's detail (both sites) and R21's key label no longer say 'this copy'/'instance'; words.test.mjs names each (R1, R4, R21; 0/4 before, 4/4 after). Module 72/72; ratification, case-authoring, queue-producers green; scheduler, control-plane reds are the START's named ones; plane's one red is pre-existing (J2). format, architecture, coverage (30/30), ownership 0 failures. The label rests on J1's reading. Rows awaiting stamp named in the record.
