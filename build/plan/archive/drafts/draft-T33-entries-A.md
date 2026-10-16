# T33 entries A: TIME, ORGANISATIONS AND OBLIGATIONS, LAW, COURTS

Sources read whole: the ladders §1–§3, §4, §5, §6, §7, §10 (`docs/architecture/BIO_Capability_Ladders_v0_1.md`), constructs.md §2.1–§2.4, §3, §4, §6, §7, constructs-2.md §1–§5, §7, rulings K1429–K1495, `build/modules.json`, sizes.tsv, and the requirement files named below. Facts are at `tranche/T32` as checked out.
Where the syntheses differ, the rulings win: K1440 is amended by K1453 and INT C-17 (a duty may bind a person); K1442's depth 6 is superseded by K1470 (8, at most 10); K1487 rewords entities R26; K1452 lifts the bar on using a caption as an alias.
Size note: sizes.tsv counts each module's `paths`. For `docprofile` and `jurisdictions` the paths include their tests (docprofile is 3,170 source + 1,780 test lines = 4,969; jurisdictions is 1,533 source + 1,637 test lines = 3,175). For every other module the count is source only.

## (a) Entries for stages 0, 1a and 1b

P8 (one job per module) means every line below that names the same module is **one job** in T33, whatever its stage label. Jobs run layer by layer. Within a layer, "depends on" gives the merge order.

### TIME

- `jurisdictions` · L1 · extended · 0+1a · Widen R26 as data only (ladder §4.4 L1–L2; K1445). It gains `units` (days, hours, business hours), `direction` (forward or backward), `roll` past closed days, `closures`, `tolling`, and an `extension` `{days,count,when}` that is now computed. `starts` gains the anchors `entered`, `served`, `hearing` (reserved for COURTS) and `act`/`known`. **§7 item 1:** `received` is defined once as the counterparty's receipt of the group's request, counted from the group's `sent` entry. New facts `weekend` and `computation` cite CCP §§12 and 12a (**§7 item 2**, D196). Channel `cutoff`/`outages`. `fiscal_year` per body (F1; MONEY 1b reads it). R28 gains the new codes. R44's "UNMEASURED is not a basis" is extended to `deadlines` (K1445). R22/R45: the test profile supplies each new fact. **§7 item 7 (data):** source Oakland's `records_response` and its five counterparties (`oakland-alameda.mjs:207–217, 248`) or withdraw them. First sourced rule set: CPRA with extension, Brown Act 72 h/24 h, OMC 2.20.070's 48 business hours, Government Claims Act 6 and 12 months, FOIA 20 working days, each with a primary source · est. new/changed requirements: 12 · uses (new edges): none · depends on entries: none (merges first in L1) · measure-first: the 20 published worked deadline examples, each with a negative control (P7); a primary source for each rule (K903 (6)).
- `civil-time` · L1 · new · 1a · The pure engine, 1,500–2,500 lines, directly after `jurisdictions` (ladder §2 TIME, §4.4; K1439). It has no store, no network and no clock; "now" comes only from its caller and `Temporal.Now` is never read (R-1 T-E9). It provides:
  - the local day from an instant and a zone (K1444 (iii));
  - date-times with precision and zone and EDTF level-1 bands (K1464), compared three ways;
  - evaluation of time rules: hours and business hours, forward and backward, roll-forward, extension, tolling, "close of business" in the office's hours (R41/R42 read at last; **§7 item 4**);
  - due-date basis kinds `rule|commitment|dependency{precedes,lead,why}|window` (K1431);
  - direction-aware uncertain dates: the group's own deadlines use the earliest candidate, a body is overdue only after the latest (K1444 (i));
  - a bounded RRULE subset (WEEKLY/MONTHLY/YEARLY, BYDAY with ordinal, BYMONTHDAY, BYSETPOS, EXDATE, UNTIL; 24 months or 500 instances, `truncated`);
  - fiscal-period mapping;
  - `validAt({valid:{from,to,precision,zone},basis}, date)` → in, out or undetermined{why}, where a null bound means "not stated" and a bound may be `{event, edge}` resolved by the caller from its `bound_cache`;
  - calendar-date validation;
  - inclusive local-day ranges;
  - a trace naming the rule, the citation, the days skipped and the tz/ICU version;
  - `span` for calculations.

  · est. new/changed requirements: 20 · uses (new edges): record-grammar, jurisdictions · depends on entries: `jurisdictions` R26 (same layer; merges after jurisdictions) · measure-first: `Intl` IANA zones and `Temporal` presence on the deployed Workers runtime; the 20 worked examples above.
- `action-clocks` · L9 · extended · 0+1a · `computeDeadline` (`index.mjs:694–749`) delegates every count to `civil-time`. R2 `clockPropose` counts from `sent` (**§7 item 1**; correct `clocks.test.mjs:166–179`), rolls past closed days, takes the weekend from the profile (**§7 item 2**, `:704`, `:744`), and computes extension and hours (**§7 item 4**). R10–R12 are re-pointed. R7: "names its basis" with the K1431 kinds, and a deadline basis may name a held standard (K1446). A computed deadline is adopted in one member act (K1440, B4 (iii)) · est. new/changed requirements: 5 · uses (new edges): civil-time, standards · depends on entries: civil-time; standards (L5 move); jurisdictions R26 · measure-first: none beyond civil-time's.
- `actions` · L9 · extended · 0+1a · R12 `clock_overdue` is taken on the local day of the office's or venue's jurisdiction through `civil-time` (**§7 item 3**, `index.mjs:174–183`; K1444 (iii)). R15's `BAD_DATE` validates calendar dates (the same shape-only defect as §7 item 6). This is done once through civil-time, with no stage-0 interim fix, because civil-time (L1) is built before L9 in the same tranche. ORG and LAW parts of this job are listed below · est. new/changed requirements: 2 · uses (new edges): civil-time · depends on entries: civil-time · measure-first: none.
- `monitoring` · L10 · extended · 0+1a · R34 `deadline-recheck` marks overdue on the local day through `civil-time` (**§7 item 3**, `index.mjs:2746–2764`; K1444 (iii)) · est. new/changed requirements: 1 · uses (new edges): civil-time · depends on entries: civil-time · measure-first: none.
- `local-facts` · L5 · moved (L9 #72 → L5 directly after `lines`) + extended · 1a · Its R3 horizons use the local day through `civil-time` (**§7 item 3** site `index.mjs:53`). R6 `factPath` follows the `part_of` line to an office's parent, keeping the profile `offices` as fallback (ORG bridge, ladder §5.4). Layer 5's contract gains "law and local facts held over captured content" (K1438) · est. new/changed requirements: 3 · uses (new edges): lines, civil-time · depends on entries: lines (same layer, merges first); civil-time · measure-first: none.
- `progressions` · L5 · extended · 1a · R16's `within` counts through `civil-time` units, not fixed 86,400,000 ms days (**§7 item 3**; R-1 T-E4). A flow `basis` may name a held standard (K1446, B11 (ii)). Anchoring on the event's own date is 2a (see (d)) · est. new/changed requirements: 3 · uses (new edges): civil-time, standards, local-facts · depends on entries: standards and local-facts moves (same layer, earlier) · measure-first: none.
- `queue` · L11 · extended · 1a · Snooze-by-date (R21–R22) and `index.mjs:246` use the local day through `civil-time` (**§7 item 3**; R-1). **§7 item 13** (queue part): sorting by `due` is already built (queue R49 `due`; queue-producers R25; K1038), so this needs no work · est. new/changed requirements: 2 · uses (new edges): civil-time · depends on entries: civil-time · measure-first: none.
- `queue-producers` · L11 · extended · 1a · The five UTC-day sites (`2449, 2499, 2587, 2607, 2831`) delegate to `civil-time` (**§7 item 3**). R25 `due` is the local day. This module is 3,875 lines: nothing new is added (see (c)) · est. new/changed requirements: 2 · uses (new edges): civil-time · depends on entries: civil-time · measure-first: none.
- `query-language` · L5 · extended · 1a · **§7 item 5:** `created:`/`updated:`/`due:` ranges become inclusive local days (`query.mjs:1487–1491, 1693–1701`), and `due`/`overdue:` carry an `asOf` note instead of reading the cached flag silently (`:107–122`). The LAW fields are listed under LAW below · est. new/changed requirements: 2 · uses (new edges): civil-time · depends on entries: civil-time · measure-first: none.
- `inquiry-grammar` · L6 · extended · 1a · **§7 item 6:** `DATE_RE` (`grammar.mjs:171`) validates calendar dates through `civil-time`, so 2026-02-31 is refused. The LAW leg arm is listed under LAW below · est. new/changed requirements: 1 · uses (new edges): civil-time · depends on entries: civil-time · measure-first: none.
- `op-declarations` · L11 · extended · 1a · `op=clockpropose` is declared. Today action-clocks R2 has no op, which is the latent 29-March defect of §7 item 2. The new ORG and LAW reads and acts are declared as well: `entityidentify`, line write/correct, `structureat`, `holderat`, `standardinforce`/`standardsfor` (names are BOB's) · est. new/changed requirements: 3 · uses (new edges): none (dispatch through the modules' `xOps` arms) · depends on entries: action-clocks, lines, standards · measure-first: none.

### ORGANISATIONS AND OBLIGATIONS

- `entities` · L5 · extended · 1a · Adds `identifiers [{scheme,id,valid?,basis}]` that resolve at grade A (R9 amended, new refusals beside R2; the schemes OCD-ID, org-id and Legistar `BodyId`/`PersonId` are profile data). Adds the kinds `program`, `place` and `proceeding` (R1's closed list, `index.mjs:23–25`; K1441; the proceeding facet waits, see (d)). Adds a closed `sector` on organisation kinds (K1453). R26 is reworded per K1487: a declared relation may be an `explore` hop marked "declared, not evidenced", still never resolving a reference or carrying a grade · est. new/changed requirements: 8 · uses (new edges): none · depends on entries: stage-0 id grammar (`ENT-` widened; other list) · measure-first: none.
- `lines` · L5 · new · 1a · `LIN-`, 1,800–2,300 lines, directly after `events` (constructs-2 §4.1; K1439, K1470).
  - Row shape: `{kind, from, to, role?, capacity?, valid{from,to,precision,zone}, basis, asserted_by, end resolution}`. A bound is a value or `{event,edge}`, never both, and is resolved into a `bound_cache` moved by `events.onWhenChanged` in the same transaction (R-3 I-1).
  - Closed kinds, revised only by spec (K1441), in two groups:
    - structure: `part_of`, `post_in`, `holds` (with `capacity` in place of `status`), `reports_to` (administrative, functional, budgetary), `oversees`, `appoints`, `seat_on` (office→body only), `funds`, `contracts_with` (OCDS roles), `acts_for`, `responsible_for`, `custodian_of`, `successor_of`;
    - people (constructs-2 §2.1; K1455): `belongs_to`, `educated_at`, `credentialed_by`, `owns_interest_in`, `related_to`, `associate_of`.
  - Two-axis grade: the assertion with its passage, and each end's resolution (R-1 O-E1).
  - Reads: `structureAt`, and `holderAt`, which counts only a `holds` to an office and answers undetermined when no line covers the date or two overlap. One home: the ladder §5.4 puts `holderAt` here and constructs-2 §2.1 lists it under `people`; recommend `lines` (BOB's).
  - Also: `neighbours({node,kinds,at,page})` in `connection-grammar`'s shape; both-end indexes `(from,kind,bound_cache)` and `(to,kind,bound_cache)`; store-side one-home checks; a `record-core` table declaration.
  - **No `chain` walker in T33.** `explore` is 2b, and a separate walker is what ladder §2 CONNECTIONS "blocks if careless".

  · est. new/changed requirements: 35 · uses (new edges): record-grammar, record-core, membership, promotion, provenance, entities, events, civil-time, connection-grammar · depends on entries: entities; minimal `events` (other list; precedes lines); `connection-grammar` (L1, other list); the stage-0 id grammar and table declaration with the derived-cache convention (other list) · measure-first: Legistar seats by body and year; the directories in the corpus (about 395 ± 272); whether budget department codes stay stable across two fiscal years.
- `instance-setup` · L11 · extended · 1a · The bridge (ladder §5.4; R-1 O-O1; K1443). Each profile office `{role, body}` (jurisdictions R24) is seeded as an `office` entity with `post_in`/`part_of` lines, machine-attributed and system-asserted, with the profile entry as basis · est. new/changed requirements: 3 · uses (new edges): entities, lines · depends on entries: entities, lines · measure-first: the bridge's resolution rate (profile counterparties against Legistar bodies; can be estimated at the desk).
- `actions` · L9 · extended · 1a · An addressee is suggested from `custodian_of`/`responsible_for` lines. R9's `entity_id` is filled from the bridge. **§7 item 8** (plane half): trace which path applies R9 to the add flow's `{state:"named", name}` and make the refusal reach the caller visibly. This is the same job as the TIME and LAW lines for actions · est. new/changed requirements: 2 · uses (new edges): lines · depends on entries: lines, instance-setup bridge (data at setup) · measure-first: none.
- `legacy-ui` · L11 · extended · 0 · **§7 item 8** (UI half): `civicos-ui/app.html:19983` sends `{state:"named", name}`. It must send `{role, body}` (or `entity_id`) or fail visibly. This is a legacy module with no requirement file, and design work is paused (K1475), so BOB's choice is either a one-line legacy fix or a NOTICE to UX-DESIGN · est. new/changed requirements: 0 · uses (new edges): none · depends on entries: actions R9 · measure-first: none.
- `escalation` · L9 · extended · 1a · R12 targets follow `oversees`/`appoints` lines, with the profile `oversight` flag only as fallback. R4's actor office is resolved to its entity · est. new/changed requirements: 2 · uses (new edges): entities, lines · depends on entries: lines · measure-first: none.
- `conformance` · L9 · extended · 1a · Actors carry an `entity_id` (R1; ladder §5.4). R3 reads `standards.inForceAt` (or keeps `inForce` as an alias; BOB's). `ACT-` becomes an event and `determine` takes `act:{event}` (EVENTS 1a, other list; same job) · est. new/changed requirements: 3 · uses (new edges): entities, events · depends on entries: standards move, events minimal · measure-first: none.
- `doctypes` (new module from the docprofile split; name BOB's) · L1 · extended · 1b · A Legistar `OfficeRecords`/`Persons` reader as a generic JSON content type. Its output is a system-rule assertion (DEC-52; K1443 as extended in K1470). It covers seats only (R-1 O-E2) and drops contact fields (K1485 row 9) · est. new/changed requirements: 3 · uses (new edges): none · depends on entries: the docprofile split (opening) · measure-first: M-P2, Legistar `Persons`/`OfficeRecords` coverage by body and year.
- `instance-setup` · L11 · extended · 1b · Seat seeding at setup (K1468 keeps it): council and committee seats as `seat_on` lines, holders as `person` entities with Legistar `PersonId` identifiers, and `holds` lines with `capacity` elected or appointed. This is one job with the 1a bridge. `people` L1–L2 reads (`personAt`, `careerOf`) are in the PEOPLE list · est. new/changed requirements: 2 · uses (new edges): doctypes · depends on entries: lines, entities identifiers, doctypes reader, `people` (1b, other list) for identity claims · measure-first: M-P2.
- `query-language` (+ `retrieval` projection) · L5 · extended · 1b · The `holder:` field over `lines.holderAt` (together with PEOPLE's `person:` and `post:`). `obligor:` and `owed_to:` wait for `duties` (see (d)) · est. new/changed requirements: 1 · uses (new edges): lines · depends on entries: lines · measure-first: none.

### LAW

- `standards` · L5 · moved (L9 #73 → L5 after `observation-log`, before `progressions`) + extended · 1a · The move is whole (K1438). Stage-1 fields: `instrument` (a work key composed only from profile data, shaped like ELI), `portion`, `requires`, `copy` (official, codifier, undetermined), `current_through`, and `period_basis`, which may name an enactment event (constructs-2 §3 LAW). `inForceAt({key,portion?,date})` goes through `civil-time.validAt`, answering undetermined with a reason (R7 widened). `standardsFor` is the reverse index (N4). R9/R10: adoption without captured text is refused `STANDARD_NO_TEXT`. A test shows the promotion check still runs correctly when it runs earlier relative to the L5–L8 listeners (R-2 L-E7). The callers `conformance`, `filings`, `action-plans`, `affordances`, `control-plane` and `plane` keep working if `inForce` stays as an alias; that recommendation avoids five caller jobs · est. new/changed requirements: 18 · uses (new edges): entities, events, connections, civil-time, extraction · depends on entries: civil-time; events minimal; observation-log move (same layer order); membership R83 re-pin · measure-first: captured OMC pages and ordinances (about 1,850 ± 314) and the `readingref` resolution rate; codifier lag against Legistar; how the official code is served (Municode is an Angular shell, R-2 L-E8).
- `jurisdictions` · L1 · extended · 1a · Adds `law_ranks`, the copy status per code, the amending-clause vocabulary, and the profile pieces the instrument key is composed from (K1446, B11). Same job as TIME's · est. new/changed requirements: 4 · uses (new edges): none · depends on entries: none · measure-first: how the official code is served.
- `doctypes` (docprofile split) · L1 · extended · 1a · The `regulation` reader adds section paths and headings, which give `portion` extents (ladder §6.4). Same job as the 1b reader above · est. new/changed requirements: 4 · uses (new edges): none · depends on entries: the docprofile split at opening (see (c)) · measure-first: section-boundary accuracy on 50 OMC pages.
- `query-language` + `retrieval` · L5 · extended · 1a · Fields `standard:` and `cites:` (query-language R3 FIELDS; the retrieval R2 projection). One job each, with the TIME and ORG lines above · est. new/changed requirements: 3 · uses (new edges): retrieval→standards · depends on entries: standards move · measure-first: none.
- `actions` · L9 · extended · 1a · A governing law (R2/R18) and a records-request law (R5) may name a held standard, and the member's citation string stays their statement (K1446) · est. new/changed requirements: 2 · uses (new edges): standards · depends on entries: standards · measure-first: none.
- `inquiry-grammar` · L6 · extended · 1a · The leg arm (R4) admits a held standard as a target (K1447 (iii)). Until it lands, a question cites the captured passage as an information leg · est. new/changed requirements: 2 · uses (new edges): standards · depends on entries: standards · measure-first: none.
- `inquiry` · L6 · extended · 1a · R4 wording and R13 `earned`/ceiling for an `STD-` target. The check code goes in inquiry-grammar, because inquiry is 3,903 lines · est. new/changed requirements: 2 · uses (new edges): standards · depends on entries: inquiry-grammar (same layer, merges first) · measure-first: none.
- `skills` · L6 · extended · 1a · The `legal_lookup` skill text: search the four levels, request captures of what is missing, propose standards with captured text (`STANDARD_NO_TEXT`), and publish what could not be mechanised beside what was (DEC-54). It is deployable only when investigate and the account are live (R-2 L-E5; QUESTIONS list) · est. new/changed requirements: 3 · uses (new edges): none · depends on entries: standards · measure-first: 30 seeded law questions (acceptance; after build).
- `membership` · L2 · extended · 1a · R83 `MODULE_ORDER` is re-pinned to the order in (b), with its listener-order test (R-2 L-E7). This is mechanical and BOB's at the opening, together with `modules.json`, the `layers.md` rows and K11's module list (K1438) · est. new/changed requirements: 1 · uses (new edges): none · depends on entries: every move and new module in (b) · measure-first: none.
- `bundler` (release) · L1 · extended · 0 · **§7 item 13:** the stale three-level `LAW_LEVELS` in `release/bio-plane.bundled.mjs:4746` (still present) disappears when the close regenerates the bundle. No requirement is needed · est. new/changed requirements: 0 · uses (new edges): none · depends on entries: none · measure-first: none.

### COURTS (stage 0–1b share)

- `entities` · L5 · extended · 1a · The kind `proceeding` (K1441), in the entities line above. The facet `forum`/`forum_kind`/`number`/`kind` is in (d) and flagged as movable.
- `jurisdictions` · L1 · extended · 1a · The `starts` anchors `entered`, `served` and `hearing` (in the R26 line above).
- `lines` · L5 · new · 1a · Reserve the families `party_to{role}`, `appeal_of`, `consolidated_with`, `remanded_to`, `arises_from` in the closed list now (B5), with no reads, so 2a adds no spec revision · est. new/changed requirements: +1 in lines.
- `docket` (+ `publication`) · L8 · extended · ruled "now" (K1480, B18 (b)) · The compliance path for a court order to remove or redact a published case, and to seal or unseal: the order is captured, a signed docket entry names it, and the edition is stamped. A later edition states the correction, and past editions stay as they were (K1493 mirrors this). The publication half cannot land without a publication split first (4,625 lines; see (c)) · est. new/changed requirements: 5 · uses (new edges): none (docket already uses publication) · depends on entries: the publication split (opening), the removal marker of C10 (PEOPLE list) · measure-first: none.

Requirement totals for these constructs in T33, about 155–175 in all:
- TIME about 53;
- ORG about 59, including COURTS' entities share;
- LAW about 42;
- COURTS 0–1b about 6.

## (b) Module moves and the total order of layers 1 and 5 after T33

Moves:
- `local-facts` L9 → L5;
- `standards` L9 → L5;
- `observation-log` within L5 (after `bias` → after `connections`).

New in T33:
- L1: `civil-time`, `calc-grammar`, `connection-grammar`, and the docprofile split module;
- L5: `events`, `lines`, `money`, `people`, `calculations`;
- L6: `answers` (QUESTIONS list).

Not in T33, inserted later at their positions with no edge broken:
- `duties`, between `money` and `people`;
- `explore`, between `people` and `bias`;
- `sheet-worker`, a fleet Worker in L1.

`people` declares `duties` among its uses (constructs-2 §4.1) but needs it only for person obligors (2b), so at 1b it carries no `duties` edge.

**Layer 1 after T33:**
1. `record-grammar`
2. `jurisdictions`
3. `civil-time`
4. `calc-grammar`
5. `connection-grammar`
6. `test-support`
7. `runtime-limits`
8. `signatures`
9. `bundler`
10. `id-spaces`
11. `subresources`
12. `ooxml`
13. `office-readers`
14. `odf-reader`
15. `pdf-reader`
16. `format-registry`
17. `text-chain`
18. `site-profiles`
19. `docprofile`
20. `doctypes` (the split; name BOB's)
21. `image-codecs`
22. `pdf-pixels`
23. `pdf-worker`
24. `ocr-worker`

Caveat: `civil-time` sits before `test-support`, so its tests cannot import `test-support`. `jurisdictions` has the same constraint today. If the tests need `test-support`, place the three engines after it; no edge depends on the order.

The split's alternative, by the site-profiles precedent (K653): put `doctypes` directly before `docprofile`, with `docprofile` keeping a re-exporting facade. That needs `doctypes/index.mjs`'s helpers to move too.

**Layer 5 after T33:**
1. `entities`
2. `events`
3. `lines`
4. `local-facts`
5. `connections`
6. `observation-log`
7. `standards`
8. `progressions`
9. `money`
10. `people`
11. `bias`
12. `query-language`
13. `retrieval`
14. `calculations`

**Layer 9 after T33:**
1. `conformance`
2. `consequences`
3. `action-grammar`
4. `actions`
5. `action-clocks`
6. `filing-templates`
7. `filings`
8. `escalation`
9. `action-plans`

Every user of `local-facts` (action-clocks, filings, affordances, queue-producers, control-plane, plane) and of `standards` (conformance, filings, action-plans, affordances, control-plane, plane) still sits later. The uses of `observation-log` (record-grammar … connections) all sit earlier. No edge breaks.

## (c) P6 check

| module | size now | T33 growth | split needed | must precede |
|---|---|---|---|---|
| `docprofile` | 4,969 by sizes.tsv (path includes tests; 3,170 source) | regulation sections (1a); the OfficeRecords reader (1b); later the three court doctypes (2a) and the roster reader (2b) | Yes, at the T33 opening, by copy, as BOB's mechanical work (K617). Recommended boundary: `docprofile` keeps the pipeline, readtext, the shared helpers of `doctypes/index.mjs` and the registry seam (about 1,170 source); the seven doctypes (about 2,000 source plus tests) go to a new L1 module after it. The static imports in `doctypes/registry.mjs` become a registration wired by `plane`. Court doctypes later go to a sibling module, not into this one. | Every docprofile or doctypes entry (LAW regulation 1a, ORG reader 1b). Independent of everything else. |
| `jurisdictions` | 3,175 (path includes 1,637 test lines; 1,533 source) | about +700–1,000 with tests (R26 widening, law ranks, fiscal year, identifier schemes, the first rule set) | Not needed for T33 on a source basis. On the path basis it may reach about 4,000, so BOB re-measures after drafting. reporters-db and courts-db (1,167 reporters, 2,102 variants; COURTS 2a) must never go into `jurisdictions`; they need their own L1 data module. | Nothing in T33. |
| `standards` | 852 | to about 1,800 | No. `law-relations` is split off only near 4,000. About 2,600–3,000 even if the movable LAW and COURTS items in (d) join. | — |
| `entities` | 1,329 | about +400 (identifiers, kinds, sector); +300 more if the proceeding facet moves | No. Option B (`proceedings`) is triggered only near 4,000. | — |
| `inquiry` | 3,903 source | — | Put the standard-leg check in `inquiry-grammar`; `inquiry` changes wording only. Split `inquiry` before 2a's occurrence legs (K1447 (i)) and the hypotheses home (K1467, other list). | — |
| `queue-producers` | 3,875 | delegation only, net about 0 | Split before any new producer (2a's `temporal-expectation-due` for duty occurrences). | The 2a producer. |
| `monitoring` | 3,366 | +1 requirement | No for T33. Split before 2a's `per_meeting` and register following. | The 2a items, if they move. |
| `control-plane` | 3,735 | op wiring | Keep new ops in `op-declarations` and the modules' `xOps` arms, not in control-plane. | — |
| `publication` | 4,625 | — | Already over 4,000. Nothing may be added (constructs-2 §4.1), so K1480's edition stamp needs a publication split at the T33 opening, or the stamp lives in `docket`. | The K1480 docket entry. |
| `observation-log` | 3,216 | moved only, nothing added | No. | — |

## (d) Later-stage items: the hard reason each is not in T33, and which could move

Reason codes: DEP = a dependency not built in T33; DEPLOY = a deployment; MEAS = a measurement; P6 = a module's size before its split; Bob = a question for Bob. **MOVE?** flags an item I believe could safely enter T33.

### TIME

| stage | item | hard reason, or **MOVE?** |
|---|---|---|
| 2a | `progressions` R16 on the event's own date (K1444 (ii)) | DEP: `events` dated facts at scale and the after-read hook (EVENTS 2a, other list). MEAS: reader date accuracy on three bodies, desk research now. **MOVE?** Yes, if the EVENTS list moves dated-fact materialisation (on request it is already 1a) into T33; the measurement can be taken before opening. |
| 2a | Profile recurrences and observed meetings (OCD Event from Legistar `Events`); vendor encodings as data | DEP: Legistar following in `events` 2a (other list). MEAS: Legistar coverage by body and the zone-less `EventDate` share, desk now. The `event_changed` fan-out depth (TAD §12, R-3) is BOB's own design answer, not Bob's. **MOVE?** Conditional on EVENTS 2a moving. Recurrence expansion itself is already in T33. |
| 2a | `monitoring` `per_meeting` captures at meeting time minus the notice period | DEP: observed meetings and recurrences (row above). P6: monitoring is 3,366, so a split is needed first. |
| 2a | A body's duty as a `duties` occurrence; the queue's `temporal-expectation-due` FINDING | DEP: `duties` (see ORG O2). P6: queue-producers is 3,875. |
| 3 | `validAt` across standards and tenures | **MOVE?** Yes. `civil-time.validAt`, `lines` validity and `inForceAt` are all in T33, so this is a read with no new dependency. |
| 3 | `validAt` across relations | DEP: law relations (LAW L3; but see that row's flag). |
| 3 | Recodification across addresses | DEP: the `recodifies` law relation (LAW L3, flagged movable). |
| 3 | Memento asked for a past date (`acquisition/index.mjs:291–293`) | **MOVE?** Yes. No dependency or measurement; a small `acquisition` (L3) change. |
| 3 | Lateness pattern with its denominator | DEP: `duties` occurrences with `calculations`. |
| 3 | Cross-action lateness index over the group's own clocks | **MOVE?** Possibly (`calculations` and `civil-time` are in T33). D234: never a finding about government. |
| 3 | Timeline view (DEC-77.2); the counsel packet's chronology widened to a project | DEP: `events.timeline` (2a). The view itself is the design stream's (K1430). |
| 3 (T4) | L5: EXTRACT dated facts, FIND windows, plan-mode clock proposals | DEPLOY: extract, FIND and plan deployed. MEAS: acceptance rate, which needs a deployed copy after T33. |
| ext. | `.ics` one-off download (K1451 ruled) | **MOVE?** Yes. It needs only `civil-time` due dates with zones; a small op on `action-clocks`. |
| ext. | Dated waits on an inquiry (recheck triggers read by a scheduler consumer) | **MOVE?** Yes. It needs `civil-time` and one consumer registered by a later module (queue-producers is at P6 risk, so another registrant is needed). The study rated it nice to have. |
| ext. | `Temporal` in place of `Intl` | MEAS: Workers runtime, deployed copy, can be taken before T33. Nothing to build until then. |
| ext. | Litigation hold's device half | DEP: the device half (N521), not planned for T33, and the design-stream doors. |
| ext. | Rule sets for further jurisdictions | MEAS: one primary source per rule, desk research, ongoing. Oakland's 2027 holidays cannot be sourced until published. |
| ext. | Standing time questions | QUESTIONS L5 (K1481). DEP: `answers` saved questions (QUESTIONS list). |

### ORGANISATIONS AND OBLIGATIONS

| stage | item | hard reason, or **MOVE?** |
|---|---|---|
| 2a | O2 `duties` core | **MOVE?** Strongest candidate. The core: `DUT-` with modality, obligor (a body, or a person where a law binds them, K1453/INT C-17), source (a held standard at its version), trigger, exceptions, enforcer, `arising_in`, `reported_status[]`; occurrences derived on read; transitions recorded (K1466) by a scheduler consumer; `registerTriggerSource` filled by actions; `registerOccurrenceEvidence` filled by calculations; `powersOf`.<br>Every dependency is in T33: entities, events (dated facts on request at 1a), lines, standards, progressions, money (1b), local-facts, civil-time.<br>MEAS: reader date accuracy, desk now. The EXTRACT gold set is needed only for stage-3 proposals.<br>Conditions: money L1 in T33 (it is 1b); the queue-producers split for its FINDING (P6). Size about 60 requirements; tranche size is not a hard reason. |
| 2a | `query-language` `obligor:`/`owed_to:`; strength R12 one-issuing-source | DEP: `duties`, for the query fields only. strength R12 needs only `lines`: **MOVE? Yes.** |
| 2a | INT C-18 (independence fails on a shared person, event origin, ledger table, or an `acts_for`/`within` tie) | **MOVE?** Yes with `lines`, `events` and `money` in T33. |
| 2b | Chains as `explore` presets | DEP: `explore` (2b, other list). MEAS: M-X1, Bob's seven-hop chain on real data on the single thread, needs T33-built owners and data. Genuinely hard. |
| 2b | Declared relations walked as labelled hops (K1487) | DEP: `explore`. The R26 wording is in T33. |
| 3 | EXTRACT proposals of lines, holders and duties | DEPLOY: extract. MEAS: precision on a gold set; the set can be built at the desk now, the precision needs a deployed copy. |
| 3 | Patterns about an office with denominators (E2) | DEP: `duties` occurrences with `calculations`. |
| 4 | L5 network packs | MEAS: how many groups work on one body, and structure overlap. Both need real groups (a second group). |
| 4 | Popolo/OCDS/ORG exports | MEAS: the share of entities carrying a scheme identifier, which needs T33-built code and real use. (BOB's §6 deferral alone is not a hard reason.) |
| 4 | Disclosure of the group's own ties (E3) | DEP: member ties `MTI-` in `people` 2b (K1490, PEOPLE list). |
| any | D-224 pair materialisation for offices | MEAS (trigger): offices concerned by more than 32 documents, in a deployed copy's corpus. |

### LAW

| stage | item | hard reason, or **MOVE?** |
|---|---|---|
| 2 | Member-recorded law relations: temporal (`amends`, `repeals`, `renumbers`, `recodifies`) and referential (`refers_to`, `defines`, `excepts`, `implements`), kept apart (D192), each citing the amending or referring instrument | **MOVE?** Yes. They need instrument keys, portions and captured enactments, all in T33. Adoption of a relation that changes an in-force answer is a member act. `standards` stays under about 3,000 lines. |
| 2 | Version notices across addresses through instrument keys (X73) | **MOVE?** Yes, same as the row above. |
| 2 | Definitions and exceptions | **MOVE?** Yes, in the doctypes job. MEAS: section-boundary accuracy, desk now. |
| 2 | Citation resolver in `standards` | **MOVE?** Yes (see COURTS). |
| 2 | Watching on Legistar enactments (`MatterEnactmentNumber/Date`, `MatterStatusName`) | DEP: the Legistar reader, `events` following and the `monitoring` change. P6: monitoring. MEAS: codifier lag, desk now. Conditional on EVENTS 2a and the monitoring split. |
| 3 | `compliance_analysis` rows, the explain-a-rule reading, requirement extraction | DEPLOY: investigate. MEAS: stage-1 acceptance above BOB's bar, which needs T33's `legal_lookup` and a deployed copy. |
| 3 | Contradiction's canon proposals | Same DEPLOY and MEAS. P6: `contradiction` is 3,256 and absorbs nothing. |
| 3 | Conformance comparison split | Trigger only: a L5–L8 module must read a comparison in code. |
| 4 | Akoma Ntoso, USLM and eCFR imports | MEAS: the share of imported portions mapping onto keys, which needs T33-built keys. Whether each source serves static text is desk research now. |
| 4 | Sharing held standards between groups (K1482) | MEAS: needs real groups (a receiving group) and `case-import`'s recreate path widened. |
| 4 | Legislative watching (Open States; K1449's keyed services) | DEP: L3 enactment watching. |
| 4 | Court interpretations linked to portions | **MOVE?** See COURTS L4. |
| 4 | Standard of proof per venue | **MOVE?** Yes, trivial: jurisdictions R39 already holds it. |
| — | A record object for the work | Trigger: BOB's, when audit or publication needs it (LAW §5.3). |

### COURTS

| stage | item | hard reason, or **MOVE?** |
|---|---|---|
| 2a | C1 core | **MOVE?** Yes, conditional. The core: the proceeding facet (forum entity, `forum_kind`, `number` as an alias via a profile `proceeding` id space, `kind`, the label, the caption as alias, K1452); party and proceeding `lines` families with roles from ECF and the CPUC service list; `proceeding_kinds`/`proceeding_flows` as profile data; status as of a date via `validAt`; the `actions` `proceeding` link; machine registration from a captured caption (K1443); the citation recogniser in `id-spaces` plus its resolver in `standards` ("verified" only for a held capture that states the citation).<br>Every dependency is built in T33: lines, the standards move, the docprofile split.<br>MEAS: capture three registers whole (Alameda eCourt, a CourtListener page, a CPUC card) and their number forms; desk research now, before opening. |
| 2a | C1: reporters-db and courts-db | Need their own L1 data module (P6 for jurisdictions). Movable with that module. |
| 2a | The three court doctypes and the register row diff | MEAS: the register measurement (desk now). Movable into a sibling doctypes module. |
| 2a | Following registers (re-render on the tick; the member's act for account-gated registers, K1449) | P6: monitoring must be split first. A member switching a watch on (R-2 C-E1) is the same monitoring job. |
| 2a | A register row becoming a `filing`/`order` event | DEP: `events` following (2a; K1468). Hard unless EVENTS 2a moves. |
| 2b | C2 duties from orders, decrees, grand jury and audit recommendations (`arising_in`, `reported_status` quoted, 933.05 vocabulary) | DEP: `duties`. **MOVE?** It moves if `duties` moves (both flags together). |
| 2–3 | L4 links held as data: `interprets`/`applies`/`holds_invalid`, treatment rows, "still standing on D" | **MOVE?** Yes. Portions and `court` standards are in T33; a member records them. |
| 3 | C3 assistance (`court_reading`, `legal_lookup` layers) | DEPLOY: extract and investigate. MEAS: acceptance on a gold set and the share of citations reading "not verified", both needing a deployed copy. |
| 3 | Optional CourtListener Citation Lookup (K1449: off by default, the group's own token) | **MOVE?** With C1's recogniser; no deployment needed. |
| 4 | L5 procedural reasoning (K1474 (iv)) | DEP: COURTS L3, LAW L3, ANALYSIS L4, QUESTIONS L4 (stage-3 items not in T33). |
| 4 | Patterns across proceedings | DEP: C2 with `calculations`. |
| 4 | Outside alerts | DEP: following registers, with B15 (d) unattended paid accounts rejected. |
| — | A6 settlements as money facts concerning a proceeding | **MOVE?** With C1, because `money` L1 is in T33. |

No item above needs a decision from Bob (P17). Every item in these constructs is ruled (K1429–K1494); the remaining choices (boundaries, names, fan-out depth) are BOB's.

## (e) Measurements for stages 0–1b (plus those that gate the MOVE? items)

| measurement | construct | kind |
|---|---|---|
| 20 published worked deadline examples, each with a negative control | TIME | desk research now |
| Primary sources for the first rule set and Oakland's UNMEASURED rule and counterparties (§7 item 7) | TIME | desk research now |
| `Intl` IANA zones and `Temporal` presence on the Workers runtime | TIME | deployed copy (the existing deployed instance; can be taken before T33; not blocking, because civil-time uses `Intl` only) |
| How many typed clocks differ from the rule's computation | TIME | real group (instance data); informational, not blocking |
| Legistar seats by body and year; M-P2 `Persons`/`OfficeRecords` coverage | ORG | desk research now (unauthenticated API) |
| Budget department codes stable across two fiscal years | ORG | desk research now |
| Directories in the corpus (about 395 ± 272) | ORG | deployed copy with the corpus, or desk over the held captures |
| Offices concerned by more than 32 documents (D-224 trigger) | ORG | deployed copy with the corpus; trigger, not blocking |
| Bridge resolution rate | ORG | desk estimate now; exact figure needs T33-built code |
| Distribution of line grades | ORG | needs T33-built code (an after-build measure) |
| Captured OMC pages and ordinances and the `readingref` resolution rate | LAW | deployed copy with the corpus |
| Section-boundary accuracy on 50 OMC pages | LAW | desk research now (run today's regulation reader locally on captured pages) |
| Codifier lag against Legistar | LAW | desk research now |
| How the official code is served (static, rendered, API) | LAW | desk research now (partly known: Municode Angular shell) |
| 30 seeded law questions (resolution, acceptance) | LAW | needs T33-built code plus deployed investigate and account; acceptance, not blocking |
| `MODULE_ORDER` listener order after the re-pin | LAW | needs T33-built code (a test in the job, not a pre-measure) |
| Reader date accuracy on three bodies; Legistar coverage by body over three years and the zone-less `EventDate` share | TIME 2a / duties MOVE? | desk research now (stage-0 list, constructs-2 §5) |
| Three court registers captured whole and their number forms | COURTS C1 MOVE? | desk research now |
| How many proceedings a group would follow | COURTS | real group; informational |
| M-X1 seven-hop chain and M-P4 hub sizes | ORG L4 (`explore`) | needs T33-built code plus real data (keeps `explore` out) |
