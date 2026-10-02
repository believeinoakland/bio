# queue-producers (T22)

**Status** · session_01S5Ac7dPiVcZZju3Knt2DK6 · depth 2 · WORKING · handled B2

## Completion (QUEUE-PRODUCERS #6)

**Entries applied** (B1; B2 answering J1, K1105):
- (1) R20 (N476): `template-review-requested` is homed under the `project` `reviewsRequested` answers, at depth 0 and above it through queue's walk (`#homesAt`); a `group` template's item (project null) is ungrouped. The project is named on the subject and basis only when the viewer may see it (R11). Comment re-worded.
- (2) R22 (DEC-95 (1), as re-worded at K1105): both `capture-completed-unattended` producers carry `basis.grade_notes` and, in the detail, capture's exported `ACQUIRE_GRADE_NOTE` for each capture named and held by its `register` row (under the item's bundle, at most 8; the request's own `capture_sha`), none for a capture whose register row's bundle the viewer may not see.
- (3) R23 (DEC-102 item 3): new OBLIGATION `attribution-unchosen`, one per (case edition, observation), from the prepared, unsigned editions listed from `case_documents` (publication R56; the latest edition of each case only, a later one replacing an earlier preparation), each asked of `caseDocumentFacts` under the viewer (its standing fence), the author read from `register` (provenance R48); to the author alone, offering `op=attribute`, aged from `authored_at`, at most 200 editions with the cut stated. Readings recorded: an observation whose `current` level is null is unchosen (that includes a chosen level the record cannot publish, e.g. `name` with no handle, which publication answers null with its why; offering the choice again is right); the item is homed through queue's walk from the observation. When the store holds no `case_documents` table (a caller's test world; never the plane, which migrates publication), the producer answers none rather than throw.
- (4) R24 (DEC-107): five member-facing sentences re-worded ("a signal is a fact about OUR OWN machinery" twice, "satisfaction test", "asks nothing of you", "whether what it set was met"); codes, kinds, ids unchanged.
- (5) R25 (DEC-110 (1)): `due` (`YYYY-MM-DD`, null when the provider states no readable day) on `action-clock-overdue`, `action-reminder` (the entry's date) and `plan-checkpoint-due` (the checkpoint's day), on no other item.
- (6) Wording: one comment at the `exportLog` call names `corpus-export` (its R1, R2) as the log's owner, reached through publication until N483; no comment named publication as its owner.
- (7) `proposals.test.mjs`: the first declaration states a basis; its five tests are green (the inherited red cleared).
- (8) Stale notes: the deleted plane `index.mjs` named as live at the governor's comment and in the unattended item's basis sentence (member-facing), and queue's old `#queueAncestorEdges`, re-worded; the `legacy-tests` mentions in two test headers are provenance and stay.
- R8 met: R22 and R23 are read into `feedItems`. Header comments now say R1–R25.

**Deferred:** none.

**Found in other modules:**
- `queue`: R23's kind `attribution-unchosen` must be catalogued (queue R1, R11) and its door named (queue R12, `op=attribute`) before a feed holding one is minted; until then a member with an unchosen level on a prepared case gets the whole feed refused `NO_SUCH_KIND`. Queue's R49 sort reads `due` (R25). Both are queue's job after this merge.
- The plane bundle `bio-plane/dist/bio-plane.bundled.mjs` is stale from this change under `bio-plane/src/queue-producers/` (regenerated nothing).
- `capture.gradeNoteOf` is asynchronous; R22 reads its answer synchronously from the register (K1105). No change asked of capture.

**Tests and checks run:**
- `node --test bio-plane/test/m/queue-producers/`: tests 59, pass 59, fail 0 (R20 homing, R22, R23 ×4, R24, R25 ×2, R8 new tests).
- `node --test bio-plane/test/m/queue/` (my user): tests 80, pass 80, fail 0.
- `node --test bio-plane/test/m/`: tests 4964, pass 4947, fail 5, todo 12; the five are accepted by name: control-plane `catalogue-end.test.mjs`:15 and `doorbell.test.mjs`:310; accepted red 4 (membership `module-order.test.mjs`:12, `t9-notice-sight-bounds.test.mjs`:185, promotion `registry.test.mjs`:58). No new red.
- `checks/format.mjs`: 86 modules, 85 requirements files; 0 failures. `checks/architecture.mjs queue-producers`: 12 product files, 48 relative imports; 0 failures. `checks/coverage.mjs queue-producers`: 25 of 25 live requirement ids named by a test; 0 failures. `checks/ownership.mjs queue-producers tranche/T22`: 9 files changed; 0 failures.

Size (session_01S5Ac7dPiVcZZju3Knt2DK6): test runs 16, module lines 3001

## J1 · QUESTION

Two reads R22 and R23 need that the providers do not offer synchronously, and `feedItems` (R8) is one synchronous read (`queue/index.mjs`:841, `queueFeed` :774 is synchronous). I carry on with R20, R24, R25, (6), (7), (8) meanwhile; R22 and R23 wait on this answer.

(a) R22. `capture.gradeNoteOf({captureSha, viewer})` (`capture/index.mjs`:1055) is `async`: it awaits the evidence store's `head` (or `provenance.registerHolds`) to decide the capture is held. `feedItems` cannot await it. My best reading: capture offers a synchronous sibling answering by the viewer and by the register alone (`gradeNoteFor({captureSha, viewer})`: `note` = `ACQUIRE_GRADE_NOTE` when a `register` row names the capture and `#captureSeen` passes, else `null`), and I read that; capture's job (a later tranche, or a CHANGE now) builds it. The alternative, `feedItems` becoming async, changes queue R8's caller and `queueFeed` (queue's job, control-plane's door) and I would not choose it. Also what "each capture it names" is for the first producer (`#conditionsCaptureUnattended`, a bundle completed by a machine, naming no capture digest): my reading is each capture `register` names under that bundle (provenance R48), at most 8 (R2's option bound); the second producer names its request's `capture_sha`.

(b) R23. No read lists the prepared, unsigned case editions: `caseDocumentFacts(case, edition, viewer)` answers one edition I already know (its `attribution.current` gives level-or-null per reached observation, and `doc.authored_at` the preparation instant), and the requirement's suggestion says to name a further read to BOB rather than read `publication`'s tables. My best reading: publication offers `preparedEditions({after, limit, viewer})` → `{items: [{case, edition, authored_at}], cursor, truncated}`, every unsigned case document the viewer has standing for (R1's `hasCaseStanding`), and I call `caseDocumentFacts` per edition. The observation's author I read from `register` (`author`, `authored = 1`; provenance R48's read contract), never from publication. Until that read exists, R23 cannot be built at my interface except by reading `case_documents` directly, which I will not do without your ruling. If you prefer, rule `case_documents`' `case_id`, `edition`, `authored_at`, `sig_armored` a stated read contract of publication (as provenance R48 is) and I build R23 now.

## J2 · REPORT

Found in other modules (my record, Completion): (1) queue owes R23's kind `attribution-unchosen` in its catalogue (queue R1, R11) and its door `op=attribute` (queue R12) before a feed holding one is minted; until then a member with an unchosen credit level on a prepared case gets the whole feed refused NO_SUCH_KIND. queue R49 reads `due` (R25: action-clock-overdue, action-reminder, plan-checkpoint-due). (2) The plane bundle `bio-plane/dist/bio-plane.bundled.mjs` is stale from my change under `bio-plane/src/queue-producers/`; I regenerated nothing.
