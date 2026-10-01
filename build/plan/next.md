# Plan: tranche T22

**Status** · DRAFT T22 plan, written from the work that remains (K1009) by a worker for BOB #89, 2026-10-01, from main @ 994fd3f9ff (`origin/main`, with the UX stream's DEC-96–DEC-111 and `build/channels.md`; written on `prep/T22` @ d9a73f24f3, which does not yet contain them, D9). It replaces `draft-T22.md` (input only, K1009) and the old `next.md` (its 22 entries are inventory rows B1–B22). The inventory, one row per item with its source, is `plan/t22-inventory.md` (132 rows); every row is carried below or left out with one hard reason (P19). Row ids (A1…I2) are the inventory's.

**What changed versus `draft-T22.md`.** The draft carried 11 jobs from the queued entries. Written from what remains, T22 also carries: the legacy-tests retirement (K1006, N478) and its census; N476 (its order reason ended with T21's L9); scheduler R10's todo (N479); 33 stale or wrongly worded `not yet met` marks and notes, audited at the opening (A rows); four requirements with no test yet (capture-sources R37, monitoring R18 and R28, installer R32 and R33); monitoring R31/R34's todos; the shares of DEC-102, -104, -105, -107, -109 and -110 whose `owed:` line says BOB places them (now on `main`, so foldable, manifest "Parallel work"); and notes naming the deleted `src/index.mjs` as live (G1, proposed N480). 25 jobs.

## Legacy census (PROCESS-MECHANICS §5.2 (2), K1007 (a))

| legacy module (`modules.json`) | in T22 | entry or hard reason |
|---|---|---|
| **legacy-tests** (index 85; all 11 `paths` deleted, K1013) | **retired at the opening** | K1006, N478: BOB applies `plan/draft-legacy-tests-recut.md` §2 (its files re-owned, 0 unowned, new `uses` edges, the module removed, `layers.md` L11 row and legacy table row) before L1; membership drops it from `MODULE_ORDER` (L2); promotion takes the census (L2); extraction deletes its unread fixtures (L4); the plane bundle is rebuilt at L2's close. |
| **legacy-ui** (index 83, `civicos-ui/`) | stays | Bob's: UX (K633; `layers.md` ruling 4; manifest "Parallel work"). Its entries N68, N70, N241, N371, N437, N467, N475, N477, N389, N-A13 and the UI fixtures (D2) wait on the UX stream. |

No module names a `from`: no extraction is open.

## Folds before each layer (BOB, on the tranche branch, P18)

**Before the opening.**
1. Merge `main` @ 994fd3f9ff into `prep/T22` (K945; D9); the tranche branch is then created from `main` with `prep/T22` merged.
2. The second, independent pass over this plan (K1009 (3); D7), then the rendered report to Bob (D8).

**At the opening, before L1.**
1. **The legacy-tests re-cut** (K1006; D1, D11, I1): `draft-legacy-tests-recut.md` §2's `modules.json` edit as written (settled: `conclude-project.test.mjs` and `docdates.mjs` to queue; `members.test.mjs` to membership; `bundle.test.mjs` to bundler; `ocr-measure-probe.mjs` to ocr-worker with `+runtime-limits`); `layers.md` L11 row drops legacy-tests, its legacy-table row marked retired. Clears the format check's 11 path failures. `regression.yml`'s comment re-worded (D4; `not_product`, BOB's).
2. **The mark audit** (27 rows; A1–A7, A9, A29, A33, A34, A36, A39, A43–A53, A55, A56, A58): a worker reads each requirement whole against the tests named in the inventory and says whether they prove it whole (P7). BOB strikes each proved mark with one ruling citing its tests. A mark not proved whole joins its module's job in its own layer, as an entry with its gap (P19); the roster below then gains that module.
3. **Stale wording** (BOB's, no change of meaning): escalation Uses (A18), filings Uses (A19), standards Uses (A20): drop "not yet met there"; installer's Status line (A26); promotion Suggestions "Batch30", "Tests" (A38) and provenance's "Tests" (A40): no `(not yet met)` row remains, so re-word or strike; "for now" lifted from ratification R2/R18 and publication R17 (DEC-102, H7).
4. **N480 filed** (G1): notes naming the deleted plane `index.mjs` (K1010) as the live home of a table or function; re-word to the module that holds it now or put in the past tense (N469's rule). It joins the six modules below.

**Before L6.** strength R5: "for now" lifted, and a new clause: every strength answer states how many hunch legs it left out (DEC-104, H10). strength R15 (or its answer's text): the bar's honest note in DEC-105's words, "CivicOS has no guidance yet on what particular audiences expect. Readers see the bar you set in these words." (H12).

**Before L9.** action-clocks **R12**: provides `factReader(localFacts, viewer)`, a `factOf` in `computeDeadline`'s shape over local-facts `factStatus`, null without `factStatus` (K998; D6). filings' Uses names it; filings R30 says its deadlines read it. filing-templates R20: `reviewsRequested` answers each version's `project` (its `scope`) (N476).

**Before L10.** monitoring R31: the four items are published by `queue-producers` from this module's reads (R47, R48, R16), not by this module, as the code stands (`queue-producers/index.mjs`:1653–1763); monitoring R34's "members told" half is `queue-producers` R15's (A32, A35). Both are wording of what is built; the todos go with them.

**Before L11.**
- queue-producers R20: a `template-review-requested` item is homed under the template's project (N476).
- queue: `class_labels` read "To do", "Noticed", "Signal" (DEC-107, DEC-110; `queue/index.mjs`:56); a new requirement for the queue read's `sort`: time added, time due, case, kind, the present order the default (DEC-110; BOB words it, H19). queue-producers: member-facing sentences say "to do" for OBLIGATION and "signal" for CONDITION (H15, H19); internal codes unchanged.
- instance-setup: the claim page's block in DEC-109's words, before the password is chosen (`setup.mjs`:204–214); installer: the wizard's last screen the same (H17). BOB confirms whether the copy shows its last claim date (DEC-109's `owed:` line).

## Rules at the opening

T21's rules hold: merge early; one file, one editor; a job names each `not yet met` mark it meets and BOB strikes it at the merge; no layer closes red except a red accepted by name; owners export, the plane composes. The UX stream: its DECs are cited, never minted; its files never edited; a moved `main` is merged in at the close (K945).

**Accepted reds, by name, at the opening:**
1. membership's `MODULE_ORDER` tests, from the re-cut until membership's L2 merge (K1006): `test/m/membership/module-order.test.mjs` R83, and as K936 named the same red: R39/R45/R46, `t9-notice-sight-bounds.test.mjs`:185 R79, promotion `registry.test.mjs`:58. BOB lists the exact set on the tranche after the re-cut.
2. `fleetbundles.test.mjs` (the plane bundle carries `MODULE_ORDER`), from membership's merge to L2's close (F1).
3. Any T22 job in L3–L11 that changes a catalogue row turns `row-census.test.mjs` (promotion's after the re-cut) red: accepted by name until T23's L2 stamp (P8: promotion's one job is L2). Each START says so; none of the planned changes needs a row except possibly capture-sources (A10), monitoring (A28, A30), queue (H19) and strength (H10, H12).

**Merge order.** L2: membership early, promotion last (it stamps after membership's merge and re-pins the census). L9: action-clocks before filings (filings imports R12); filing-templates any time. L10: monitoring before scheduler (scheduler's R10 test may drive monitoring's `cadenceTick`). L11: queue-producers before queue; instance-setup before installer.

**Generated artifacts.** Each layer close regenerates what its jobs staled (§5.6): the plane bundle at L2 (F1) and after any layer whose plane modules change; `newgroup/dist/newgroup.bundled.mjs` at L11 after installer (F2). The census fixture: BOB adds promotion's new `row-census-<version>.jsonl` to its `tests` before its ownership check, and drops the 1.51.0 path if the job deletes it.

## Roster by layer (25 jobs: 2, 2, 2, 2, 2, 4, 0, 2, 3, 2, 4)

- **L1** text-chain (N471; N480) · bundler (D5)
- **L2** membership (N478; N480) · promotion (E1–E6, the stamp and census; N471; D3)
- **L3** provenance (N471; N480) · capture-sources (A10)
- **L4** content (N471) · extraction (N478)
- **L5** connections (N471) · observation-log (N471)
- **L6** run-rules (N471) · strength (A57, H10, H12) · inquiry (N480) · ai-runs (N480)
- **L7** none (unless the mark audit adds reevaluation)
- **L8** case-authoring (N472) · public-read (N480)
- **L9** action-clocks (N474, D6) · filings (N474) · filing-templates (N476)
- **L10** monitoring (A28, A30, A32, A35) · scheduler (N479)
- **L11** queue-producers (N476, H15, H19) · queue (H15, H19) · instance-setup (H17) · installer (A24, A25, H17)

The mark audit may add any of: acquisition (L3), record-core (L2), actions (L9), bias, observation-log (L5), run-productions, skills (L6), reevaluation (L7), queue, scheduler, monitoring (already in). Sizes: no job grows a module past the 4,000-line mark (K617): provenance 3,943 and extraction ~4,000 take comments or fixture deletions only; publication (4,408) has no job.

## STARTs, sketched (BOB writes the final ones)

N471 and N480 are comments only: re-word to past-tense provenance (the form of `inquiry-grammar/checks.mjs`:12) or to the module that now holds the named table; re-scan the module's paths for the same kind. Proof: the module's suite green.

**L1**
- **text-chain** · N471: `bio-plane/src/textchain.mjs`:425. N480: :100 ("the wire's, in index.mjs"), :1785.
- **bundler** · D5: `bio-plane/test/system/deploybindings.test.mjs` imports `bio-plane/test/jsonc.mjs`, a copy of bundler's own `scripts/jsonc.mjs`; re-point and delete the copy (recut §1). Proof: `deploybindings.test.mjs` green; `fleetbundles` green.

**L2**
- **membership** · N478: drop `"legacy-tests"` from `MODULE_ORDER` (`membership/index.mjs`:183; the list begins :167); R83 then equals `modules.json`. N480: :582, :2107, :2146, :2615 (`CUSTODIAL_ACTIONS`, `GOVERNANCE_ACTIONS` are op-declarations' now). Proof: accepted red 1 green. Merge early; stales the plane bundle.
- **promotion** · The stamp: `CATALOG_VERSION` (`gate.mjs`:514) 1.51.0 → 1.52.0 over E1–E5 (the census suite's `AWAITING_STAMP`, `row-census.test.mjs`:62–), with its note in the previous notes' form; `ROW_CENSUS` re-pinned (R50); `GATE_VERSION` kept (R34). The census (K1006, E6), now its own suite: re-pin to 1.52.0, add `bio-plane/test/fixtures/row-census-1.52.0.jsonl` reproduced on the stamp commit, retire every `after: "1.51.0"` declaration, drop the 1.51.0 fixture. D3: `gate.mjs`:191–:431 and :603 name legacy-tests' re-pin and census suite as live: re-word to promotion's own. N471: `promotion/checks.mjs`:241. Proof: R34, R50 and `row-census.test.mjs` green, its negative control as before. Merge last in L2.

**L3**
- **provenance** · N471: `provenance/checks.mjs`:235. N480: `provenance/schema.mjs`:142. No growth (3,943 lines).
- **capture-sources** · A10, R37: the archive lookup speaks Memento (RFC 7089: TimeMap and TimeGate) so any compliant archive serves it, Wayback's CDX one such source (`cdx.mjs`, 194 lines; todo `test/m/capture-sources/cdx.test.mjs`:162). K48's "unscheduled" names no hard reason (P19). Proof: R37 tests over recorded TimeMap fixtures with a negative control; R36's CDX tests unchanged.

**L4**
- **content** · N471: `content/checks.mjs`:19 (and :223 if its re-scan reads it as live).
- **extraction** · N478: delete `bio-plane/test/fixtures/fw20/` and `bio-plane/test/fixtures/d460/walk-tier3-manifest.json` (no reader; recut §1, §3). Test paths only. Proof: `test/m/extraction/` and the moved `d606-perpage-ocr.test.mjs` green. BOB drops the two paths from `modules.json` at the merge.

**L5**
- **connections** · N471: `connections/checks.mjs`:25, :179.
- **observation-log** · N471: `observation-log/checks.mjs`:212.

**L6**
- **run-rules** · N471: `run-rules/checks.mjs`:370.
- **strength** · A57, H10: R5 as folded: hunch legs stay inert (`strength/index.mjs`:227) and every strength answer states how many it left out. H12: the bar's note as folded (`strengthBarSet`'s answer, `strength/index.mjs`:856–891). Proof: R5, R15 tests, with a negative control (a pair with hunches whose count is wrong fails). Users' suites green.
- **inquiry** · N480: `inquiry/index.mjs`:2076 (`STATE_ACTIONS` is op-declarations', `op-declarations/index.mjs`:817).
- **ai-runs** · N480: `ai-runs/index.mjs`:511 (`NEEDS`), :1527 (`scopeFor`): control-plane's now.

**L8**
- **case-authoring** · N472 (K998): an R5 test that `MEMBER_ROLES` (`case-authoring/index.mjs`:92) deep-equals ratification's `CASE_MEMBER_ROLES` (`ratification/checks.mjs`:149); keep its own constant (`requirements/case-authoring.md`:161). Proof: that test and a negative control.
- **public-read** · N480: `public-read/index.mjs`:661 (`DO_PATH` in index.mjs).

**L9**
- **action-clocks** · N474, D6: export R12's `factReader(localFacts, viewer)` from the private `holidayFact` (`action-clocks/index.mjs`:613) and `factAnswer` (:633). Proof: R12 test (confirmed, unconfirmed, disputed entry; no `localFacts`), users escalation, action-plans, monitoring, queue-producers, filings green. Merge first.
- **filings** · N474: delete its copy `factReader` (`filings/dates.mjs`:25–:46) and import action-clocks R12. Proof: R30 tests unchanged and green.
- **filing-templates** · N476: `reviewsRequested` (`filing-templates/index.mjs`:1146) answers each version's `project`. Proof: R20 test with a scoped and a group-wide template.

**L10**
- **monitoring** · A28, R18: a document whose substance has not moved across repeated checks earns a longer interval, a contract default only, stated on the plan row; the lengthening rule's figures go to BOB by QUESTION if R18 does not fix them (P17). A30, R28: each open named request in a bundle's `data/gathering.json` whose cadence is due is captured through `capture.acquire`, its locators in order, the request named as authority (the gathering grammar is already registered, `monitoring/index.mjs`:1747). A32, A35: retire the todos `understanding.test.mjs`:13 and :126 against the folded R31, R34 (assert monitoring's reads R47/R48 answer what queue-producers publishes, or remove the todo with the clause). Proof: R18 and R28 tests with negative controls (`cadence.test.mjs`:124 and `understanding.test.mjs`:11 become tests). Merge first in L10.
- **scheduler** · N479: replace the todo `test/m/scheduler/rank.test.mjs`:80 with the composed test (`draft-legacy-tests-recut.md` §4): monitoring's real `cadenceTick` given the scheduler's rank over more due subjects than one batch takes the rank's head.

**L11**
- **queue-producers** · N476: home `template-review-requested` (`queue-producers/index.mjs`:2601) under its project. H15, H19: member-facing words as folded. Proof: R20 test; the words' tests re-keyed. Merge before queue.
- **queue** · H15, H19: `QUEUE_CLASS_LABELS` (`queue/index.mjs`:56) as folded; the read's `sort` as the new requirement. Proof: its tests, with the default order unchanged.
- **instance-setup** · H17: the claim page's block (`setup.mjs`:204–214) in DEC-109's words, before the password. Proof: the page test pins the sentences.
- **installer** · A24, R32: refuse an install into an account that already holds a copy (either evidence bucket or a fleet worker present) before anything is created (`ensureBuckets` `newgroup/src/index.mjs`:250, `scriptExists` :214, `installFleet` :581). A25, R33: install and update read the uploaded script back and compare its hash with the release, naming a mismatch, claiming no success (`uploadInstall` :404, `uploadUpdate` :459). H17: the wizard's last screen in DEC-109's words (`newgroup/src/ui.mjs`). Proof: the todos `newgroup/test/requirements.test.mjs`:853, :854 become tests against a faked management API, each with a negative control. Stales `newgroup/dist/newgroup.bundled.mjs` (F2). Nothing is deployed: a release is Bob's act.

## Left out (59 rows, one hard reason each)

| row | item | hard reason | note |
|---|---|---|---|
| B1 | DIST-14 (office-readers) | deployment | the CSV bound measured on a deployed plane |
| B2 | N75 (image-codecs) | deployment | the 61.3 MB bound measured on a deployed plane |
| B3 | N34 (pdf-worker) | deployment | the JPX bound measured; PPM/PPT JBIG2 also waits on a fixture encoder; pdf-worker is 4,277 lines (P6) |
| B4, B5 | N144, N232 (affordances, legacy-ui, skills) | Bob's | K899 (2): wait for the new interface |
| A54 | skills R10 (recipes published) | Bob's | N144 |
| B13 | N470 (publication, reevaluation) | Bob's | K943 |
| B6–B10, B12, B18, B20 | N68, N70, N241, N371, N437, N467, N475, N477 (legacy-ui shares) | Bob's (UX) | K633 |
| C6, C7 | N389, N-A13 | Bob's (UX) | K633 |
| D2 | `civicos-ui/test/fixtures/fw18-doctypes.json`, `fw20-staff-directory.json` | Bob's (UX) | K1006 |
| I2 | legacy-ui (the module) | Bob's (UX) | ruling 4, K633 |
| B11 | N461 release share | deployment | the next signed release build, Bob's act |
| C9 | N471's release-embedded copies | deployment | with N461 |
| B16 | N473 (filings' `filing_templates` table) | deployment | dropped once the migration has run at every instance |
| C1 | office-readers R28/R29 retired | deployment | each migration runs at every instance |
| C2 | `MODES.plan` deployed | deployment | K660 (5) |
| C3 | the newgroup installer deployed, with N336 | deployment | a signed release, Bob's act |
| C4, A11–A17 | contradiction R24, R27, R32, R33/R36 K5 arms, R34, R41, R57's K5 run | measurement | a measured recommender run (K488); no model is reachable from a job |
| C8 | the first profile's facts without a source | measurement | K925, K934, K941 |
| H13 | DEC-105: audience guidance | measurement | research on its trigger |
| C5 | `PLN-` affordances, plan-page surface, joint action | Bob's | K608 (4), K600 (c) |
| A27 | monitoring R17 (an address's own frequency) | Bob's | no act holds it (REC-191's design gap): a new act is a requirement (P5) |
| A31 | monitoring R29 (sweeps) | Bob's | its own text: sweeps wait for a design of a sweep's query |
| H1, H2, H4, H6, H8, H9, H16, H21 | DEC-96, -97, -99, -101, -102 (identity and testimony), -103, -108, -111 | Bob's | each `owed:` line: requirements "for Bob's approval"; BOB drafts them during T22 (P18) |
| H5 | DEC-100 | Bob's | "awaits Bob's ruling" |
| H3, H11, H14, H18, H20 | DEC-98, DEC-104's list pages, DEC-106, DEC-109's settings card, DEC-110's item styles | Bob's (UX) | the redesign's screens |
| A8 | bias R26 | dependency not yet built | K102's trigger: evaluation findings under a lens (none in strength or review) |
| A21 | inquiry R31 | dependency not yet built | no module defines an opinion element (MK-5, K181) |
| A22, A23 | installer R13, R24 | dependency not yet built | multi-instance isolation, sequenced after the member surfaces (System Design §3 row 15, :253; Distribution §7) |
| A37 | progressions R32 | dependency not yet built | the record holds no amounts or funds as values (K102's trigger) |
| A41 | publication R30 | dependency not yet built | nothing publishes a rendering (D-246) |
| A42 | publication R32 | size before its split (P6) | publication is 4,408 lines; K617 splits it before its next job; BOB draws the seam map during T22 (P18) |

**At the opening, the new `next.md`** holds each left-out `next.md` entry's full text (from `git show d9a73f24f3:build/plan/next.md`) with the reason above, and the folded DECs' Bob's shares as entries (§9).

## For BOB

1. **The mark audit** (fold 2) is the plan's one open size: 27 marks look stale (built, tested, never struck). Recommended: strike at the opening on the worker's evidence, each named in one ruling; send only an unproved one to its module's job. The alternative (a job per module to confirm) adds up to eleven jobs that would only read.
2. **The DEC shares BOB places** (H7, H10, H12, H15, H17, H19): on `main` now, so foldable (manifest). Recommended: carry them, as above, and tell Bob in the opening's report that they are BOB's placement of his DECs, not new decisions.
3. **N480** (G1): file it at the opening (membership's record saw it; this inventory found ten more sites). Recommended: carry, as above.
4. **Rows changed in L3–L11** turn the census red until T23 (rule 3). Recommended: accept by name; START each job to change a row only when its requirement needs it.
5. **The channel's live exchange** (D10, K957's D12 "PENDING"): confirm at the opening whether the first NOTICE/DEFER to UX-DESIGN was posted after `build/channels.md` landed on `main`; if not, post it then.
6. **publication's split** (A42): draw its seam map during T22 so T23 carries the split with R32.

**Inventory 132 rows: carried 73, left out 59**
