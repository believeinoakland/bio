# following (T35)

**Status** · session_01Ns8nGmvGwjcv67gEvqEcfv · depth 2 · WORKING · handled B2


## Completion (FOLLOWING #3)

**Entries applied.**
- **T35-65** (N652; K1727, K1740, K1881; DEC-145 (5)), on the J1 readings B2 confirmed (K2025):
  - **R20.** Subject kind `policy`. Every policy `standards` holds is watched with no member act: kind `policy`, held `text`, not superseded, its text from a capture with a direct receipt at a public https address. The capture and address are found through content R45 and provenance R48 in this module's own SQL. Each policy's text address gets one watch, reconciled from `standardsIn` at each due, wake, tick and `follows` read. A new watch is due 7 days after its policy's own text capture; it runs under the host as any follow and reads through `capture.acquire`'s capture-request arm (daemon, `heldSha` the last version seen, no credential).
  - What a read keeps. The same bytes land nothing. Bytes that differ land as a new capture beside every earlier one, kept in `policy_versions`. A failed read is recorded with its reason and counts as the read (at most every 7 days). A `paywalled` or `reading_room` policy answers `member_act_required` and nothing is fetched.
  - Sight. Captures land in the policy text's bundle while standards holds the policy at its source's sight (R37), otherwise group-wide.
  - Author and end. A watch's author is none: R14 answers `author: null`, and `unfollow` refuses it. The watch ends when its policy is superseded or is no longer watchable. R19's listeners are told when a watch is made or ended.
  - **R21.** `policyChanges({after, limit, viewer})` answers one entry per kept version that differs from the one before, ordered by the later capture's instant, with a cursor and a limit clamped to 1–200. A change in a policy the viewer may not read is left out whole. `amendment_held` reads the successor's start or version-basis band end, or an adopted temporal relation into the policy, between the two captures' local days. It writes nothing.
- New table `policy_versions`, declared with its classes (R17). New tests in `policy.test.mjs` (R20 ×4, R21). The fixture gains a `standards` stand-in coded to its requirements and `content`'s R45 table.

**Deferred.** None.

**Found in other modules / stale artifacts.**
- `acquisition` (T35-21, K1940) mints its `ARCHIVE_CHECKS` rows as `C-137.1` onward (`src/acquisition/checks.mjs`:270 and on). C-137 is following's family (K1836, K1856). This turns following's `checks.test.mjs`:118 red ("C-137 is following's alone"), and it is red on `tranche/T35` before this job. It is not a named accepted red. Fix: acquisition's archive rows take a family number of their own. Sent as a REPORT. The test is not weakened.
- `bio-plane/dist/bio-plane.bundled.mjs` (not_product) is stale from this change, for regeneration at L10's close.
- No op is added: `notice-producers` reads `policyChanges` in-process (T35-67).

**Tests and checks run** (after merging `tranche/T35` with K2025).
- `node --test bio-plane/test/m/following/`: tests 49, pass 48, fail 1 (the C-137 collision above; 43/44 before, with the same one failure).
- Users: `node --test bio-plane/test/m/notice-producers/ bio-plane/test/m/scheduler/`: tests 140, pass 139, fail 1 (red 31, scheduler `plane.test.mjs`:151).
- `format`: 130 modules, 129 requirements files; 0 failures.
- `architecture following`: 14 product files, 42 relative imports; 0 failures.
- `coverage following`: 21 of 21 live requirement ids named by a test; 0 failures.
- `ownership following tranche/T35`: 5 files changed; 0 failures.

Size (session_01Ns8nGmvGwjcv67gEvqEcfv): test runs 11, module lines 1320

## J1 · QUESTION

R20/R21 readings; I am building on them now. Only (2) needs an act from you.

1. **Which standards are watched.** Standards of kind `policy` (standards R1), held `text`, not superseded. A policy whose family is undetermined is still watched: `family` is a series, not the policy test.
2. **The capture and its address (needs `modules.json`).** Standards' reads give a policy's text only as content ids. A content id is a hash, so getting from it to its capture means reading `content`'s R45 read contract (`content.content_id` → `capture_sha`, `bundle_id`). The address then comes from provenance R48 `captured_locators` (`via = 'direct'`, its `address` public https). Following does not use `content` today. Please add the edge `following` uses `content` (layer 4, earlier). I join the R45 table in my own SQL and do not import content.
3. **"Handed to standards as a version from captures."** Standards has no machine write: R1, R10 and R38 are member acts, and R9's proposal takes no `version_basis`. My reading: the kept capture is a held capture with a direct receipt at the policy's address, which is exactly what standards R38 `version_basis {captures:[earlier, later]}` takes. R21 answers both digests, so a member who acts on the "Noticed" item names them. No standards proposal is filed. Standards' text is never touched.
4. **Author none.** A watch's row holds no member author; R14 answers `author: null`. `unfollow` refuses a policy watch with `NOT_THE_AUTHOR`. The watch ends only when its policy is superseded, or when it is no longer a watchable held policy.
5. **7 days, failed reads included.** An attempt that fails also moves `last_read`, so the address is fetched at most every 7 days (K1881). It is recorded `failed` with its reason and stays watched.
6. **Made when first held.** Standards offers no listener, so the watches are reconciled from `standardsIn({kind: "policy"})` at each due, wake, tick, `follows` and `policyChanges` call. R19's listener is told on each make and end.
7. **Sight.** A watch's captures land in the policy text's bundle (its project) while standards holds the policy at bundle sight, otherwise group-wide. R14 and R21 show a watch or change only to a viewer standards lets read the policy (`isMeasure(id, viewer)`, true for a held-text policy exactly when the viewer may read it). An absent viewer sees none.
8. **`amendment_held`.** True when the policy's successor (`superseded_by`) has a period `from`, or a `version_basis` band end, between the two captures' local days inclusive, or when an adopted temporal law relation into the policy (`lawRelationsOf`, `in`, not withdrawn) has its effective day in that range. An event effective date is read from events.
9. **`member_act_required`.** A policy whose `access` is `paywalled` or `reading_room`: nothing is fetched (R8, R15).

## J2 · REPORT

Found in acquisition (T35-21, K1940): its ARCHIVE_CHECKS rows are numbered C-137.1 onward (src/acquisition/checks.mjs:270 on), but C-137 is following's family (K1836, K1856). This turns following's checks.test.mjs:118 red ('C-137 is following's alone'); it is red on tranche/T35 before my job and is not a named accepted red. Proposed fix (acquisition's, or a catalogue ruling): give acquisition's archive rows a family number of their own. I have not weakened the test.
