# T22 inventory: all remaining work (K1009)

**Status** · Working file by a worker for BOB #89, 2026-10-01, on `prep/T22` @ d9a73f24f3, with `origin/main` @ 994fd3f9ff read for the UX stream's DEC-96–DEC-111 (K945; `prep/T22` does not yet contain them). One row per item, with its source. Disposition: **C** carried in T22 (where), **L** left out (one hard reason, P19). The plan is `next.md`; every row here appears there.

Method: `grep '(not yet met'` over `build/requirements/*.md`; `test.todo`/`{todo:}`/`{skip:}` over `bio-plane/test/m/**` (and `newgroup/test/`, which holds installer's todos); `next.md` whole; the "LEFT OUT" and "Table rows" of `archive/T21.md`, with T20's "Deferred beyond T20" and T17/T14's "Not in" lists checked against `next-applied.md` (every older item is either applied there or restated in T21's tables); rulings K929–K1013; `modules.json` (`legacy: true`); `row-census.test.mjs` `AWAITING_STAMP`; `build/jobs/T21/*.md` for Found/Deferred/"seen, not changed"; `docs/development/DECISIONS.md` on `origin/main`, each DEC's `owed:` line. For each marked requirement, the module's tests were searched for a non-todo test naming the id (counts below): a mark whose requirement has such a test is **stale** (built and tested, never struck) and goes to the opening's mark audit.

## A. Requirement marks and todo tests (58)

| id | item | module | source | disposition |
|---|---|---|---|---|
| A1 | R7 render locale (N77) | acquisition | `acquisition.md`:26; tested `acquire.test.mjs`:176; profiles now name `locale` (`oakland-alameda.mjs`:182) | C: mark audit (stale) |
| A2 | R29 C-68.1's door half (K887) | acquisition | `acquisition.md`:81; control-plane calls `evidenceStorageAbsent` (`control-plane/index.mjs`:469, K920) | C: mark audit (stale) |
| A3 | R7 `completed` (D3, K590) | actions | `actions.md`:24; `RESOLUTIONS` holds it (`action-grammar/checks.mjs`:51); 3 tests | C: mark audit |
| A4 | R8 premise override (K600 (a)) | actions | `actions.md`:25; `premise_override` in `actions/index.mjs`; 7 tests | C: mark audit |
| A5 | R9 addressee arms, `entity_id` person (D1, K590) | actions | `actions.md`:26; `ADDRESSEE_KINDS` (`action-grammar/checks.mjs`:126); actions now uses `entities`; 4 tests | C: mark audit |
| A6 | R24 interaction listed | bias | `bias.md`:53; `adopt-manifest.test.mjs`:256 | C: mark audit |
| A7 | R25 unregistered subject | bias | `bias.md`:54; `adopt-manifest.test.mjs`:277 | C: mark audit |
| A8 | R26 override whatever it calls itself | bias | `bias.md`:55; todo `adopt-manifest.test.mjs`:310 | L: dependency not yet built |
| A9 | R40 lens debt on question findings | bias | `bias.md`:65; `debt.test.mjs`:234 | C: mark audit |
| A10 | R37 Memento (K48) | capture-sources | `capture-sources.md`:95; todo `cdx.test.mjs`:162 | C: capture-sources L3 |
| A11 | R24's K5 arm | contradiction | `contradiction.md`:56; todo `present.test.mjs`:111 | L: measurement |
| A12 | R27's K5 arm | contradiction | `contradiction.md`:88; todo `present.test.mjs`:336 | L: measurement |
| A13 | R32's K5 arm | contradiction | `contradiction.md`:140; todo `acts.test.mjs`:164 | L: measurement |
| A14 | R33 (R36) K5 arm | contradiction | `contradiction.md`:146; todo `acts.test.mjs`:177 | L: measurement |
| A15 | R34 `no_difference` (N345) | contradiction | `contradiction.md`:147; todo `acts.test.mjs`:178 | L: measurement |
| A16 | R41 recommender digest (N345) | contradiction | `contradiction.md`:210; todo `measures.test.mjs`:59 | L: measurement |
| A17 | R57's K5 live run | contradiction | `contradiction.md`:182; todo `k5.test.mjs`:92 | L: measurement |
| A18 | Uses note "R24 not yet met there" (K171) | escalation | `escalation.md`:63; jurisdictions R24 carries no mark | C: fold at the opening |
| A19 | Uses note "R25, R32, R33 not yet met there" | filings | `filings.md`:67; no mark on those ids | C: fold at the opening |
| A20 | Uses note "R23, R31 not yet met there" | standards | `standards.md`:47; no mark on those ids | C: fold at the opening |
| A21 | R31 opinion leg refused (MK-5) | inquiry | `inquiry.md`:134; todo `grammar.test.mjs`:187 ("no module defines an opinion element", K181) | L: dependency not yet built |
| A22 | R13 members bound to `CAPTURES` | installer | `installer.md`:42; todo `newgroup/test/requirements.test.mjs`:361 | L: dependency not yet built |
| A23 | R24 isolated installs | installer | `installer.md`:57; todo :702 | L: dependency not yet built |
| A24 | R32 one copy per account, refused | installer | `installer.md`:58; todo :853 | C: installer L11 |
| A25 | R33 read-back hash compare | installer | `installer.md`:59; todo :854 | C: installer L11 |
| A26 | Status line lists R20, R21, R30 as not met (no marks) | installer | `installer.md`:13 | C: fold at the opening |
| A27 | R17 an address's own frequency | monitoring | `monitoring.md`:38; todo `cadence.test.mjs`:123 (REC-191: no act exists) | L: Bob's |
| A28 | R18 volatility lengthens a default | monitoring | `monitoring.md`:39; todo `cadence.test.mjs`:124 | C: monitoring L10 |
| A29 | R25 tick outcome recorded | monitoring | `monitoring.md`:49; `ticks.test.mjs`:427 | C: mark audit |
| A30 | R28 gathering requests executed | monitoring | `monitoring.md`:62; todo `understanding.test.mjs`:11 | C: monitoring L10 |
| A31 | R29 sweeps | monitoring | `monitoring.md`:63; todo :12 ("wait for a design of what a sweep's query is") | L: Bob's |
| A32 | R31 items published | monitoring | `monitoring.md`:67; todo :13; produced by queue-producers today (`queue-producers/index.mjs`:1653–1763, from monitoring R47/R48) | C: fold before L10, monitoring L10 |
| A33 | R32 unscheduled visible | monitoring | `monitoring.md`:68; 3 tests | C: mark audit |
| A34 | R33 sources proposed for monitoring | monitoring | `monitoring.md`:75; 2 tests | C: mark audit |
| A35 | R34 members told of overdue | monitoring | `monitoring.md`:76; todo `understanding.test.mjs`:126; queue-producers R15 tells them | C: fold before L10, monitoring L10 |
| A36 | R21 frontier vocabulary (retrieval's half is retrieval R49, unmarked) | observation-log | `observation-log.md`:49; `lead.test.mjs`:148, :190 | C: mark audit |
| A37 | R32 junction check | progressions | `progressions.md`:98; todo `feeds.test.mjs`:202 | L: dependency not yet built |
| A38 | Suggestions "Batch30", "Tests" name `(not yet met)` rows; none left | promotion | `promotion.md`:151, :154 | C: fold at the opening |
| A39 | R49 attestations read | provenance | `provenance.md`:123; 1 test | C: mark audit |
| A40 | Suggestion "Tests: each (not yet met) id" | provenance | `provenance.md`:181 | C: fold at the opening |
| A41 | R30 rendering verified by `pixels_sha256` (D-246) | publication | `publication.md`:116; todo `invariants.test.mjs`:115 | L: dependency not yet built |
| A42 | R32 verifying import (K102) | publication | `publication.md`:118; todo `invariants.test.mjs`:117 | L: size before its split (P6) |
| A43 | R18 set aside on an out-of-inquiry lead | queue | `queue.md`:39; 2 tests | C: mark audit |
| A44 | R19 refusals, `taskExists` (N374) | queue | `queue.md`:42; `queue/index.mjs`:1498; 11 tests | C: mark audit |
| A45 | R38 `evidenceStore()` | record-core | `record-core.md`:148; `record-core.test.mjs`:366 | C: mark audit |
| A46 | R14 version notices (REC-222) | reevaluation | `reevaluation.md`:41; 7 tests | C: mark audit |
| A47 | R15 `adoptVersion`/`keepVersion` (REC-223) | reevaluation | `reevaluation.md`:42; 6 tests | C: mark audit |
| A48 | R25 notice sweep pass (N178) | reevaluation | `reevaluation.md`:48; 8 tests | C: mark audit |
| A49 | R17 `weakened` | reevaluation | `reevaluation.md`:52; `#weakened` (`reevaluation/index.mjs`:452); 1 test | C: mark audit |
| A50 | R14 proposals for a capture (K31) | run-productions | `run-productions.md`:35; `module.test.mjs`:25, :42 | C: mark audit |
| A51 | R3 a throwing consumer | scheduler | `scheduler.md`:20; `alarm.test.mjs`:100, :121 | C: mark audit |
| A52 | R11 reconcile at start | scheduler | `scheduler.md`:40; `producers.test.mjs`:147, :161 | C: mark audit |
| A53 | R12 expired request wakes its run (D-583) | scheduler | `scheduler.md`:43; `plane.test.mjs`:144 | C: mark audit |
| A54 | R10 recipes published (SK-5, N144) | skills | `skills.md`:33 | L: Bob's |
| A55 | R28 `action_planning` layer | skills | `skills.md`:71; `skilldoctrine.mjs`:866; 4 tests | C: mark audit |
| A56 | R29 plan mode, stated absence | skills | `skills.md`:72; 2 tests | C: mark audit |
| A57 | R5 hunch inert (K102), with DEC-104's count | strength | `strength.md`:22; built (`strength/index.mjs`:227) | C: strength L6 |
| A58 | R15 `strengthBarSet` administrators only | strength | `strength.md`:46; `strength/checks.mjs`:236; 2 tests | C: mark audit |

Not rows (not remaining work): the conditional skips in `signatures/signatures.test.mjs`:168, :439, :520, :734, `signatures/release-signer.test.mjs`:183, :198 and `public-read/convert-casesign.test.mjs`:165 run wherever `ssh-keygen` or `openssl` is installed; `ai-runs` "todo" hits are state values, not tests. The scheduler R10 todo (`rank.test.mjs`:80) is row B22.

## B. `next.md` entries (22)

| id | entry | module | disposition |
|---|---|---|---|
| B1 | DIST-14 | office-readers | L: deployment |
| B2 | N75 | image-codecs | L: deployment |
| B3 | N34 | pdf-worker | L: deployment |
| B4 | N144 | affordances, legacy-ui | L: Bob's |
| B5 | N232 | affordances, legacy-ui, skills | L: Bob's |
| B6 | N68 (legacy-ui share) | legacy-ui | L: Bob's (UX) |
| B7 | N70 (legacy-ui share) | legacy-ui | L: Bob's (UX) |
| B8 | N241 | legacy-ui | L: Bob's (UX) |
| B9 | N371 | legacy-ui | L: Bob's (UX) |
| B10 | N437 (legacy-ui share) | legacy-ui | L: Bob's (UX) |
| B11 | N461 (release share) | at the release | L: deployment |
| B12 | N467 (legacy-ui share, with N469's UI notes) | legacy-ui | L: Bob's (UX) |
| B13 | N470 | publication, reevaluation | L: Bob's |
| B14 | N471 | text-chain, promotion, provenance, content, connections, observation-log, run-rules | C: L1–L6 |
| B15 | N472 | case-authoring | C: L8 |
| B16 | N473 | filings | L: deployment |
| B17 | N474 | action-clocks, filings | C: L9 |
| B18 | N475 | legacy-ui | L: Bob's (UX) |
| B19 | N476 | filing-templates, queue-producers | C: L9, L11 (its order reason ended with T21) |
| B20 | N477 | legacy-ui | L: Bob's (UX) |
| B21 | N478 | opening re-cut, membership, promotion, extraction | C: opening, L2, L4 |
| B22 | N479 (scheduler R10's todo, `rank.test.mjs`:80) | scheduler | C: L10 |

## C. T21's carried-over table rows (9) (`archive/T21.md`:119, :231)

| id | item | disposition |
|---|---|---|
| C1 | office-readers R28/R29 retired once each migration has run | L: deployment |
| C2 | `MODES.plan` deployed | L: deployment |
| C3 | the newgroup installer deployed, with N336 | L: deployment |
| C4 | contradiction R41 and the K5 arms (= A11–A17) | L: measurement |
| C5 | `PLN-` affordances, the plan-page surface, joint action (K608 (4), K600 (c)) | L: Bob's |
| C6 | N389 | L: Bob's (UX) |
| C7 | N-A13 | L: Bob's (UX) |
| C8 | the first profile's facts without a source (K925, K934, K941) | L: measurement |
| C9 | N471's release-embedded copies (`newgroup/src/release.mjs`, `release/bio-plane.bundled.mjs`) | L: deployment |

## D. Owed acts in rulings K929–K1013 not already a row (11)

| id | act | source | disposition |
|---|---|---|---|
| D1 | apply `draft-legacy-tests-recut.md`'s `modules.json` re-cut and `layers.md` L11 row, legacy table row retired | K1006 | C: fold at the opening |
| D2 | the UI's unread fixtures `civicos-ui/test/fixtures/fw18-doctypes.json`, `fw20-staff-directory.json` | K1006 | L: Bob's (UX) |
| D3 | `gate.mjs`:191–:431, :603 name legacy-tests' re-pin and census suite as live | recut §2 item 3 | C: promotion L2 |
| D4 | `.github/workflows/regression.yml`'s comment naming legacy-tests (`not_product`) | recut §2 | C: fold at the opening |
| D5 | bundler's duplicate `bio-plane/test/jsonc.mjs` (bundler owns `scripts/jsonc.mjs`) | recut §1 | C: bundler L1 |
| D6 | action-clocks R12 `factReader` and filings' Uses/R30, worded by BOB before L9 | K998 | C: fold before L9 |
| D7 | the plan checked by a second, independent pass | K1009 (3) | C: before the opening |
| D8 | the confirmation reported to Bob, rendered, then T22 opened | K1009 (4) | C: at the opening |
| D9 | `main` @ 994fd3f9ff (DEC-96–DEC-111, `build/channels.md`) merged into `prep/T22` before the opening | K945, K954 | C: before the opening |
| D10 | the channel's first live exchange (D12 "live exchange PENDING", K957, K975) | K954 | C: at the opening |
| D11 | the format check's 11 legacy-tests path failures on `main` | K1007 (b), K1013 | C: cleared by D1 |

## E. The stamp and the census (6)

All `awaiting stamp` since 1.51.0 (K947), declared in `row-census.test.mjs` `AWAITING_STAMP` (:62–) by LEGACY-TESTS #19 (K1005).

| id | rows | source | disposition |
|---|---|---|---|
| E1 | provenance C-53.13 re-worded | K952; `jobs/T21/provenance.md`:36 | C: promotion L2 |
| E2 | intent's registration ids `["C-2.9"]` (composition, no row) | K979; `jobs/T21/intent.md`:31 | C: promotion L2 |
| E3 | local-facts C-126.1–.5 new | K989; `jobs/T21/local-facts.md`:31 | C: promotion L2 |
| E4 | filing-templates C-115.31–.33, .35–.38 moved; C-125.1–.32 new | K991; `jobs/T21/filing-templates.md`:24 | C: promotion L2 |
| E5 | filings C-115.41–.43 new; .12, .34, .39, .40 re-worded; .19 re-sited; .6, .17 retired | K992; `jobs/T21/filings.md`:41 | C: promotion L2 |
| E6 | the census suite re-pinned to the new version, now promotion's | K1006 | C: promotion L2 |

## F. Generated artifacts (2)

| id | item | disposition |
|---|---|---|
| F1 | `bio-plane/dist/bio-plane.bundled.mjs` carries `MODULE_ORDER` (recut §2 item 2): regenerated at L2's close; every layer close regenerates what its jobs staled (§5.6) | C: L2 close, each close |
| F2 | `newgroup/dist/newgroup.bundled.mjs` staled by installer's job | C: L11 close |

## G. Job-record findings not routed (1)

| id | item | disposition |
|---|---|---|
| G1 | MEMBERSHIP #15 "seen, not changed" (`jobs/T21/membership.md`:16): notes name the plane's deleted `index.mjs` (K1010) as the home of the stamp tables; the same kind found by this inventory: `membership/index.mjs`:582, :2107, :2146, :2615; `textchain.mjs`:100, :1785; `provenance/schema.mjs`:142; `inquiry/index.mjs`:2076; `ai-runs/index.mjs`:511, :1527; `public-read/index.mjs`:661. Proposed **N480** | C: membership L2, text-chain L1, provenance L3, inquiry L6, ai-runs L6, public-read L8 |

Examined, not work: capture-requests' "observed, not changed" (`jobs/T21/capture-requests.md`:14, no requirement forbids it); calibration's wide lines; every other "Found in other modules" item was routed (N470–N479, K1001, K1004).

## H. The UX stream's DECs now on `main` (21) (`DECISIONS.md` on `origin/main`:1544–1810)

| id | DEC, share | its `owed:` line | disposition |
|---|---|---|---|
| H1 | DEC-96 acceptance, flags | "as requirements for Bob's approval" | L: Bob's |
| H2 | DEC-97 held captures, bulk acts | "for Bob's approval" | L: Bob's |
| H3 | DEC-98 empty, loading, failed screens | the redesign's screens | L: Bob's (UX) |
| H4 | DEC-99 WCAG 2.2 AA, words in one place | "for Bob's approval" | L: Bob's |
| H5 | DEC-100 docket standing | "nothing to build yet … awaits Bob's ruling" | L: Bob's |
| H6 | DEC-101 "What changed" statement, watching editions | "for Bob's approval" | L: Bob's |
| H7 | DEC-102: "for now" lifted from ratification R2/R18, publication R17 | wording | C: fold at the opening |
| H8 | DEC-102: identity levels and testimony weight | "BOB drafts for Bob's approval" | L: Bob's |
| H9 | DEC-103 the lens printed into the signed case | "BOB drafts for Bob's approval" | L: Bob's |
| H10 | DEC-104: "for now" lifted from strength R5; strength counts the hunches it left out | "BOB places them" | C: fold before L6, strength L6 |
| H11 | DEC-104: "Hunches to clear" list on question and project pages | the pages | L: Bob's (UX) |
| H12 | DEC-105: the bar's honest note | "strength, project settings; BOB places it" | C: fold before L6, strength L6 |
| H13 | DEC-105: audience guidance, later, on a trigger | research on a trigger | L: measurement |
| H14 | DEC-106 two spaces, path marker | "nothing new to build beyond the redesign's screens" | L: Bob's (UX) |
| H15 | DEC-107 "Obligation" → "To do" in member-facing text | "queue, queue-producers …; BOB places it" (`queue/index.mjs`:56) | C: fold before L11, queue and queue-producers L11 |
| H16 | DEC-108 doorbell limits, inbox, archive | "BOB drafts for Bob's approval" | L: Bob's |
| H17 | DEC-109 claim page and wizard's last screen wording | "instance-setup …; BOB confirms" (`setup.mjs`:204–214; wizard `newgroup/src/ui.mjs`) | C: fold before L11, instance-setup and installer L11 |
| H18 | DEC-109 administrator settings card | the redesign | L: Bob's (UX) |
| H19 | DEC-110 "Condition" → "Signal"; the queue read sorts by time added, time due, case, kind | "queue; BOB places it" | C: fold before L11, queue and queue-producers L11 |
| H20 | DEC-110 the redesign's three item styles, folding | the redesign | L: Bob's (UX) |
| H21 | DEC-111 'working on' notices | a new outward act, for Bob's approval | L: Bob's |

## I. Legacy census (2) (`modules.json`: the only `"legacy": true` modules; no module names a `from`)

| id | module | disposition |
|---|---|---|
| I1 | legacy-tests (index 85; 11 deleted `paths`) | C: retired at the opening (D1, N478) |
| I2 | legacy-ui (index 83, 27,233 lines) | L: Bob's (UX) |

## Count

A 58 (C 41, L 17) · B 22 (C 6, L 16) · C 9 (L 9) · D 11 (C 10, L 1) · E 6 (C 6) · F 2 (C 2) · G 1 (C 1) · H 21 (C 6, L 15) · I 2 (C 1, L 1).

**Inventory 132 rows: carried 73, left out 59.**
