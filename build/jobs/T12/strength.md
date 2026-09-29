# strength (T12)

**Status** · session_01C7KuT5Ve2TXwNG6xNQHedA · depth 2 · COMPLETE · handled B1

## Completion (STRENGTH #3, 2026-09-29)

**Entries applied.** N303 (B1): `inquiryStrength` (R6) now withholds every member the viewer may not see whole, in the members and in the prose. A member whose leg, target or inherited-from bundle is unseen leaves every list it was in (`not_load_bearing`, `undetermined_at`, each ground's); a `weakest` it was loses the key; a seen member's `through` naming an unseen leg loses the key. None becomes a null or a stand-in. In prose, an unseen id leaves a list that still names a seen one, `(through …)` and `, which is …` go, and any sentence still naming one is dropped. A swept string ends in one fixed sentence ("Part of what this rests on is out of your view."). When any top-level leg is unseen, the counts `load_bearing` and `population` are withheld on every axis and ground, since they count unseen members, a load-bearing one no list names included. `out_of_view: true` sits on each affected axis and on the answer. Grades, states and ground labels stand for every reader. **Meets R6's `not yet met` mark (N303).**

**Reading taken without asking** (detail, under R6's words): a `through` pointer is a reference inside a seen member, so only the key goes, not the member.

**Tests.** `bio-plane/test/m/strength/reads.test.mjs`: R6's redaction test is rewritten (the member is withheld whole, with no placeholder, no null id field and no `through` key; the fixed sentence; a participant sees all). A new R6 test shows that no count can be read: two worlds with one and three unseen legs of each kind (the weakest, a ground's weakest, an inert leg, and a load-bearing leg no list names) give byte-identical answers for the member who may not see them, while the record's own counts differ.

**Found in other modules (REPORT).**
- *Generated artifacts made stale:* `agent-worker/dist/agent-worker.bundled.mjs` and `bio-plane/dist/bio-plane.bundled.mjs` include `bio-plane/src/strength/index.mjs`. `fleetbundles.test.mjs` fails with 1 (agent-worker STALE BUNDLE, as expected). Not rebuilt (mechanics §14).
- *legacy-tests, broken by design (they assert the replaced placeholder behaviour):* `bio-plane/test/inquirystrength.test.mjs` shows 63 pass, 5 fail. The fails are "the uninvited member gets the SAME derivation — … counts …", "and the id ALONE is withheld, redacted to null", "but the sentence still says … an object was withheld", "the CAPTURE axis derives identically too", and "and the project leg IS named on capture". `bio-plane/test/grounds.test.mjs` §6 throws at line 672, reading `weakest.target_id` of a ground whose weakest is now withheld. Both suites passed 68/0 and 70/0 before the change. `strength.test.mjs` (42/0) and `gate-reads.test.mjs` (165/0) still pass.
- *The same placeholder in other modules* ("an object you may not see" beside a null): conformance (`UNSEEN`, its R9, with a test asserting it), consequences (`index.mjs` 563, 592), escalation (374) and filings (564, 675, 731). Whether DEC-36 governs those is Bob's, as N303 says of dependents. Listed for BOB, not judged.

**Deferred.** None.

**Tests and checks run.**
- `node --test bio-plane/test/m/strength/`: pass 45, fail 0.
- `node --test bio-plane/test/m/conformance/ bio-plane/test/m/consequences/` (callers of the op's shape): pass 54, fail 0.
- `node checks/format.mjs`: 69 modules, 64 requirements files; 0 failures.
- `node checks/architecture.mjs … strength`: 9 product files, 34 relative imports; 0 failures.
- `node checks/coverage.mjs … strength`: 27 of 27 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … strength tranche/T12`: 3 files changed; legacy-store 0/0, legacy-checks 0/0; 0 failures.

Size (session_01C7KuT5Ve2TXwNG6xNQHedA): test runs 6, module lines 1447
