# publication (T36)

**Status** · session_01CPZYbhuFESBkajW7tmoEjb · depth 2 · COMPLETE · handled B1

PUBLICATION #23 · T36-26 · B1 START handled.

## Reading (mechanics §17; N739)

Measured at the START: my own code (`deliverer.mjs`, `publication/` less `worker.mjs`) about 264 KB, my tests about 357 KB, my requirements 57 KB: over 300 KB with the used modules' public parts, so read under the START's rule (3):
- **Read whole myself:** `build/requirements/publication.md`; layer 8's row of `build/layers.md`; my plan entry T36-26 and the plan's "Rules at the opening"; K2129 and K1643, K2111 in `build/rulings.md`; `plan/draft-T36-L8-L10-reqs.md`'s publication section, its "F1's tail", "For BOB" and "BOB's review"; the code the entry changes, `publication/door.mjs` and `publication/index.mjs` (2,514 lines); the tests the entry changes, `door.test.mjs`, `t33.test.mjs`, `t35.test.mjs` and `fixture.mjs`. Used services the entry names, read at their call sites: `store-door` R9 (the store's door reads stamps from body or header, hands owners `store.routes(url, body)`), `plane/door.mjs` (passes the door the request body), `case-tensions.caseRelation` (its R1), `standards.standardRead`/`bindsAt` as R72 calls them.
- **Read whole by my workers, summarised with file:line citations:** (1) `deliverer.mjs`, `checks.mjs`, `schedule.mjs`, `schema.mjs` (about 4 KB summary: no secret, address, `caseRelation` or criteria composition in any; `criteria` is a column of `published_cases`, schema.mjs:580–584; checks rows C-122.1–.5); (2) the 15 other test files (about 6 KB: none calls `caseRelation`, passes `secretSha` in an address or exercises R72; `w.op("casedocument", …)` reads `case`, `edition`, `viewer` from the address only, unaffected). Nothing they left out mattered to this entry.

## Applied

- **R73 (F1's tail; K2111, K2129).** `door.mjs`: the door reads the review grant's secret only from the request body's `secret`; an address `secret` is not read, compared or hashed, admits nothing (R1 answers as with no secret), and is never passed on; no answer carries `deprecated`; the `CREDENTIAL_IN_ADDRESS` export is gone (admission's one site, K231). The fingerprint reaches the store in the store request's **body** (a POST, `{secretSha}`), never its address (fixes `door.mjs`:91). `index.mjs` `publicationOps.casedocument` reads `secretSha` from the body alone (a non-empty string); an address `secretSha` admits nothing. No header is used: the owners' maps receive `(url, body)` only (store-door R9's headers are mapped onto the in-process URL by store-door, which names no `secretSha` header), so the body is this module's channel.
- **R61 (N597; K1643).** The `caseRelation` delegate is deleted; the module serves none of case-tensions' services and exports none of its names; header comments re-worded.
- **R75 (N717; K2129).** `criteriaFor({members, signer, at})` → `{rows}`: the same private composition `#criteriaOf` R72's commit uses (one code path, so a preparation and its commit agree but for a change in the record), read as `member:<signer>` (`admin` for none) on the UTC day of `at` (now when absent); writes nothing, no op, never throws (malformed arguments, unreadable members and a throwing record give no row).

Nothing deferred. R30 stays as before (D-246, its own todo).

## Tests

- `door.test.mjs`: R73 re-pinned (body forms read; the address secret alone, beside any non-secret body, answers R1's no-secret 404, is never hashed or passed on; the fingerprint is in the store request's body, never its address; no `deprecated`; no `CREDENTIAL_IN_ADDRESS` export); a new R73 store-op arm (a body `secretSha` admits, an address one admits nothing). R1/R73 reviewcopy arm reads the body.
- `t33.test.mjs`: R61 now names `caseRelation` among the moved names: absent from the instance and the exports, case-tensions answering it.
- `t35.test.mjs`: two R75 tests (equality with R72's committed rows for the same roster and day over every row kind; signer and day; writes nothing; founder `admin`; `[]`; unreadable members; throwing reads; malformed arguments).
- Each new or re-pinned test was run against the old code: all six fail there, all pass on the new code.
- **Module:** `node --test bio-plane/test/m/publication/`: tests 122, pass 121, fail 0, todo 1 (R30). Before: 119, 118, 0, 1.
- **Users of publication** (18 modules' tests plus `test/system/migrate-released.test.mjs`): 1,820 tests, 1,807 pass, 13 fail. Before this change, on the same tree: 1,810 pass, 10 fail (the inherited reds: affordances, op-declarations, answer-envelope, control-plane `r53-routes`, agent-worker reach; rule 5's 18–24 and the like). **New reds from this merge, by name, all of the address form or the store address this entry removes:**
  1. control-plane `converts.test.mjs`:108 "R30, R2 (reviewcopy convert)", failing at :130 (reads `secretSha` from the store request's address params), and its address-form arm at :145 (`deprecated`).
  2. plane `body.test.mjs`:25 "R6 (K2011; publication R73) … reaches the store as its SHA-256", failing at :28 (expects `secretSha=` in the store address).
  3. plane `body.test.mjs`:34 "R6 … the address form alone still works, named deprecated", failing at :36.
  The START's expected `t35-door.test.mjs` address arms stay **green**: they drive control-plane's own `reviewcopy`/`templateread` doors, not this door.
- **Layer tests:** none (manifest).

## Checks

- `format`: 135 modules, 134 requirements files; 0 failures.
- `architecture publication`: 26 product files, 103 relative imports; 0 failures.
- `coverage publication`: 51 of 51 live requirement ids named by a test; 0 failures.
- `ownership publication tranche/T36`: 6 files changed by publication; 0 failures.

## Found in other modules (REPORT to BOB)

- **control-plane** (R59; for T36-37): its generic forward strips `BODY_STAMPS` (`control-plane/index.mjs`:439) but not `secretSha`. No path forwards a caller's body to the store's `casedocument` today (the op is public and this door builds its own request), but since this module now reads `secretSha` from the store request's body, stripping `secretSha` (and `bySecret`) from every forwarded caller body would keep a caller from ever supplying the digest. Defence in depth, not a live hole.
- **plane** (T36-49): `body.test.mjs`:25 and :34 re-pin to the body (`secretSha` in the store request's body, no address form, no `deprecated`); its header comment says the address form still works.
- **control-plane** (T36-37): `converts.test.mjs`:108 re-pins (:130 reads the body; :143–146 the address form admits nothing).
- No generated artifact is stale by this change beyond the plane bundle, which carries `publication/` and is regenerated at the layer close.

## P6

3,717 lines before; **3,731 after** (+14: the delegate and the deprecation went, R75 and its comments came). Under about 4,000.

Size (session_01CPZYbhuFESBkajW7tmoEjb): test runs 11, module lines 3731

## J1 · REPORT

Found in other modules (details in my record, 'Found in other modules'): (1) control-plane (T36-37, R59): its generic forward strips BODY_STAMPS (index.mjs:439) but not secretSha or bySecret; publication's store op now reads secretSha from the store request's body (R73), so stripping both from every forwarded caller body keeps a caller from ever supplying the digest. Defence in depth: no path forwards a caller body to the store's casedocument today. (2) plane (T36-49): body.test.mjs:25 and :34 expect the digest in the store address and the address form named deprecated; they re-pin to the body. (3) control-plane (T36-37): converts.test.mjs:108 re-pins (:130 reads the store address; :143-146 the address form). (4) Your START expected the t35-door.test.mjs address arms red: they stay green (they drive control-plane's own reviewcopy/templateread doors, not this door). The plane bundle carries publication/ and is regenerated at the layer close.

## J2 · COMPLETE

T36-26 done (commit 9997868ad6 on job/T36/publication). R73: secret from the body only; an address secret is not read, hashed or passed on and admits nothing; the digest reaches the store in the store request's POST body, never its address (door.mjs:91 fixed); the store op reads secretSha from the body alone; no deprecated, no CREDENTIAL_IN_ADDRESS export. R61: caseRelation delegate gone. R75: criteriaFor({members, signer, at}) -> {rows}, the commit's own composition. Tests: publication 122, pass 121, fail 0, todo 1 (R30). Checks: format, architecture, coverage (51/51), ownership (6 files) all 0 failures. Users' tests: 1,820, 1,807 pass, 13 fail; 10 were red before on the same tree (inherited). New reds from this merge, for you to accept by name: control-plane converts.test.mjs:108 (fails at :130; its :145 arm too); plane body.test.mjs:25 (fails at :28) and body.test.mjs:34 (fails at :36). t35-door.test.mjs stays green. P6: 3,717 -> 3,731 lines. Nothing deferred.
