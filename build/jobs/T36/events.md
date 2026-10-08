# events (T36)

**Status** · session_01Lpr5zoWzhMTrc3S8CRoaGd · depth 2 · COMPLETE · handled B5

## J1 · QUESTION

R49's rows, three points where the wording leaves a choice. My best reading, which I am building now:
1. "attestations citing a capture extent (R7)": both forms that carry a capture extent, an `extent` attestation and a `dated_fact` attestation (it cites the fact's capture and extent, and was added by its own act and author, distinct from the dated fact's row). Testimony never.
2. A relation's citation (R17, held as an attestation with `serves='relation'`): an item `kind: "relation"`, `record` the relation id, `field: "attestation"`, `withdrawn` per R20. It is an attestation citing a capture extent, but its record is the relation, not an event.
3. `withdrawn` for an event's attestation: true when the event is a use withdrawn (R45), since the record named is then shown withdrawn; otherwise false (attestations themselves are never withdrawn). A merged-away event's rows answer the kept event (alias), and are not marked withdrawn.
Also: `EXTENT_MALFORMED` when `extent` is given and is not an object of a kind `content` knows (`CONTENT_EXTENT_KINDS`); `canonicalExtent` itself never throws, so "cannot read" is read as that.

## J2 · COMPLETE

T36-14 applied in full. Nothing deferred.

**Entries applied**
- R49 `recordedBy({captureSha, extent?, limit?, viewer})`, as amended by K2113 (B2) and K2114 (B3), in new `src/events/recorded.mjs`, reached as `Events.recordedBy`. It is in-process only and no arm of R36. The rows it answers:
  - dated facts;
  - event attestations, both the extent form and the dated-fact form; an alias answers its kept event, and `withdrawn` is true exactly when the event is a use withdrawn;
  - a relation's citation, as `kind: "relation"` with `record` the relation id and `withdrawn` per R20;
  - each passage a use cites: `stated_reason`, `outcome`, `scope`, `conditions`, `unmet`.
  
  Sight follows R40. A use's cited passage is answered only when the viewer may see the use's event as well as the cited capture, so a fenced event is never named through a visible passage. Each item's extent is `canonicalExtent`'s string parsed back to an object. Items are ordered by that string (code-unit order), then `record`, then `field`, with one item per cited extent.
- The hub fix (K2079). `owner.mjs` now counts connections per kind and judges each kind against `connection-grammar.hubBoundOf(kind)`. A hub is answered `{set_size, why}` for the kind over its bound, naming that kind. `BOUNDS.hub` no longer judges the whole set.

**Found in other modules (no action of mine)**
- answer-envelope `families.test.mjs`:49 (R2, R7, CHECK_FAMILIES total) fails on this branch. It names `file-safety/checks.mjs` and `file-safety/index.mjs` `FILE_SAFETY_CHECKS` as unreached by the list. This is file-safety's or answer-envelope's (L3/L11), not events', and is not on rule 5's list as I read it.

**Reading (mechanics §17)**
- Read whole myself (about 260 KB):
  - requirements;
  - layer 5's row;
  - all of `src/events/` (index, owner, uses, follow, time, schema, checks);
  - the tests I changed (`owner.test.mjs`, `fixture.mjs`, `uses.test.mjs`);
  - the used services: connection-grammar `bounds.mjs` and R6/R10/R19, content `canonicalExtent`, `extentRelation`, R2/R5/R6, and extraction's `noSha`.
- A worker read the other seven test files whole (events, reads, follow, participants, datedfacts, relations, ops) and wrote a summary of about 6 KB, citing file:line. Nothing it left out mattered: no test there touches the owner or hub, and the ops key list is exact, which is why R49 has no arm.

**Tests and checks**
- events: `node --test test/m/events/`: tests 60, pass 60, fail 0.
  - The new hub test (1,500 `event_voted` paged at the fan-out, 1,500 `event_present` answered hub, a mixed node) fails against the old owner.
  - Mutations caught: the dropped event-sight check, the withdrawn-use mark, the per-extent dedupe.
- Users of events (29 suites plus `system/migrate-released`): all pass except the expected reds:
  - progressions `order.test.mjs`:12 (red 16);
  - op-declarations `t33`:192 and `t35`:196 (red 17), and `t34`:135 (red 13);
  - answer-envelope `catalogue-end`:17 (red 18), and `families`:49 (above).
- `format`: 135 modules, 134 requirements files; 0 failures.
- `architecture events`: 19 product files, 65 relative imports; 0 failures.
- `coverage events`: 49 of 49 live requirement ids named by a test; 0 failures.
- `ownership events tranche/T36`: 6 files; 0 failures.

**P6**: module 2,427 lines (src), under 4,000.

Size (session_01Lpr5zoWzhMTrc3S8CRoaGd): test runs 16, module lines 2427

## J3 · COMPLETE

B4 and B5 applied (tranche/T36 @ a263514dc1 merged). Nothing deferred.

**B4 (K2116)**
- `recordedBy`'s `VIEWER_MISSING` and `EXTENT_MALFORMED` are now answered `{ok: false, refused, code, reason, why}`.
- I added no catalogue row, so none was removed.
- A test pins the shape.

**B5 (K2119)**
- `owner.mjs`'s `neighboursOf` now reads in three steps:
  1. It reads the node's set as candidates: kind, event and the attestation's sight. The role is filtered in SQL, and live events come through a join.
  2. It reads every candidate event's time in bulk, through new `index.mjs` `#whensRead`, `#governingMany`, `#whenRows` and `#upperBounds`. The single-event `#whenRead`, `#governing` and `#whenRow` are now these called with one id, so there is one code path. It then judges validity at `at`, and each kind's hub against `hubBoundOf`.
  3. It builds evidence, grades and facets only for the page's rows. The entity's end grade is memoised per (entity, capture), event grades per event, and the view and zone are read once per call.
- The answers are unchanged: all 61 events tests pass, including the conformance battery.
- Measured on a 4,000-`event_voted` member, the four pages together: before 11.5 s (56k queries per page), after 1.2 s (10k per page). The remaining cost is mostly record-core's `readDerived`, one call per event (R10's fail-closed check).
- New test (P7) in `owner.test.mjs`: four fan-out pages of a 4,000-vote member, joined complete, together under half of `time_budget_ms`; a kind not asked is cheap; a 4,001st vote makes the member a hub. Against the previous owner it fails (11,835 ms).

**Tests and checks**
- events: tests 61, pass 61, fail 0.
- Users of events (29 suites plus `system/migrate-released`): every suite passes except the same expected reds as J2:
  - progressions `order`:12 (red 16);
  - op-declarations `t33`:192, `t35`:196 (red 17) and `t34`:135 (red 13);
  - answer-envelope `catalogue-end`:17 (red 18), and `families`:49 (file-safety's `FILE_SAFETY_CHECKS`, reported in J2).
- explore `mx1a.test.mjs` passes; its events arm runs after my merge.
- `format`: 0 failures; `architecture events`: 0 failures; `coverage events`: 49 of 49, 0 failures; `ownership events tranche/T36`: 6 files, 0 failures.

**P6**: module 2,502 lines.

Size (session_01Lpr5zoWzhMTrc3S8CRoaGd): test runs 24, module lines 2502
