# filing-templates (T37)

**Status** · session_014hEdDSz4wUBaBVwYMSR3Fh · depth 2 · COMPLETE · handled B1

## Completion (T37-23)

**Reading (mechanics §17, N739):** I measured the set as §3 asks: my requirements 24 KB, my code 111 KB (`index.mjs` 89, `checks.mjs` 12, `schema.mjs` 8, `blanks.mjs` 3), my tests 112 KB, and the Purpose and named services of the five used modules 27 KB. The total, about 274 KB, is under 300 KB, and I read it all myself; no worker summary was used. I also read whole: layer 9's row and section of `build/layers.md`; the plan's T37-23 entry and "Rules at the opening" (rules 1, 4 and 6, with item 17's census line); K2129, K2175 and K2212 (their lines); `credentials` R53 and `review` R29 with `reviewOps` (`review/index.mjs`:768–790) as the pattern; and `control-plane` R44, R59 and R64 with its `templateGrantDoor` (`control-plane/index.mjs`:189–234), to see what the store receives.

**Entries applied (T37-23):**
- R27 (N761; K2129, K2175): `filingTemplatesOps` reads `secretSha` only from the internal request's body, never the query, whatever the method. This covers `templatereviewgrant` (the new grant's fingerprint) and the grant doors of `templatereview`, `templatecomment`, `templatecomments` and `templateread`. A digest only in the query mints nothing (`GRANT_NO_SECRET`, writing nothing) and opens no door: the call is answered exactly as one carrying no `secretSha`. `author`, `by` and `viewer` stay query stamps. The comment above the map is re-worded.
- An improvement in my own module, for control-plane R59's POST: `templateread` and `templatecomments` now take `template`, `version` and `limit` from the body as well as the query (the body first, as every other op's `pick` does). control-plane's door forwards a POSTed body to the store minus its stamps, so a POSTed read's arguments would otherwise have been dropped.
- `invariants.test.mjs` (the ops-map test, formerly :205–209): the grant and its review now carry the digest in the body. Its negative control: a live digest only in the query opens no door (answered `MACHINE_CANNOT_REVIEW_TEMPLATE`, as a call with none), and a query digest beside a body one is not the grant's.
- New `grant-channel.test.mjs`: five tests named R27 (K874), one per op. Each checks:
  - a digest only in the query is answered byte-identically to the same call with none (for a stranger, and for a member);
  - a query digest writes nothing;
  - the body's digest opens the door (the negative control);
  - with both present, the body's digest decides;
  - a body's `author`, `by` or `viewer` is never honoured.
  The two read tests also check that the body's arguments are read.
- All six of these tests fail against the code before the change and pass after it.

**Rule 4's interim reds (N761), by name:** none. Every `test/m` test outside my module that names these ops stubs the store, and none sends a template-grant `secretSha` through to my map. Those tests are in control-plane `template-grant`, `t34-routes`, `t35-door`, `t36-door` and `stamps-action`, op-declarations `tables`, plane `compose`, skills `filing`, queue `templates`, affordances `catalogue`, op-grades and queue-producers: 237 of 237 pass both with and without my change. No legacy-ui or other test outside `test/m` names these ops. So nothing goes red at my merge, and nothing waits on T37-33 for this module.

**Found in other modules, or for BOB:**
- In my own requirements' Uses (BOB's text): the code also calls `membership`'s `positionalMember` (R76), `inSight` (R80) and `expertiseList` (R24), as the header of `index.mjs` states. Uses names only `viewerPredicate`, `isJoinedParticipant`, `isProjectOwner`, `projectOwners`, `isAdministrator` and `memberFacts`, and no code calls `projectOwners`. Uses could be brought in line at the next wording. No behaviour depends on this.
- Generated artifacts: my change stales only the plane bundle, which is regenerated at the layer close.

**Deferred:** none. Updating the requirements' Status and R27's marker is BOB's job.

**Tests and checks:**
- `node --test bio-plane/test/m/filing-templates/`: 56 pass, 0 fail.
- The tests of every module that uses filing-templates (filings, wizard-scripts, affordances, queue-producers, answer-envelope, control-plane, plane with `system/migrate-released`): 784 tests, 747 pass, 36 fail, identical by name with and without my change. The 36 are inherited reds: affordances `plane.test.mjs` 27 and `t36.test.mjs` (rule 6 item 17), `t36-backing.test.mjs` (item 14), plane `worker.test.mjs` (item 17) and `release.test` (item 7), and answer-envelope `families` 2, plane `docket` and `disclosures` (all red before my change too).
- `format`: 136 modules, 0 failures. `architecture`: 11 product files, 34 imports, 0 failures. `coverage`: 27 of 27 live ids, 0 failures. `ownership` against `tranche/T37`: 4 files, 0 failures.

Size (session_014hEdDSz4wUBaBVwYMSR3Fh): test runs 9, module lines 1787

## J1 · COMPLETE

T37-23 done: R27. filingTemplatesOps reads secretSha from the body only (templatereviewgrant, templatereview, templatecomment, templatecomments, templateread); a query digest alone mints nothing (GRANT_NO_SECRET) and opens no door (answered as the call with none); author/by/viewer stay query stamps; comment re-worded. Own improvement: templateread and templatecomments also take template/version/limit from the body (control-plane R59's POST). invariants ops-map test moved to the body form with its negative control; new grant-channel.test.mjs, five R27 tests, one per op; all six fail before the change, pass after. Rule 4 reds: none (every other test/m test naming these ops stubs the store; 237/237 before and after; nothing outside test/m names them). Module 56/0; users' tests 747/784 with the same 36 inherited reds by name before and after. format, architecture, coverage 27/27, ownership: 0 failures. 1,787 lines. For BOB: my requirements' Uses omits membership's positionalMember, inSight, expertiseList (called), and names projectOwners (not called). Record: build/jobs/T37/filing-templates.md on job/T37/filing-templates.
