# people (T36)

**Status** · session_019jdYasEZ5G5btsBgnEcz4B · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

R36 / events R49's shape, three readings I am building on (carrying on; answer only if any is wrong):
(1) `extent` on an item is `content.canonicalExtent`'s form parsed back to an object (`JSON.parse(canonicalExtent(x))`), and "the order of their canonical extent" is the order of that canonical string (code-unit order), then `record`, then `field`. canonicalExtent is total, so `EXTENT_MALFORMED` is: `extent` given and not an object, or its `kind` not one of `content`'s `CONTENT_EXTENT_KINDS` (R1's eight and `envelope`).
(2) An identity claim's evidence cites up to two extents (`evidence.a`, `evidence.b`); each citing the capture is its own item, both `field: "evidence"` (the same `record`, told apart by `extent`). A claim is answered only to a viewer who sees its project (R31) and the capture.
(3) `VIEWER_MISSING` for an absent or empty viewer only; a viewer membership denies (malformed stamp) sees no capture, so answers `items: []`.
These matter for retrieval R76's merge across events, standards, money and people: if (1) differs in the other three jobs, one ruling should fix it for all four.

## J2 · COMPLETE

T36-17 complete. Branch `job/T36/people`, tranche/T36 @ bf82a4490b merged (B2).

**Entries applied.** T36-17 (N715, its share): R36 `recordedBy({captureSha, extent?, limit?, viewer})` (`bio-plane/src/people/index.mjs`, section "Who recorded what from a passage"), in events R49's shape as K2114 words it: person facts by their citation (`person_facts` and the contact table; `kind: "person_fact"`, `field: "citation"`, `withdrawn` per R11), identity claims by each end of their evidence citing the capture (`kind: "identity_claim"`, `field: "evidence"`, one item per cited extent, `withdrawn` per R4). Sight R31's: the capture's visibility gates the read (a hidden capture answers as one not held), a claim inside a project the viewer may not see is neither answered nor counted; contact facts carry no value (no item does). Never items: expunged rows (record-core deletes them), ties, the source link, check results (none cites a capture; tested that a link and a tie whose text names the capture leave the answer identical). Not an op (R27's arm list unchanged). New exports `RECORDED_BY_DEFAULT` (100), `RECORDED_BY_MAX` (500). B2 (K2114) applied: my J1 readings were already built; nothing changed after the merge.

**Improvement in my module.** Indexes `person_facts_capture`, `person_contacts_capture` (schema.mjs) so R36 does not scan the fact tables; identity claims are prefiltered by `instr(evidence_json, sha)` and checked exactly.

**Deferred.** None. Requirement markers `*(not yet met: T36)*` on R36, Uses (content, events) and the T36 Suggestion are BOB's to clear.

**Found in other modules.** None.

**Reading set.** Measured as mechanics §3 asks: my requirements 25 KB, my code 123 KB and tests 110 KB, the 14 used modules' Purposes 7 KB, events R49 and content R1–R9 (the services this entry uses) ~8 KB, record-core R79's expunge in code: ~275 KB, under 300 KB; read whole. No worker summary.

**Tests and checks.** `node --test test/m/people/`: tests 46, pass 46, fail 0 (6 new R36 tests in `recordedby.test.mjs`). No provided service changed (R36 is new; no user calls it yet), so no users' tests run. Checks: format 0 failures; architecture 12 product files, 0 failures; coverage 36 of 36 live ids named, 0 failures; ownership 4 files, 0 failures.

**P6.** Module 2,020 lines (src), far under 4,000.

Size (session_019jdYasEZ5G5btsBgnEcz4B): test runs 5, module lines 2020

## J3 · COMPLETE

B3 (K2116) applied; tranche/T36 @ a263514dc1 merged. `VIEWER_MISSING` and `EXTENT_MALFORMED` now answer `{ok: false, refused, code, reason, why}` (each the code; `why` the sentence), no catalogue row (people had added none). A non-hex sha answers `items: []` (tested). `NO_SHA` stays people's own `{ok: false, reason, detail}`: K2116 (2) routes it "through `extraction.noSha`", but `extraction` is not in people's Uses (`modules.json`), so I did not import it; if the ruling binds people too, that is an edge for BOB to add, and I will apply it on a CHANGE.

Tests: `node --test test/m/people/`: tests 46, pass 46, fail 0. Checks: format 0 failures; architecture 0 failures; coverage 36 of 36, 0 failures; ownership 0 failures.

Size (session_019jdYasEZ5G5btsBgnEcz4B): test runs 6, module lines 2023
