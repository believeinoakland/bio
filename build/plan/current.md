# Plan: tranche T22

**Status** · OPEN · BOB #91 · session_017UWC3Uu7jSNsvdcZu7CgmB · depth 1

**Jobs** · text-chain: TEXT-CHAIN #6 session_017vtxc1g46pax3uvWUKZx2s; bundler: BUNDLER #5 session_014EDtgA8oD3Eyhq1jai3Z7j; membership: MEMBERSHIP #16 session_01LdQT1TKUB5SDgdFi5gE5ik; promotion: PROMOTION #23 session_01HWFND67AwBJQuXM4beadEA; provenance: PROVENANCE #11 session_01HXBQRNxoQMo9TDAz7Fou7D; capture-sources: CAPTURE-SOURCES #9 session_01JxNV4GvVR6ZVqJhsquLGcC; capture: CAPTURE #14 session_01WP7uNR1V8GPqjyrKhjKhiS; sources: SOURCES #7 session_017YEhAN64o2U9JwvDJtoKmG; content: CONTENT #9 session_01GDJYyoNJjSDAFBJbwSiC7V; extraction: EXTRACTION #12 session_01MCwzkLcBBrXZmSHZiL39Zj; entities: ENTITIES #7 session_01Pubw4dXFVoBiqgMP4yH6nq; connections: CONNECTIONS #10 session_01HCjKfcHcWfbAqzWJB7ada4; observation-log: OBSERVATION-LOG #8 session_01V6n4Sam5rH4aTsVsmXRRHM; progressions: PROGRESSIONS #8 session_019cGtav9K1yD7gcZz8bmw36; bias: BIAS #8 session_0134WygRosVZ3EZMS1Jdi1xK; run-rules: RUN-RULES #4 session_01KLQFu3Y8HVYcxxLYqhE1jL; strength: STRENGTH #8 session_01N3ZMZGDNGoYFfvWbCxSRaf; inquiry: INQUIRY #11 session_014pJTLU4oyGLEE68RoT4y8A; ai-runs: AI-RUNS #9 session_01Gz6XqWbqdRpBRjXrgD74xU

**The second pass (check), 2026-10-01** (K1009 (3); `plan/t22-check.md`, every finding with its evidence). It read the DECs on `main` and the design session's U1–U20, which the first pass had not: DEC-88 and DEC-89 (U6, K1014) and the owed work of DEC-81, -82, -86, -87, -90, -92 and -95 were missing (rows J1–J11); four DEC rows the first pass left out as "Bob's" are BOB's folds of rulings Bob has made and are carried, conditional on Bob approving the drafted fold before their layer, as each DEC's own owed line asks (H2, H6, H9, H16, with J3, J5); publication's split (K617, BOB's) is carried in L8 with R32 (A42, J10); the mark audit was run: 25 of the 27 marks are proved and struck at the opening, two join jobs (A9 inquiry L6, A29 monitoring L10). 35 jobs. Every change below is marked (check).

**What changed versus `draft-T22.md`.** The draft carried 11 jobs from the queued entries. Written from what remains, T22 also carries: the legacy-tests retirement (K1006, N478) and its census; N476 (its order reason ended with T21's L9); scheduler R10's todo (N479); 33 stale or wrongly worded `not yet met` marks and notes, audited at the opening (A rows); four requirements with no test yet (capture-sources R37, monitoring R18 and R28, installer R32 and R33); monitoring R31/R34's todos; the shares of DEC-102, -104, -105, -107, -109 and -110 whose `owed:` line says BOB places them (now on `main`, so foldable, manifest "Parallel work"); and notes naming the deleted `src/index.mjs` as live (G1, proposed N480). 25 jobs.

**Bob's weekly meter** · 39% at the opening (Bob, 2026-10-01 ~23:50 UTC, to BOB #90; P14). T21's opening read 25%.

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
2. **The mark audit** (27 rows; A1–A7, A9, A29, A33, A34, A36, A39, A43–A53, A55, A56, A58): done by the check (`t22-check.md` §4, each mark with the tests that prove it, every suite run green). BOB strikes the 25 proved marks with one ruling citing those tests. Two are not proved whole and join jobs: bias R40 (A9: no module registers a question's findings; inquiry L6) and monitoring R25 (A29: the test asserts the failure count, not the class recorded; monitoring L10). (check)
3. **Stale wording** (BOB's, no change of meaning): escalation Uses (A18), filings Uses (A19), standards Uses (A20): drop "not yet met there"; installer's Status line (A26); promotion Suggestions "Batch30", "Tests" (A38) and provenance's "Tests" (A40): no `(not yet met)` row remains, so re-word or strike; "for now" lifted from ratification R2/R18 and publication R17 (DEC-102, H7).
4. **N480 filed** (G1): notes naming the deleted plane `index.mjs` (K1010) as the live home of a table or function; re-word to the module that holds it now or put in the past tense (N469's rule). It joins the six modules below.
5. **DEC-88's reason audit** (J2; DEC-88 "owed (BOB's)"): read each of the 29 acts Bob banded `reasoned` (and `inboxresolve`) against its requirement; each that does not require an authored reason gains one (an act whose own words serve as its reason counts), folded before its layer, its module joining that layer. Known now: capture `inboxResolve` (L3), escalation `escalationOpen` (L9). (check)
6. **The DEC folds that need Bob's approval** (H2, H6, H9, H16, J3, J5): BOB drafts them now and brings them to Bob in one rendered page with the opening's report (D8), capture's (H16, J5) first, since L3 is the earliest. Each is carried if approved before its layer starts; one not approved by then goes to T23, named (check).
7. **Answer each DEC fold on the channel with its K** (J9, K1014). (check)

**Before L3 (check).** capture: `inboxResolve` requires a reason (J1 (4), J2; DEC-88). Conditional (Bob's approval): R31's limits 5 per source and 10 in all in any 10 minutes, the published sentence, the refusal saying a limit holds and that the group can see how often its doorbell turns people away; the count-only tally (daily total, times the whole-doorbell limit was reached, when last; no address, fingerprint or content) as a read, after BOB's privacy check of it; `inboxList` sortable by time, status, knocker secret or not, project (H16); the grade note attached to a capture completed unattended (J5).

**Before L6.** inquiry: a question's findings made under a project lens are registered with bias as kind `finding` (bias R40, its "registered by `inquiry`"; A9) (check). skills, conditional: the assistant may draft an edition's "What changed" statement as a labelled proposal, the act read from the catalogue (H6 (2)) (check). strength R5: "for now" lifted, and a new clause: every strength answer states how many hunch legs it left out (DEC-104, H10). strength R15 (or its answer's text): the bar's honest note in DEC-105's words, "CivicOS has no guidance yet on what particular audiences expect. Readers see the bar you set in these words." (H12).

**Before L8 (check).** At L7's close BOB merges `fold/corpus-export-T22` (K1043) before writing L8's STARTs; accepted reds 4 and corpus-export's coverage from then until its merge. publication's split (J10, K617): BOB's seam map and the new module's requirements, carved from publication's with no change of meaning, its `modules.json` entry placed before publication; R32 (A42) homed by the seam map in a module that ends under 4,000 lines. Conditional (Bob's approval): case-grammar and case-authoring, the signed case carries the lens statements with kind, subject, text, justification and public evidence, and the withheld count (H9), and a new edition carries its "What changed" statement (H6 (1)); ratification R2/R18, an edition after the first without the statement is refused before signing (H6 (1)); public-read, the case page's lens section, collapsed on screen and whole in print (H9); ratification R22, the batch's "contested" arm, a document in an unresolved contradiction (`uses` + contradiction), and the held-captures read and the bulk set-aside and link acts placed by BOB in modules under the mark (H2).

**Before L9.** escalation (check): `escalationOpen` requires a reason (DEC-88, J2, unconditional); conditional (Bob's approval): the reasoned DECLINE TO ESCALATE act on a live noncompliant determination, prose only, corrected forward, superseded by a later opening, and a read answering for each determination escalated, declined or neither (J3; placed in escalation, since conformance precedes it, P4). action-clocks **R12**: provides `factReader(localFacts, viewer)`, a `factOf` in `computeDeadline`'s shape over local-facts `factStatus`, null without `factStatus` (K998; D6). filings' Uses names it; filings R30 says its deadlines read it. filing-templates R20: `reviewsRequested` answers each version's `project` (its `scope`) (N476).

**Before L10.** monitoring R31: the four items are published by `queue-producers` from this module's reads (R47, R48, R16), not by this module, as the code stands (`queue-producers/index.mjs`:1653–1763); monitoring R34's "members told" half is `queue-producers` R15's (A32, A35). Both are wording of what is built; the todos go with them.

**Before L11.**
- queue-producers R20: a `template-review-requested` item is homed under the template's project (N476).
- queue: `class_labels` read "To do", "Noticed", "Signal" (DEC-107, DEC-110; `queue/index.mjs`:56); a new requirement for the queue read's `sort`: time added, time due, case, kind, the present order the default (DEC-110; BOB words it, H19). queue-producers: member-facing sentences say "to do" for OBLIGATION and "signal" for CONDITION (H15, H19); internal codes unchanged.
- affordances (check): DEC-88's three bands, the 57 into `RUNGS` and R27's count re-worded; the consequence statement for the six; `inboxresolve` `reasoned` (J1); conditional, the decline act's rung `reasoned`, with op-declarations and control-plane declaring and routing it (J3).
- queue-producers (check): a to-do in the member's own queue when a case draft uses their observation and they chose no credit level, read from `publication.caseDocumentFacts` (J8, DEC-102 item 3); conditional, the unattended capture's queue item carries its grade note (J5).
- instance-setup: the claim page's block in DEC-109's words, before the password is chosen (`setup.mjs`:204–214); installer: the wizard's last screen the same (H17). BOB confirms whether the copy shows its last claim date (DEC-109's `owed:` line).

## Rules at the opening

T21's rules hold: merge early; one file, one editor; a job names each `not yet met` mark it meets and BOB strikes it at the merge; no layer closes red except a red accepted by name; owners export, the plane composes. The UX stream: its DECs are cited, never minted; its files never edited; a moved `main` is merged in at the close (K945).

**Accepted reds, by name, at the opening:**
1. membership's `MODULE_ORDER` tests, from the re-cut until membership's L2 merge (K1006): `test/m/membership/module-order.test.mjs` R83, and as K936 named the same red: R39/R45/R46, `t9-notice-sight-bounds.test.mjs`:185 R79, promotion `registry.test.mjs`:58. BOB lists the exact set on the tranche after the re-cut.
2. `fleetbundles.test.mjs` (the plane bundle carries `MODULE_ORDER`), from membership's merge to L2's close (F1).
3. Any T22 job in L3–L11 that changes a catalogue row turns `row-census.test.mjs` (promotion's after the re-cut) red: accepted by name until T23's L2 stamp (P8: promotion's one job is L2). Each START says so; none of the planned changes needs a row except possibly capture-sources (A10), monitoring (A28, A30), queue (H19) and strength (H10, H12), and capture (H16, J2), escalation (J2, J3), ratification (H2, H6) and the split's moved rows (J10) (check).
4. membership's `MODULE_ORDER` tests (R83 and K936's set), from the `modules.json` edit that adds the split's new module (before L8) until T23's L2 (P8: membership's one job is L2) (J10) (check).
5. The affordances totality on a new op (J3's decline act; any op J2 adds), from its module's merge until affordances and op-declarations merge in L11 (K902's precedent) (check).
6. instance-setup's inbox tests that resolve a knock without a reason, from capture's L3 merge (J2) until instance-setup's L11 merge (check).

**Merge order.** L2: membership early, promotion last (it stamps after membership's merge and re-pins the census). L8 (check): the split's new module first, then publication (deletes its copy, imports), then case-grammar, then public-read, ratification and case-authoring, each merging `tranche/T22` before its own merge. L9: action-clocks before filings (filings imports R12); filing-templates any time. L10: monitoring before scheduler (scheduler's R10 test may drive monitoring's `cadenceTick`). L11: affordances and op-declarations early (J3's totality), control-plane after them (check); queue-producers before queue; instance-setup before installer.

**Generated artifacts.** Each layer close regenerates what its jobs staled (§5.6): the plane bundle at L2 (F1) and after any layer whose plane modules change; `newgroup/dist/newgroup.bundled.mjs` at L11 after installer (F2). The census fixture: BOB adds promotion's new `row-census-<version>.jsonl` to its `tests` before its ownership check, and drops the 1.51.0 path if the job deletes it.

**After K1019–K1025.** Bob approved the six folds and answered the five questions (K1019); all are folded (K1023, K1025) except record-grammar R43/R44 and what needs them, to T23 by the order (N485), and ratification R35, pending Bob. DEC-88's audit adds six modules (K1025). The italic rows below are carried unconditionally. publication is 3,690 lines (K1024); its split stands, the new module `corpus-export`.

## Roster by layer (35 jobs: 2, 2, 3, 2, 2, 5, 0, 6, 4, 2, 7) (check)

*Italic*: carried only if Bob approves its fold before the layer (folds item 6). A module whose every entry is italic drops out if none is approved.

- **L1** text-chain (N471; N480) · bundler (D5)
- **L2** membership (N478; N480) · promotion (E1–E6, the stamp and census; N471; D3)
- **L3** provenance (N471; N480) · capture-sources (A10) · **capture** (J1 (4), J2; *H16, J5*) (check) · **sources** (capture's folds turned four of its tests red: a resolve reason, the 10-per-window limit; K1037)
- **L4** content (N471; DEC-88 R25, R38, R43) · extraction (N478)
- **L5** connections (N471) · observation-log (N471; DEC-88 R16, R17, R26) · **entities** (DEC-88 R1; merge early, connections and bias send its new note) · **progressions** (DEC-88 R2) · **bias** (DEC-88 R11, R12, R29) (K1025)
- **L6** run-rules (N471) · strength (A57, H10, H12; DEC-88 R15; DEC-102 R29, R30) · inquiry (N480; **A9**) · ai-runs (N480) · ~~skills~~ (no T22 entry left: its R1/R5/R31 arms are T23, N485, K1035) (check)
- **L7** **reevaluation** (DEC-102 R18, R29; DEC-88 R15) · **intent** (DEC-88 R2, R18; R9, R11 worded as met) (K1025)
- **L8** **the split's new module** (J10, A42 if homed there) · **publication** (J10; A42 if homed there; *H6 (1), H9* shares) · **case-grammar** (*H6 (1), H9*) · public-read (N480; *H9*) · **ratification** (*H2, H6 (1)*) · case-authoring (N472; *H6, H9*) (check) · **review** (its DEC-88 callers: `src/review/index.mjs`:620's `statementack` link, `test/m/review/copy.test.mjs`:188; K1030)
- **L9** action-clocks (N474, D6) · filings (N474) · filing-templates (N476) · **escalation** (J2; *J3*) (check) · **standards** (DEC-88 R1) · **actions** (the litigation-hold reader for capture R32, K1023) · filings also DEC-88 R8 · escalation also DEC-88 R9 (K1025) · **conformance** (its DEC-88 caller `test/m/conformance/fixture.mjs`:320; K1030) · **consequences** (K1055: `test/m/consequences/reads.test.mjs`:185, R15's assertion at :196, fails intermittently in the full `test/m` run and passes alone; root-cause and make it deterministic, as capture R56's was, K1020)
- **L10** monitoring (A28, A30, A32, A35; **A29**) · scheduler (N479)
- **L11** **affordances** (J1; *J3*) · **op-declarations** (*J3*) · **control-plane** (*J3*) · queue-producers (N476, H15, H19; **J8**; *J5*) · queue (H15, H19) · instance-setup (H17) · installer (A24, A25, H17) (check) · from capture's merge (K1037): control-plane forwards `inboxresolve`'s reason on the `pulled` route (`src/control-plane/index.mjs`:702) or refuses it, answers capture's new refusals' `status`, declares `sort`/`dir` on `inbox`, re-takes `catalogue-end.test.mjs`'s six digests and fixes `doorbell.test.mjs`:325's reasonless discard; op-declarations and affordances: `doorbelltally`, `gradenote`, `heldcaptures` (reads), `heldsetaside`, `heldrestore` (reasoned); `doorbellrefused` stays store-internal, never a public op

J2's audit may add a module to any layer. Sizes (K617, the 4,000-line mark): provenance 3,938 and extraction 3,997 take comments or fixture deletions only; ratification (3,770) takes only H2's contested arm and H6's refusal and stops and reports if its job would pass the mark; publication (3,690; K1024) is split first in its own L8 job and ends under the mark; inquiry (3,783) adds A9's registration only; docprofile (4,950) has no entry and no job. (check)

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

- **capture** (check) · J1 (4), J2: `inboxResolve` requires an authored reason, refusal before any write, the reason on the inbox row (`setup.mjs`:1338's caller passes none: instance-setup's L11 job, or the inbox page's own START). Conditional H16: R31's windows 5 and 10, R54's and the refusal's sentences as folded, the tally read with its privacy note, `inboxList`'s sort. Conditional J5: the grade note on the completed unattended capture. Proof: each with a negative control (a sixth knock refused, a reasonless resolve refused and nothing written). Stales the plane bundle.

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
- **inquiry, A9** (check) · registers its question findings made under a project lens with bias (`registerWorkProducts("finding", …)`, as ai-runs does at `ai-runs/index.mjs`:111), so bias R40's debt reaches them; inquiry is 3,783 lines, registration only. Proof: an inquiry test that a lens change raises the finding's debt, with bias's real sweep; bias's `debt.test.mjs`:234 unchanged. BOB strikes bias R40's mark at the merge.
- **skills** (check) · Conditional H6 (2): the clause and the act by which the assistant drafts a "What changed" statement, read from the catalogue by id (R28's form). Proof: its tests, a stated absence when the act is unpublished.
- **ai-runs** · N480: `ai-runs/index.mjs`:511 (`NEEDS`), :1527 (`scopeFor`): control-plane's now.

**L8** (check: the split, then the DEC shares)
- **the split's new module** · J10: created by copy from publication along BOB's seam map (proposed: the working-corpus export, `export_log`, and the import R32 asks), its requirements carved with no change of meaning; A42 R32 if homed here. Proof: the moved requirements' tests moved and green; R32's tests (every hash, history chain, base link re-derived; a tampered manifest refused) with a negative control. Merge first.
- **publication** · J10: deletes its copy and imports; ends under 4,000 lines; conditional H6 (1), H9 shares as folded. Proof: its suite and its users' green.
- **case-grammar** · conditional H6 (1), H9: the case document's lens section and "What changed" statement. Proof: grammar tests with negative controls.
- **ratification** · conditional H6 (1): an edition after the first without its statement is refused in R2 and R18; H2: R22's contested arm. Stops and reports if its job would pass 4,000 lines (3,770 now). Also (PROMOTION #23's J1 (3), K1027): `bio-plane/src/ratification/ops.mjs`:309 names `Store#gateFacts` as live; it is ratification's own `gateFacts` now: re-word (N480's kind).
- **case-authoring** · conditional H6, H9: composes the statements and the withheld count into the document, keeps the machine draft's origin.
- **case-authoring** · N472 (K998): an R5 test that `MEMBER_ROLES` (`case-authoring/index.mjs`:92) deep-equals ratification's `CASE_MEMBER_ROLES` (`ratification/checks.mjs`:149); keep its own constant (`requirements/case-authoring.md`:161). Proof: that test and a negative control.
- **public-read** · N480: `public-read/index.mjs`:661 (`DO_PATH` in index.mjs). Conditional H9: the case page's lens section, collapsed on screen and whole in print (check).

**L9**
- **action-clocks** · N474, D6: export R12's `factReader(localFacts, viewer)` from the private `holidayFact` (`action-clocks/index.mjs`:613) and `factAnswer` (:633). Proof: R12 test (confirmed, unconfirmed, disputed entry; no `localFacts`), users escalation, action-plans, monitoring, queue-producers, filings green. Merge first.
- **filings** · N474: delete its copy `factReader` (`filings/dates.mjs`:25–:46) and import action-clocks R12. Proof: R30 tests unchanged and green.
- **filing-templates** · N476: `reviewsRequested` (`filing-templates/index.mjs`:1146) answers each version's `project`. Proof: R20 test with a scoped and a group-wide template.

- **escalation** (check) · J2: `escalationOpen` requires a reason (R24's `ESCALATION_NO_REASON`). Conditional J3: the decline act and the determination's escalated/declined/neither read. Proof: negative controls (no reason; a machine; a superseded determination). The new op's totality red until L11 (accepted red 5).

**L10**
- **monitoring** · A29 (check): R25's test asserts each class recorded (`source_refused` for a 404 or refusal, `fetch_failed`, `governed` apart), not only the count. · A28, R18: a document whose substance has not moved across repeated checks earns a longer interval, a contract default only, stated on the plan row; the lengthening rule's figures go to BOB by QUESTION if R18 does not fix them (P17). A30, R28: each open named request in a bundle's `data/gathering.json` whose cadence is due is captured through `capture.acquire`, its locators in order, the request named as authority (the gathering grammar is already registered, `monitoring/index.mjs`:1747). A32, A35: retire the todos `understanding.test.mjs`:13 and :126 against the folded R31, R34 (assert monitoring's reads R47/R48 answer what queue-producers publishes, or remove the todo with the clause). Proof: R18 and R28 tests with negative controls (`cadence.test.mjs`:124 and `understanding.test.mjs`:11 become tests). Merge first in L10.
- **scheduler** · N479: replace the todo `test/m/scheduler/rank.test.mjs`:80 with the composed test (`draft-legacy-tests-recut.md` §4): monitoring's real `cadenceTick` given the scheduler's rank over more due subjects than one batch takes the rank's head.

**L11**
- **affordances** (check) · J1: the 57 from `RUNG_ABSENT` (`affordances.mjs`:928) into `RUNGS` by DEC-88's bands, R27's count re-worded; the six's consequence statements; `inboxresolve` `reasoned`. Conditional J3: the decline act's rung. Proof: R3/R12 totality over the real op table, R27's counts. Merge early.
- **op-declarations**, **control-plane** (check) · conditional J3: the decline op declared and routed. Proof: their totality and stamps tests.
- **queue-producers** · J8 (check): the credit-level to-do (DEC-102 item 3), with a negative control (a chosen level raises none); conditional J5: the unattended capture's item carries its grade note. · N476: home `template-review-requested` (`queue-producers/index.mjs`:2601) under its project. H15, H19: member-facing words as folded. Proof: R20 test; the words' tests re-keyed. Merge before queue.
- **queue** · H15, H19: `QUEUE_CLASS_LABELS` (`queue/index.mjs`:56) as folded; the read's `sort` as the new requirement. Proof: its tests, with the default order unchanged.
- **instance-setup** · H17: the claim page's block (`setup.mjs`:204–214) in DEC-109's words, before the password. Proof: the page test pins the sentences. J2 (check): the inbox page's resolve (`setup.mjs`:1338) asks for and sends the reason capture now requires; its tests red by name from capture's L3 merge until this merge (accepted red 6).
- **installer** · A24, R32: refuse an install into an account that already holds a copy (either evidence bucket or a fleet worker present) before anything is created (`ensureBuckets` `newgroup/src/index.mjs`:250, `scriptExists` :214, `installFleet` :581). A25, R33: install and update read the uploaded script back and compare its hash with the release, naming a mismatch, claiming no success (`uploadInstall` :404, `uploadUpdate` :459). H17: the wizard's last screen in DEC-109's words (`newgroup/src/ui.mjs`). Proof: the todos `newgroup/test/requirements.test.mjs`:853, :854 become tests against a faked management API, each with a negative control. Stales `newgroup/dist/newgroup.bundled.mjs` (F2). Nothing is deployed: a release is Bob's act.

## Left out (62 rows, one hard reason each) (check)

| row | item | hard reason | note |
|---|---|---|---|
| B1 | DIST-14 (office-readers) | deployment | the CSV bound measured on a deployed plane |
| B2 | N75 (image-codecs) | deployment | the 61.3 MB bound measured on a deployed plane |
| B3 | N34 (pdf-worker) | deployment | the JPX bound measured; PPM/PPT JBIG2 also waits on a fixture encoder; pdf-worker is 4,277 lines (P6) |
| B4, B5 | N144, N232 (affordances, legacy-ui, skills) | Bob's (UX) | K899 (2), Bob: "needed, but wait for the new interface" |
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
| J7 | DEC-81's Grade A | Bob's | "its three decisions … are with Bob" (DEC-81's owed line); then a measurement (check) |
| C8 | the first profile's facts without a source | measurement | K925, K934, K941 |
| H13 | DEC-105: audience guidance | Bob's | DEC-105: "the research waits for its trigger" (check) |
| C5 | `PLN-` affordances, plan-page surface, joint action | Bob's | K608 (4), K600 (c) |
| A27 | monitoring R17 (an address's own frequency) | Bob's | no act holds it (REC-191's design gap): who sets it, by what new member act, is requirements and UX (P5, P17); `t22-check.md` question 5 (check) |
| A31 | monitoring R29 (sweeps) | Bob's | its own text: "Sweeps wait for a design of what a sweep's query is"; `t22-check.md` question 6 (check) |
| H1, H6b, J4 | DEC-96 (accept, withdraw, flag, clear), DEC-101 (3) (watching other groups' editions), DEC-92 (the origin mark) | dependency not yet built | nothing brings another group's published edition into this copy: inquiry R7's `inherited` leg names "an edition the published registry holds" (publication R7, this copy's own); no fetch or verification of another copy's case is in the tree (check) |
| H8 | DEC-102: identity levels and testimony weight | Bob's | open doctrine, its owed line: "how each identity level maps to the testimony grade … what counts as corroboration to journalistic and legal standards"; question 2 (check) |
| H16b | DEC-108: the gatekeeper and the discard archive | Bob's | open: "how a litigation hold (question 31) affects the archive's clearing"; question 4 (check) |
| H21 | DEC-111 'working on' notices | Bob's (architecture, P4) | a home: publication (4,408, P6) or a new product module; question 3 (check) |
| H5 | DEC-100 | Bob's | "awaits Bob's ruling" |
| H3, H4, H9b, H11, H14, H16c, H18, H20, J6, J11 | DEC-98, DEC-99, DEC-103's preview, DEC-104's list pages, DEC-106, DEC-108's inbox highlighting, DEC-109's settings card, DEC-110's item styles, DEC-95 (3)'s suggestion line, DEC-82/-86/-87/-90's surfaces | Bob's (UX) | screens of the new interface, not yet built (K633, K899 (2)); DEC-99's conformance is "checked as each screen is accepted" (check) |
| A8 | bias R26 | dependency not yet built | K102's trigger: evaluation findings under a lens (none in strength or review) |
| A21 | inquiry R31 | dependency not yet built | no module defines an opinion element (MK-5, K181) |
| A22, A23 | installer R13, R24 | dependency not yet built | the member surfaces (the new interface, not in the tree), which canon sequences isolation after (System Design :253; Distribution §7); R32's interim refusal is carried (check) |
| A37 | progressions R32 | dependency not yet built | the record holds no amounts or funds as values (K102's trigger) |
| A41 | publication R30 | dependency not yet built | nothing publishes a rendering (D-246) |

**Carried conditionally, so not in this table:** H2, H6, H9, H16, J3, J5 (Bob's approval of the fold before the layer) and A42 (the seam map); one that misses its condition is moved here at its layer's start, with that reason (check).

**At the opening, the new `next.md`** holds each left-out `next.md` entry's full text (from `git show d9a73f24f3:build/plan/next.md`) with the reason above, and the folded DECs' Bob's shares as entries (§9).

## For BOB

1. **The mark audit** (fold 2): done by the check; strike the 25 proved marks at the opening in one ruling citing `t22-check.md` §4's tests; A9 and A29 are entries in inquiry's and monitoring's jobs. (check)
2. **The DEC shares BOB places** (H7, H10, H12, H15, H17, H19): on `main` now, so foldable (manifest). Recommended: carry them, as above, and tell Bob in the opening's report that they are BOB's placement of his DECs, not new decisions.
3. **N480** (G1): file it at the opening (membership's record saw it; this inventory found ten more sites). Recommended: carry, as above.
4. **Rows changed in L3–L11** turn the census red until T23 (rule 3). Recommended: accept by name; START each job to change a row only when its requirement needs it.
5. **The channel's live exchange** (D10): met before the opening (K1014). (check)
6. **publication's split** (J10, A42): carried in L8 (K617: BOB's, "it MUST be split"; not a question for Bob). Draw the seam map and the new module's requirements during L1–L7 (P18). (check)
7. **Bob's questions** (`t22-check.md` §6): the approval of the conditional DEC folds (one page, before L3), and the open doctrine, architecture and UX questions, each with a recommendation. (check)

**Inventory 147 rows: carried 85, left out 62** (check; was 132: 73, 59)
