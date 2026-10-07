# connection-grammar (T36)

**Status** · session_01H9M3DEa6cwNZgYQXQhaJuf · depth 2 · WORKING · handled B1

## Completion

**Reading set.** Read whole, as B1 asks (83 KB, under the 300 KB limit): my requirements; record-grammar's and civil-time's public parts; layer 1's contract; every file of my code and tests; my plan entry (T36-40), the plan's "Rules at the opening" and the rulings it cites (K1566, K1726, K1881, K2063, K2072).

**Entry applied (T36-40, N566).**
- **R10:** `BOUNDS.hub_by_kind`, frozen and with no prototype, `{event_voted: 4000}`; every other kind keeps `hub`'s 1,000. `BOUNDS.hub_by_kind[kind] ?? BOUNDS.hub` reads a kind's bound and nothing inherited (`constructor`, `__proto__` read 1,000); `hubBoundOf(kind)` is exported beside it so `explore` (T36-42) reads the same bound without restating the rule. The `hub` exhaustion's `why` names the per-kind bound.
- **R6, R19:** the registry's read judges a hub answer per kind: the answer names no kind, so its `set_size` must exceed the least bound of the owner's kinds that were asked (asked `event_voted` alone, it must exceed 4,000; with any other kind asked, 1,000). Below that it is refused whole, `OWNER_NONCONFORMING` naming `hub`.
- **R9 (the battery, same rule):** a hub shown as items is now caught: over the pages joined, a kind with more items than its bound fails `hub`. At the fixture's hub node the battery also asks each kind alone and judges any hub answer against that kind's own bound, so an owner judging the whole set against 1,000 fails.
- Tests: `hub-by-kind.test.mjs` (new; R6, R9, R10, R19: 3,400 votes paged whole, 4,000 not a hub, 4,001 a hub; meetings at 1,000/1,001; a mixed set under each kind's bound; a vote set answered as a hub at 1,500 refused; the battery's two new failures); R10's and R17's key lists in `bounds-walk.test.mjs` and `invariants.test.mjs`.
- R6, R10, R19 now met: their `*(not yet met: T36)*` marks are BOB's to strike.

**Deferred:** none.

**Found in other modules (REPORT J2).**
- **events** (`bio-plane/src/events/owner.mjs`:95) judges a hub on the whole set of the kinds asked against `BOUNDS.hub` (1,000), not per kind as connection-grammar R6 now says. Two consequences: a member with 1,001–4,000 votes, read for `event_voted` alone, is answered a hub of that size, which the registry now refuses `OWNER_NONCONFORMING` (explore then reads an owner refusal, not the votes); and a node with, say, 600 votes and 600 of another kind is answered a hub though no kind exceeds its bound (the registry cannot see that, the answer naming no kind). The fix is events': count per kind and compare with `hubBoundOf(kind)`. Events' own tests and every other user's are unchanged by this job (below), so nothing is red today; it shows only on real volumes, and T36-42's M-X1a re-measure on a 4,000-vote fixture will meet it if it reads through events' owner.
- **Stale artifact:** the plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`; its inputs carry `bounds.mjs`, `reads.mjs`, `conformance.mjs`), regenerated at the layer close. Case-checker's `program.mjs` carries only `shape.mjs`, unchanged.

**Tests and checks run.**
- `node --test bio-plane/test/m/connection-grammar/`: tests 33, pass 33, fail 0.
- Users, my tree and `tranche/T36` (9d1e10e2d6) identical: money 57/0, duties 49/0, inquiry-grammar 60/0, lines 30/0, membership 168/3 (accepted red 3), standards 65/1 (accepted red 3), connections 119/0, hypotheses 30/0, inquiry 175/0, affordances 208/0, events 54/0, plane 130/0, law-relations 26/0, progressions 61/0, money-checks 46/0, entities 95/0, explore 27/0, contradiction 119/0, local-facts 38/0, people 40/0, calculations 47/0, case-checker 44/0. No layer tests are named in the manifest.
- `format: 135 modules, 134 requirements files; 0 failures`
- `architecture: 15 product files, 35 relative imports (0 naming no tracked file, not judged); 0 failures`
- `coverage: 1 modules, 20 of 20 live requirement ids named by a test; 0 failures`
- `ownership: 8 files changed by connection-grammar between tranche/T36 and HEAD; 0 failures`

Size (session_01H9M3DEa6cwNZgYQXQhaJuf): test runs 6, module lines 1508 (code 690)

## J1 · REPORT

events (bio-plane/src/events/owner.mjs:95) judges a hub on the whole set of the kinds asked against BOUNDS.hub (1,000), not per kind as connection-grammar R6 now says (T36-40). (1) A member with 1,001-4,000 votes read for event_voted alone is answered a hub, which the registry now refuses OWNER_NONCONFORMING (explore reads an owner refusal, not the votes). (2) A node with e.g. 600 votes and 600 of another kind is answered a hub though no kind exceeds its bound (undetectable at the registry: a hub answer names no kind). The fix is events': count per kind and compare with hubBoundOf(kind) (exported beside BOUNDS; BOUNDS.hub_by_kind[kind] ?? BOUNDS.hub reads the same). Nothing is red today (events 54/0, explore 27/0, unchanged); it shows on real volumes, and T36-42's M-X1a re-measure on a 4,000-vote fixture meets it if it reads through events' owner. Also: the plane bundle is stale (bounds.mjs, reads.mjs, conformance.mjs).
