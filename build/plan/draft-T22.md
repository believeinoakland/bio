# Plan: tranche T22

**Status** · DRAFT for T22, refreshed by a worker for BOB #89, 2026-10-01, from tranche/T21 @ d6f95b70ae. T21's layers 1–10 are closed (K940, K947, K952, K956, K960, K977, K980, K984, K992, K996). Layer 11 is running (K997): affordances, queue-producers, queue, op-declarations, control-plane, plane, legacy-tests, instance-setup. A line marked *conditional on T21 L11* depends on that layer's outcome and is re-checked at T21's close ("For BOB at T21's close", below). This refresh folds in `plan/t22-recheck.md` (K976), rulings K976–K997, the T21 job records of layers 6–10 and `next.md` whole (17 entries). It supersedes BOB #87's draft (K941).

**Before T22 opens (K954).** BOB implements and certifies the cross-account channel: PROCESS-MECHANICS §13.1, prepared on `civicos-process` branch `prep/channel` (K957), reviewed (K973), with its forced-rewrite fix @ c00b0cf680 (checks 107/0, K975). D12 certifies it at T21's close. BOB seeds `build/channels.md` and `mail/BOB`, posts the first NOTICE and DEFER to UX-DESIGN, and merges PR #6 into `main`. Then BOB merges a moved `main` into `tranche/T21` before the fast-forward (K945).

**Cut from** · `next.md` (17 entries: the 12 below and N470–N474); `current.md` (T21) rules 3–4, its roster and "next.md: every entry"; `plan/t22-recheck.md`; rulings K921–K997; `build/plan/starts-T21/` (legacy-tests, control-plane, plane, affordances, op-declarations, queue); `build/jobs/T21/*.md` (layers 1–10); `bio-plane/test/system/row-census.test.mjs`; `bio-plane/src/gate.mjs`:514 (`CATALOG_VERSION = "1.51.0"`); `modules.json`.

**T22's priorities (BOB's, P17):** every entry that can safely be done (P19). The main content is:
- the stamp of T21's layers 3–11 (promotion, L2; P8);
- N471, the notes that name the retired `node tools/mintid.mjs` as live, in the seven modules whose T21 jobs merged before the finding (K966);
- N472, case-authoring's duplicated role list (K983);
- N474, action-clocks' `factReader` export and filings' copy deleted (K992);
- the census suite's next re-pin (legacy-tests, L11; K941);
- any share T21's layer 11 leaves open (*conditional on T21 L11*).

## Rules at the opening

T21's rules hold:
- merge early (§4);
- one file, one editor (§12.2);
- a job names each `not yet met` mark it meets, and BOB strikes it at the merge (K775 (6));
- no layer closes red, except for a red accepted by name;
- owners export, the plane composes (K861).

Added:

1. **The UX design stream (K945).** This process cites the stream's DECs. It folds a DEC only once that DEC is on `main` or Bob names it. It never edits `docs/development/ux-substrate/` or the stream's other files, and keeps the stream's text in a conflict. At T22's close, BOB merges a moved `main` into `tranche/T22` before the fast-forward.
2. **The cross-account channel (K954), once in force.** BOB reads the channel at takeover, at each backstop, before recording any ruling, and on "check the channel". Kinds, outboxes and cursors are as §13.1 states.
3. **Folds before each layer (BOB, P18).** Before L9: action-clocks gains a requirement (R12, BOB's wording) for the provided service `factReader(localFacts, viewer)` (N474). Filings' Uses line names it, and filings' R30 states that its deadlines read it. No other fold is needed: N471 is comments only, and N472 is proved under case-authoring's existing R5.
4. **The stamp (P8).** Promotion (L2) moves `CATALOG_VERSION` from **1.51.0** (K947) to the next MINOR, over every row T21's layers 3–11 changed (table below). It writes a stamp note in the previous notes' form (`gate.mjs`:322–:510). It re-pins `ROW_CENSUS` (R50) to the tree and keeps `GATE_VERSION`'s literal (R34). Promotion does not edit `row-census.test.mjs` (K941; `promotion.bob.md`:11).
5. **The census suite is firm (K941).** `bio-plane/test/system/row-census.test.mjs` belongs to legacy-tests. T21's L11 legacy-tests job does three things: it re-pins the suite to 1.51.0, adds `bio-plane/test/fixtures/row-census-1.51.0.jsonl`, and declares T21's L3–L11 rows `after: "1.51.0"` in `AWAITING_STAMP` (with intent's registration in `COMPOSITIONS_AWAITING`) (*conditional on T21 L11*). After T22's stamp, T22's L11 legacy-tests job retires those declarations and adds the new version's fixture (K884's pattern).
6. **Merge order.**
   - L2: promotion, early.
   - L9: action-clocks before filings (filings imports the new export).
   - L11: legacy-tests after promotion's stamp. It is the only L11 job unless T21 L11 leaves a share open.
7. **Accepted red by name.**
   - `row-census.test.mjs`, from T22 promotion's L2 merge until T22 legacy-tests' L11 merge. It is the same red that K941 accepted for T21.
   - Any red that T21 L11 leaves open and that its close accepts by name (*conditional on T21 L11*).
8. **Rows changed in T22's layers 3–11** are `awaiting stamp` for T23 (P8). No planned job changes a row: N471 is comments only, N472 is a test, and N474 is an export. If a job does change a row, legacy-tests' L11 job declares it.

## Rows awaiting stamp (T21's layers 3–11), for T22's promotion job

Each row is taken from its job's COMPLETE. The census diff since the 1.51.0 stamp commit found only C-53.13 changed in L3–L6 (`t22-recheck.md`:5).

| owner (T21 layer) | row | change | source |
|---|---|---|---|
| provenance (L3) | C-53.13 `CAPTURE_HELD_BY_ANOTHER_BUNDLE` | translation re-worded ("record", N458); code kept | K952; `provenance.md`:8, :36 |
| intent (L7) | `PROJECT_GRAMMAR`'s registration ids, now `["C-2.9"]` | a composition (behaviour, no row), declared in `COMPOSITIONS_AWAITING` | K979; `intent.md`:31 |
| local-facts (L9) | C-126.1–.5 (`MACHINE_CANNOT_CONFIRM`, `NO_SUCH_FACT`, `FACT_ACT_REFUSED`, `FACT_HOW_REFUSED`, `FACT_VALUE_REFUSED`) | new family (K933) | K989; `local-facts.md`:21, :31 |
| filing-templates (L9) | C-115.31 (re-keyed `MACHINE_CANNOT_DRAFT_TEMPLATE`, re-worded), .32 `TEMPLATE_NAME_REFUSED`, .33 `TEMPLATE_KIND_REFUSED` (re-worded), .35 `TEMPLATE_TEXT_REFUSED`, .36 (re-keyed `TEMPLATE_TIER3_FILE`, re-worded), .37 `TEMPLATE_NAME_TAKEN`, .38 `NO_SUCH_TEMPLATE` | moved from filings with their numbers; `where` is now this module's | K991; `filing-templates.md`:24 |
| filing-templates (L9) | C-125.1–.32 (`TEMPLATE_KIND_UNKNOWN` … `TEMPLATES_STATE_REFUSED`, in the record's order; K988's `TEMPLATE_NOT_APPROVED`, `TEMPLATE_ALREADY_ENDED` among them) | new family (K933) | K991; `filing-templates.md`:24 |
| filings (L9) | C-115.41 `TEMPLATE_USE_BRIEF`, .42 `TEMPLATE_USE_FILE`, .43 `TEMPLATE_AND_TEXT` | new | K992; `filings.md`:41–46 |
| filings (L9) | C-115.12 `TEXT_UNWRITABLE`, .34 `TEMPLATE_FROM_UNAPPROVED`, .39 `TEMPLATE_KIND_MISMATCH`, .40 `TEMPLATE_NOT_NAMED` | re-worded (.12, .39 and .40 also have a new `where`) | `filings.md`:43 |
| filings (L9) | C-115.19 `NO_DETERMINATION` | re-sited (`where` is now `is-counsel-packet-basis`) | `filings.md`:44 |
| filings (L9) | C-115.6 `KIND_NO_TEMPLATE`, C-115.17 `NOT_TIER3` | retired; their numbers are never reused | K992; K921 §5 |
| T21 L11 jobs | any row a COMPLETE names (for example a control-plane, affordances or queue row) | add, move, re-key or re-word | *conditional on T21 L11* |

The census reader imports every tree file (`test/system/row-census.mjs`:52). C-125 and C-126 therefore enter the census without a registration. They are outside the catalogue, as C-112–C-117 are (`gate.mjs`:244).

**No row from:** action-clocks (`action-clocks.md`:15), action-grammar, actions, escalation (its trigger-id form, N462, changes no row), reevaluation (`REEVAL_SOURCES` unchanged), project-stage (code unchanged), public-read, publication, ratification, scheduler, monitoring, agent-worker (comments, tests or behaviour without a row; K977–K996), or T21's L3–L6 jobs other than provenance (inquiry-grammar, record-core, retrieval and observation-log state "nothing awaits stamp", `t22-recheck.md`:5). Connections' `out_of_view` (N459) is an additive wire key, not a row (`connections.md`:21). Jurisdictions' codes are not catalogue rows.

## Roster (by layer; 11 jobs, 10 certain and 1 conditional)

- **L1** text-chain (N471)
- **L2** promotion (the stamp, rule 4; N471)
- **L3** provenance (N471)
- **L4** content (N471)
- **L5** connections (N471), observation-log (N471)
- **L6** run-rules (N471)
- **L7** none
- **L8** case-authoring (N472)
- **L9** action-clocks (N474), filings (N474)
- **L10** none
- **L11** legacy-tests (rule 5: the census suite). *Conditional on T21 L11:* queue (N471's share, if QUEUE #10 leaves it open), and any other L11 module whose T21 share is left open.

No module past the 4,000-line mark is touched (textchain.mjs 2,023; case-authoring/index.mjs 2,071; filings/index.mjs 1,609; action-clocks/index.mjs 772).

## STARTs, sketched (BOB writes the final ones)

The N471 lines below are each a comment only, with no row or behaviour change. Each job re-words the note to say that the family was minted with the old process's tool, retired with `tools/` in T19 (the past-tense provenance form of `inquiry-grammar/checks.mjs`:12 and `basis-versions/checks.mjs`:866). Each job also re-scans its own paths for any other mention of `tools/mintid`. Proof: the module's suite stays green.

**L1**
- **text-chain** · N471: `bio-plane/src/textchain.mjs`:425.

**L2**
- **promotion** · The stamp (rule 4). Read each `build/jobs/T21/*.md` of layers 3–11 for "awaiting stamp" and use the table above. Move `CATALOG_VERSION` (`src/gate.mjs`:514) from 1.51.0 to the next MINOR, with its note. Re-pin `ROW_CENSUS` (R50) to the tree and keep `GATE_VERSION`. Do not edit `row-census.test.mjs` (K941). Also N471: `promotion/checks.mjs`:241. Proof: the R34 and R50 tests; `test/m/promotion/` green; the COMPLETE names the census rows that turn the suite red. Merge early.

**L3**
- **provenance** · N471: `provenance/checks.mjs`:235.

**L4**
- **content** · N471: `content/checks.mjs`:19 and :223. At :223, "no `mintid C`" names the tool as the live alternative to a sub-number; re-word it as provenance.

**L5**
- **connections** · N471: `connections/checks.mjs`:25, :179.
- **observation-log** · N471: `observation-log/checks.mjs`:212.

**L6**
- **run-rules** · N471: `run-rules/checks.mjs`:370.

**L8**
- **case-authoring** · N472 (K983): `MEMBER_ROLES` (`case-authoring/index.mjs`:92) and ratification's `CASE_MEMBER_ROLES` (`ratification/checks.mjs`:149) are one vocabulary written twice. The job adds an R5 test in `test/m/case-authoring/` that asserts the two are deep-equal. It keeps its own constant: its requirements' note 2 (`requirements/case-authoring.md`:161) says `MEMBER_ROLES` is this module's, and case-authoring already uses ratification. Proof: that test, plus a negative control (a changed copy fails it).

**L9**
- **action-clocks** · N474 (K992): export `factReader(localFacts, viewer)` as R12 (rule 3) words it. It is built from the private `holidayFact` (`index.mjs`:610) and `factAnswer` (:630) that `clockPropose` already uses. It answers a `factOf` in `computeDeadline`'s shape, or null without a `factStatus`. Proof: a requirement-named R12 test (a confirmed, an unconfirmed and a disputed holiday entry, and no `localFacts`), with users escalation, action-plans, monitoring, queue-producers and filings green. Merge first in L9.
- **filings** · N474: delete its copy, `factReader` (`filings/dates.mjs`:21–:48), and import action-clocks' export. Proof: the R30 tests are unchanged and green.

**L11**
- **legacy-tests** · Rule 5. In `row-census.test.mjs`:
  - retire every `after: "1.51.0"` declaration (stamped by T22's promotion);
  - retire any `after: "1.50.0"` declaration that T21's L11 job left;
  - add `bio-plane/test/fixtures/row-census-<T22 version>.jsonl`, reproduced on the stamp commit;
  - drop fixtures that no stamp reads (the 1.50.0 one, as 1.43.0–1.47.0 were);
  - declare any row a T22 L3–L11 job changed `after: "<T22 version>"`.

  The negative control drives `compare` as before. Proof: the suite green, the kept suites green, no SKIP.
- *Conditional on T21 L11* **queue** · N471's share (K966), if QUEUE #10 does not meet it. `queuestate.mjs`:233 is already past tense (`t22-recheck.md`:73).

## next.md: every entry (17)

**CARRIED (3):**
- N471 (text-chain L1, promotion L2, provenance L3, content L4, connections and observation-log L5, run-rules L6). Its release-embedded copies are LEFT OUT below. Inquiry-grammar and basis-versions met it (K971), and ratification met it (K983). Queue's share is T21 L11's (*conditional*).
- N472 (case-authoring L8).
- N474 (action-clocks and filings L9, after rule 3's fold).

**LEFT OUT (14 whole, 1 in part):**

| entry | module | hard reason | note |
|---|---|---|---|
| DIST-14 | office-readers | deploy | the CSV bound is measured on a deployed plane |
| N75 | image-codecs | deploy | the 61.3 MB bound is measured on a deployed plane; code met (K281) |
| N34 | pdf-worker | deploy; a dependency not yet built | the bound is measured on a deployed plane; PPM/PPT JBIG2 waits on a fixture encoder; a split review precedes any job that grows pdf-worker (P6) |
| N144, N232 | affordances, legacy-ui (N232 also skills) | Bob's (K899 (2)) | wait for the new interface |
| N68, N70 (legacy-ui shares) | legacy-ui | Bob's: UX (K633) | `app.html`'s stale docprofile copy |
| N241, N371 | legacy-ui | Bob's: UX (K633) | |
| N437 (legacy-ui share) | legacy-ui | Bob's: UX (K633) | `app.html` comments |
| N461 (release share) | legacy-ui, at the release | deploy (the next signed release build, Bob's act) | `release/bio-plane.bundled.mjs`, `newgroup/src/release.mjs`, `newgroup/dist/newgroup.bundled.mjs`; more old strings landed there in T21 (K952, K956, K958) |
| N467 (legacy-ui share, with N469's legacy-ui notes) | legacy-ui | Bob's: UX (K633; K941) | `civicos-ui/check-mock-envelope.mjs`, `app.html`, `README.md`; agent-worker's share met (K977) |
| N470 | publication, reevaluation | Bob's: UX (K943; design work under way, P17) | no withdrawal act until it concludes |
| N473 | filings | deploy (K986 (1)) | the `filing_templates` table is dropped once filing-templates' migration has run on every instance |
| N471 (release share, in part) | at the release, with N461 | deploy | `newgroup/src/release.mjs` and `release/bio-plane.bundled.mjs` embed the old notes (generated, `scripts/embed-release.mjs`); they change with the next signed release build |

**Rows carried over (not N entries), each LEFT OUT, as `current.md` (T21) states them:**
- office-readers R28/R29 retired: deploy (each migration runs at every instance);
- `MODES.plan` deployed: deploy;
- the newgroup installer with N336: deploy, Bob's act;
- contradiction R41 and the K5 arms: deploy;
- `PLN-` affordances, the plan-page surface and the joint action: Bob's (K608 (4), K600 (c));
- N389 and N-A13: Bob's: UX (K633).

**Also not entries:** the first profile's facts without a source (the Civil Grand Jury's, the Controller's, the Council's and the State Controller's hours; any 2027 year; the City's 09-09 and 11-11, read as business days, the safe side, K941; M-188's county list, not written, K934). These are measurements (K925, K934), and a member's confirmation reaches them through local-facts.

## Accepted reds

**Closed in T21:**
- membership's (K946);
- record-core's and promotion's (K944, K947);
- intent `grammar.test.mjs`:47 (K979);
- project-stage's five (K982);
- filings' 35 (K992);
- the code held twice between filing-templates' and filings' merges (K935, closed by K992).

**Open at this draft, each until a T21 L11 merge** (*conditional on T21 L11*):
- `row-census.test.mjs` (7/1, "no snapshot of 1.51.0"), until legacy-tests (K941);
- control-plane `catalogue-end.test.mjs` R43 (C-53.13's digest), until control-plane (K952);
- control-plane `families.test.mjs` R22 (`CHECK_FAMILIES` lacks C-125, C-126), until control-plane (K992);
- affordances `catalogue.test.mjs` R3 (`templates` moved), until affordances (K992);
- the totality on the new ops, until op-declarations' and affordances' merges (T21 rule 3).

Any of these still red at T21's close needs its own acceptance by name or a T22 job in its module's layer.

**New in T22:** `row-census.test.mjs`, from promotion's L2 merge to legacy-tests' L11 merge (rule 7).

## Depends on T21's outcome (*conditional on T21 L11*)

- The stamp table's last row: any row an L11 COMPLETE names.
- Rule 5: whether legacy-tests' T21 job re-pinned to 1.51.0, added the 1.51.0 fixture and declared every T21 L3–L11 row. Whatever it leaves becomes T22 L11 legacy-tests' work, but must be done before T22's stamp is checked.
- Every T21 share still pending at L11 rejoins `next.md` at the close and is placed in T22's L11 unless a hard reason holds:
  - N463 (plane: delete `src/index.mjs`; affordances' `plane.test.mjs`);
  - N465 (control-plane `families.mjs`:55);
  - N468's L11 shares;
  - N469's L11 shares (affordances, queue-producers, queue, op-declarations, control-plane, instance-setup, legacy-tests);
  - N471's queue share;
  - K921's L11 work (ops declared, graded, dispatched; producers R20, R21; queue kinds; plane composition of local-facts and filing-templates, K989, K991);
  - K982's review-copy proof (control-plane);
  - legacy-tests' `civicos-ui/test/run.mjs`:79, :88 (K935, K965).
- Every entry filed during T21's layer 11 (P10).

## For BOB at T21's close

1. **Re-check every `awaiting stamp` row of T21 L7–L11** against the merged COMPLETEs before writing promotion's START. T22's stamp must take every such row from 1.51.0:
   - intent's composition `["C-2.9"]` (K979);
   - local-facts C-126.1–.5 (K989);
   - filing-templates C-115.31–.33, .35–.38 and C-125.1–.32 (K991);
   - filings C-115.41–.43, the re-worded .12, .34, .39, .40, the re-sited .19, and the retired .6, .17 (K992);
   - whatever the eight L11 COMPLETEs name.

   Also confirm that the census diff from the 1.51.0 stamp commit to T21's tip shows exactly these rows. The L3–L6 diff showed only C-53.13.
2. **Legacy-tests' T21 census work** (K941; its START's "Also (K941)"): check that the suite stands at 1.51.0 with its fixture and every T21 L3–L11 declaration. Otherwise T22's L11 job takes the gap (rule 5).
3. **The open accepted reds** (above): each one is closed by its L11 merge, or accepted again by name for T22.
4. **N471's queue share and every other L11 share:** met, or back in `next.md` and placed in T22's L11.
5. **Plane's `modules.json` path:** BOB drops `bio-plane/src/index.mjs` from plane's `paths` at PLANE #12's merge (`starts-T21/plane.txt`), if the deletion went in.
6. **Scheduler's R10 todo** (`scheduler.md`, "Observed, not changed"): `rank.test.mjs`' R10 test is `todo`, waiting on monitoring R19/R20 "in its own T11 job, N224". R10 carries no `not yet met` mark. Recommended (BOB's, P17): check monitoring R19/R20 and N224 in `archive/next-applied.md`. If they are met, file an entry for scheduler to arm the test. If not, mark R10 `not yet met` with its reason.
7. **The rule-3 fold (N474's R12)** is BOB's wording and is done before L9. It adds a provided service to a product module. Recommended: treat it as a detailed technical decision (P17) that changes no meaning, and report it to Bob as done.
8. **The channel (K954).** Implement and certify it, and merge PR #6 and the moved `main` (K945), before the opening.
