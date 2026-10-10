# publication (T41)

**Status** · session_01BKNMquTmjnJkVp4dFUpPPJ · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

**R76 and a waiting edition's signer.** R76 counts a waiting edition (asked through R77's `isWaiting`) whose signer, deliverer or preparer is the member, or whose document names the member's handle. A waiting edition's signer and deliverer are held only in `publish-schedule`'s `scheduled_editions` (`signer`, `delivered_by`); its `case_documents` row stays unsigned. R77 gives publication only `isWaiting` and `signedAtOf`, and R77 says no SQL of this module names that table, so publication cannot read who signed a waiting edition.

**My best reading (building on it now):** for a waiting edition, R76 matches the preparer (`case_documents.authored_by`) and the handle rows, but not the signer or deliverer. For a ratified edition it matches all of them. In practice the gap is small: the signer of a scheduled edition is almost always its preparer or a member its document names.

**Alternative, if you want the signer covered:** R77 gains a third door, `signerOf(caseId, edition)` → `{signer, delivered_by}` or null, which `publish-schedule` R8 fills. That changes R77 and publish-schedule R8, so it needs your wording and a CHANGE to T41-37.

**Also, FYI (no answer needed unless you disagree):** K2483 moves `#criteriaOf`'s founder read off `"admin"`. I read through `class:daemon`, the machine viewer that `investigation`, `monitoring` and `duties` use. For a standard outside every project it answers exactly as `"admin"` did: the passages of a reading-room or paywalled standard stay withheld from both, since neither is a member viewer. R72's and R75's text still say "`admin` for the founder". I take K2483 as governing and suggest R72 and R75 read "a machine viewer (`class:daemon`) when no member signs".

## J2 · COMPLETE

**T41-36 applied.** All entries are done. B2 (K2529) and B3 (K2535) are applied: the tranche is merged and the copy is deleted.

**What changed**
- **R77** `registerWaitingEditions` takes `isWaiting`, `signedAtOf` and `signerOf`, once at start. It refuses `PROVIDER_MALFORMED` and `PROVIDER_DECLARED`, and `waitingSource()` says who registered. With none registered, nothing waits and nothing is answered.
- **R21** `storeCaseDocument` and `reauthorSection` ask `isWaiting` first, inside the caller's transaction. A waiting document counts as signed. A source that throws is read as waiting (fail closed).
- **R70** At the commit, `signed_at` is `signedAtOf`, or the commit's own instant when it answers null.
- **R76** `publishedWorkOf({memberId})` is registered with `membership.registerHandleGuard` at start. Its answer is kept on `handleGuard`.
  - It counts a ratified edition whose signer, deliverer or preparer is the member, or whose document names the member's handle: a member `material_attestations:` row, an `observation_attributions:` row or a `member_ties:` row, each at `cover` or `name`.
  - It counts a waiting edition the same way, with signer and deliverer through `signerOf`.
  - It names the earliest by `signed_at`. It answers `{unreadable: true}` when its tables or the source cannot be read.
- **R33** C-122.6 now reads `photo.refused.changed.signed` and C-122.7 reads `document.refused.changed`, both by key (`PUBLICATION_WORDS`, verbatim). The commit's C-122.6 answer adds `photo`, the photos named, for `{photo}`.
- **K2483** `#criteriaOf` reads as `class:daemon` when no member signs.
- **D54** These tests are re-stated, each with a discoverable-project negative control:
  - `convert-casesign` :73 and :113;
  - `convert-deliverer` :38;
  - a new hidden-project test for `#criteriaOf` (`t35`, last test), whose negative control is a member outside the project, still fenced.
- **K624 delete** (map §3):
  - `schedule.mjs` is removed, with the `scheduled_editions` DDL and purge entry, row C-122.5 and the `listenerRefusal` import;
  - the delegates (`registerScheduledPublisher`, `scheduledPublisher`, `onPublishScheduled`, `publishListeners`, `scheduleEdition`, `publishWake`, `publishDue`, `publishAtMove`, `publishAtCancel`, `scheduledEditions`, `groupZone`, `waitingEditionOf`), the three re-exported constants and the ops `publishatmove`, `publishatcancel`, `publishschedule` are removed;
  - no SQL here names the table.
- **Tests that left with the copy** (map §7): `t34` R66–R69, R71, R31/R66 and R21 (R21 is re-stated in `t41` through R77); `t35` R74 and C-122.5; `t39` R67. `t34` keeps N597, R64, R65 and R70.

**Final `uses`, for `modules.json`:** drop `civil-time` and `jurisdictions`. Nothing in my paths imports them now. The rest is unchanged.

**Size (P6):** 3,553 lines over my paths (`deliverer.mjs`, `checks`, `door`, `index`, `schema`), down from 3,835. No split is needed.

**Reading set.** Over 300 KB (code 266 KB and tests 361 KB alone), so I followed step (3).
- **Read whole myself:**
  - `requirements/publication.md`; the extraction map; the plan entry and rule 4; layer 8's rows and the third-split section of `layers.md`; K31, K617, K624, K1821, K2438, K2442, K2471 and K2483;
  - `index.mjs`, `schedule.mjs`, `checks.mjs`, `schema.mjs`;
  - the tests `fixture`, `t34`, `t35`, `t37`, `t38`, `t39`, `invariants`, `seams`, `convert-casesign` and `convert-deliverer`;
  - the used services my entry calls: membership R124, R125, R44, R68 and `viewerPredicate`; `standards.standardRead`, `bindsAt` and `#readable`; case-grammar's attestation, tie and attribution row shapes and their writers in case-disclosures and case-tensions; `words.json`'s three keys.
- **Read by two workers, in full:** `deliverer.mjs`, `door.mjs`, and the tests `casedoc`, `cases`, `convert-d442`, `convert-mk6`, `convert-ratify-authority`, `convert-ratify-envelope`, `door`, `published`, `relation`, `services`, `sources`, `t28`, `t33`. That is 208 KB; their summaries were about 21 KB, every statement citing file and line.
- **Did the summaries leave out anything that mattered?** No. They found no use of the moved names, D54, C-122.5–.7 or the handle guard. They flagged the R21 and R70 paths and key-set assertions, which I checked: none broke.

**Reds at my merge (rule 4 (13)), each test newly red against `tranche/T41` @ 8b6e5ab802.** Cleared at my merge: publish-schedule `seam.test.mjs` R10's owner arm and R8 against the real publication.

The callers' gap is **wider than rule 4 (13) names**, for two reasons:
- `scheduler/index.mjs`:684 calls `publication.onPublishScheduled` when the plane is built, so every test that builds the plane throws until T41-49.
- `case-authoring/index.mjs`:730 (publishCase) calls `publication.waitingEditionOf`, so every publish act throws, not only R58 and R59, until T41-43.

K2438 rules out bridging this with delegates, so I added none. Whether this wider window is accepted, or the order is changed, is yours. The complete list, by module:
- **plane** (scheduler's boot, until T41-49): `accepted` :39, :60, :87, :105, :121, :135, :148; `ask` :48, :77, :83, :115, :165, :217; `compose` :29, :40, :52, :79, :103; `disclosures` :31, :42, :61, :74, :142; `docket` :30, :42, :62, :76, :86, :103, :122; `door` :100, :122, :156, :177, :198, :214; `findings` :115, :134; `hold` :28, :43, :50; `hosts` :35, :54, :63; `notices` :31, :57, :72, :80, :94, :118; `roster` :51, :63, :80, :91, :118; `split` :23, :41, :51, :67; `stats` :44, :74, :100, :122; `step` :29, :49; `store` :21, :33, :51, :68, :85, :119, :132, :150, :158, :170, :190; `sweep` :68, :89, :99; `t33` :59, :74, :88, :104, :115, :138, :153, :179, :205, :219, :254, :317, :351, :362; `t34` :13, :35, :44; `t36` :68, :107, :121, :138, :154, :168, :176, :202, :257, :270, :278, :314; `t39` :46, :66, :78; `unpack` :38, :68, :82; `watch` :63, :88, :106; `wizards` :35, :47, :60, :114; `worker` :43.
- **control-plane** (the plane's boot, until T41-49): `archive` :77; `doorbell` :318, :399, :438, :465, :496, :517; `inbox-door` :34, :58, :81, :95, :156; `provenance-split` :17; `r50-routes` :121; `r53-routes` :220; `t34-routes` :100, :149.
- **scheduler** (T41-49): `plane` :68, :77, :134, :159, :271; `t34` :213.
- **case-authoring** (`waitingEditionOf`, until T41-43): `document` :27; `drafts` :55, :118; `fences` :71; `identity` :47, :73, :120, :155, :196; `invariants` :43, :61, :141, :173; `members` :156, :195; `preflight` :443; `standards` :173; `statement` :29, :91, :116, :236, :280; `waiting` :46, :75, :103, :116, :138, :163; `whatchanged` :32, :75, :92.
- **affordances** (case-authoring's publish act through its world): `backing` :521; `converts` :186; `t34` :35.
- **ratification** (T41-39): `scheduled-commit` :121, :141, :162 (`scheduleEdition`); and :96, which went red before the delete because it expects C-122.6's old words. T41-39's N811 stop moves it to `photo.refused.changed.signed`.
- **op-declarations** `t34` :258 (until T41-58 or T41-63).
- **actions** `t34`: not red. queue-producers: its guarded call answers no scheduled item silently (T41-53).

**Found in other modules (REPORT):**
1. publish-schedule `t34.test.mjs`:217–226 (R3): `call` uses `w.p[act]` (publication) where it means `w.ps[act]`. It passed only while publication held the delegates, so it is red at my merge.
2. publish-schedule `seam.test.mjs` drops `scheduled_editions` while a `tell` queued by `scheduleEdition` (`schedule.mjs`:151) is still pending. `tell` → `publishWake` (:333–334, :156) is unguarded, so 3 uncaught "no such table" errors fail the file once its R10 red clears. This was already happening before my change, hidden by that red. Against its R6 ("one that throws never undoes the act"), `tell` should never throw.
3. Requirement text: C-122.6's commit answer now carries `photo` for `{photo}`. R33 says "`{photo}` the photos named"; the field's name is mine.
4. Generated artifacts: the plane bundle is staled by these sources (rule 4 (14)).

**Deferred:** none.

**Tests and checks.**
- `node --test bio-plane/test/m/publication/`: tests 135, pass 134, fail 0, todo 1 (R30, D-246, as before).
- No layer tests (manifest).
- Users' suites run against `tranche/T41`, compared above.
- From the process repository: `format` 0 failures; `architecture` 29 product files, 109 relative imports, 0 failures; `coverage` 47 of 47 live ids named, 0 failures; `ownership` 14 files changed, 0 failures.

Size (session_01BKNMquTmjnJkVp4dFUpPPJ): test runs 31, module lines 3553
