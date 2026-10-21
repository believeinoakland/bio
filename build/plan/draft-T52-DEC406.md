# Draft T52: DEC-406, public registers and outside alerts, unassisted part

**Status** · DRAFT for BOB (N1259, K4382), written 2026-10-21 by a planning worker on `tranche/T51` (nothing committed, nothing else touched). Every statement about code is as of this checkout; every statement about an outside service (file formats, sizes, fees, rate limits, terms) is NOT verified here and is marked "measure" (M-R1 to M-R6, section 3.0).

**What I read, and what I did not.** Whole: DEC-406 (`docs/development/DECISIONS.md:6267`) with the text of U441 in the brief; Capability Ladders status paragraphs, §2 (all of it, including "Cross-cutting rulings"), §5A (all), §5C (all), §7 (7.2 to 7.6); rulings K1484, K1485, K1492, K1493, K1449, K1468, K1488 (`build/rulings.md`); `build/layers.md` (head, tables, rulings); `following.md` (whole). Not whole, stated plainly: `build/modules.json` (78 KB: I read the status paragraph's tail and the id/layer/order of all 175 modules, not every `uses` edge); the Purpose of all 175 requirement files (each cut at 900 to 1,300 characters); the Provides of `monitoring`, `calculations`, `notice-producers`, `scheduler`, `retrieval-browse`, `people`, `money`, `acquisition` only to the first 400 to 700 characters of each line, plus targeted greps; Ladders §10 (the doctrine table) not read beyond its first row. The jobs read all of these whole at START (P20); anything below that a whole reading changes is theirs to REPORT.

---

## 1. What DEC-406 requires, item by item

The unassisted part, in the alpha (DEC-406 "the design"; Ladders §5A.5 "RULED 2026-10-21"):

| # | item | words |
|---|---|---|
| I1 | Import a register whole | NetFile (Oakland), CAL-ACCESS, FEC; Form 700; Oakland's lobbyist directory; state licence files; company officers |
| I2 | Each import is a capture | with its source and date |
| I3 | Processed in the background | Ladders §5A.5: "captures processed in the background on the alarm in slices; nothing on members' reads" |
| I4 | Search | by person, organization, amount and date |
| I5 | Cite a row | as evidence |
| I6 | Watch by number | a named filer, licence or docket; "by its number, never an unattended search for a person" |
| I7 | Told once in the queue on change | |
| I8 | Outside alerts where a service offers them | CourtListener (federal dockets); "through monitoring" (U441); the rest re-checked or followed by a member's act |
| I9 | Groundwork | people L1 to L3, money L1 "as far as the unassisted part needs" |
| G1-G5 | Guardrails stand | K1484 (watch only by named request, no suspicion/score on people), K1485 (no bulk copy of home addresses or phones), K1493 (addresses and phones never published; removal with marker on the listed grounds), K1492 (lookup conduct), FEC purpose limit (11 CFR 104.15) |
| X | Out of the alpha (assisted) | plain-words asking across registers, proposed matches to subjects, proposed watches: after N1220 |

---

## 2. What exists today, and what is missing

| item | exists (module, requirement, code) | missing |
|---|---|---|
| I1 whole import | `acquisition` fetches, hashes, stores in 8 MiB parts (R10), refuses over 256 MiB `TOO_LARGE` (`acquisition/index.mjs:320`, :671); archives opened and each file filed (R38). Portal datasets are snapshotted as captures (`following` R10, `following/snapshot.mjs`). `calculations.declareTable` holds a table from a captured CSV/workbook: member act only, **20 MiB and 1,000,000 cells at most** (`calculations/tables.mjs:14-15`; `calculations/index.mjs:412`, :448); `budget-doctypes`, `roster-reader`, `court-doctypes` read tables/rosters/registers as L1 readers | Nothing reads a register file (pipe-, tab- or comma-delimited, with or without a separate header file) as rows. Nothing holds more than 1M cells. No "import" object (source, slice, pieces, state, progress). Profile holds no register at all: `systems` has Legistar, budget, assessor, permits, auditor, CourtListener, CPUC, eCourt only (`jurisdictions/profiles/oakland-alameda.mjs:165-196`); `identifier_schemes` has three Legistar schemes (:662-669) |
| I2 capture with source and date | Every capture carries address, retrieval time, hash, receipt, hop (`acquisition` R16, `provenance`) | A register import is many pieces: the import must bind its captures (one per piece/period) and state the slice and the source's own date |
| I3 background | `scheduler` consumers on the one alarm, batch-bounded, restart-safe (`scheduler` R1-R9, R21); `following` ticks claim under an epoch, 50 per tick (R13); `file-safety` batches | No resumable, sliced import job. No consumer for it. Reading pipeline: every promotion is read by `extraction` through `promotion.registerStep` (`extraction/index.mjs:521`), which would try to read a 250 MiB register capture |
| I4 search | `retrieval`/`query-language`: bundle and passage search; `retrieval-browse.findIn`: per capture/selection, a table's column is **one item, "never one item per row"** (R2, DEC-164 (3), K1468); `calculations.readTable`: pages of one table, no filter (`calculations/index.mjs:531`) | Row search by person, organization, amount, date over a register. DEC-406 amends DEC-164 (3) for registers only; searching a table's rows is not the "extraction of facts" K1468 limits |
| I5 cite a row | `content` mints a row over a capture and an extent; extent kinds `document`, `pdf-page`, `sheet-cell`, `sheet-range`, `doc-table`, `doc-para`, `slide-shape`, `image` (`content` R1, `content/extent-core.mjs`); a cell range needs the capture's reading (`content` R7, R52). `money` and `lines` take a content extent as their one source | A row of a register capture cannot be minted (no reading exists or should). `case-checker` (`program.mjs`, `spec.mjs`) re-derives passages from packaged bytes, and K1483 says relied-on documents "travel whole" |
| I6 watch by number | `following` R9 `followPersonQuery` (`following/index.mjs:421`): named identifier, scheme listed by the profile for that register, the register's own address carrying the value, refuses `PERSON_QUERY_NOT_NAMED` for a name, a cross-register query, an unlisted scheme; tick reads only that answer, follows no link; R7 `followRegister` (:379) for any public register, with `proceeding`; R8 gated/fee registers `member_act_required`, nothing fetched (:644-649); R22 end dates; R12 daily default | No filer, licence, docket or company scheme in the profile, so R9 refuses everything today. The member gives an address; nothing composes the register's address from a number. R9 is named and typed as a "person query"; a committee, a licence or a docket is not a person |
| I7 told once | `notice-producers` R13 `policy-changed-noticed`, R24 `watched-changed`, `queue-producers` R2 `source-modified`: "told once" pattern (DEC-94) and `queue` homing | **No queue item for a register follow's change** (a changed query answer, a snapshot diff, a new docket entry). `events.followedRegister` writes filing/order events (`following` R29) but nothing tells the member |
| I8 outside alerts | `acquisition.keyedFetch` R36 and `citationLookup` R37 (`acquisition/keyed.mjs:22`, :148): CourtListener host, group's own key, off by default; `credentials` R29 `KEYED_SERVICES = ["courtlistener"]` (`credentials/index.mjs:70`); `court-doctypes` reads CourtListener docket *pages* (R3-R6); `events.followedRegister` turns rows into events | No docket-alert path (API entries or webhook). R36 says a keyed fetch "runs for an in-plane caller's act ... never one a daemon uses" (K1449) so it cannot run on the alarm as written. No OpenFEC key service. No inbound webhook exists anywhere (grep) |
| I9 people L1-L3 | Built: scheme identifiers `entities.addIdentifier` (`entities/index.mjs:1032`), `entityByIdentifier` (:1132) grade A; `people.claimIdentity` (`people/index.mjs:437`, K1488 grades), `careerOf`, `credentialsOf`, `staffingAt`, member ties, interest checks (`people` R1-R26, R37-R41); `lines` carries `owns_interest_in`, `acts_for`, `credentialed_by`; expunge with tombstone (`people` R12; `record-core.expunge`, `record-core/index.mjs:1751`; `corpus-export` R9); `people` R10 refuses a machine write of address/contact (`people/index.mjs:752`, K1485 row 9) | Nothing needed beyond register schemes (profile data) and a content hook for rows. Matching a register's names to the team's subjects is the assisted part (after the alpha); the member can already link a filer id to an entity by `addIdentifier` |
| I9 money L1 | Built: `money.recordFact` (`money/index.mjs:278`), summation rule, `moneyOf`, trails; `calculations.adoptBinding`/`ingestMoney` (:1494, :1560) only from an adopted table of at most 20 MiB, at a member's request | Not needed for I1-I8 (K1468: rows are read into facts only on request). Row to money fact for a register is a later step; the row extent (I5) is the one source it will cite |
| G1 K1484 | `following` R9 (named identifier only); `people` R29 (no score/suspicion field) | Same rule for filer/licence/docket kinds; nothing in the new search may reach outside the held rows |
| G2 K1485 | `legistar-reader` drops every contact field; `people` R10 | No register reader exists, so no column policy exists |
| G3 K1493 | `lawful_demands` in the profile (`official_home_contact`, 48 h); expunge with tombstone; `case-disclosures` R24-R25 (the DR6 filter) | `peopleNamed` lists persons named by statements, subjects, lens, docket entries, timeline participants, **money-fact parties**; a cited register row's names (donor, lobbyist, licensee) are not in it. No publish-time refusal for an address/phone shape |
| G4 K1492 | Public default; `member_act_required` for gated/fee (`following` R8, R15); legible agent and pacing (`acquisition` R9, `host-governor`); keyed off by default | Registers' own terms basis; no query logging (6) for the new search |
| G5 FEC | Ladders name it (§5A.5); `people.md`/code: none | Nothing in code or requirements mentions 104.15 |

---

## 3. The entries

### 3.0 Decisions and measures that gate the entries

New modules carry product capability, so by `layers.md` ruling 5 they come to Bob (section 6, B-1). The entries below assume the recommendation (two new modules: `register-readers`, L1; `registers`, L5). Measure first, read-only, by BOB's walker before wave A (outside facts I could not verify; each can change an entry):

- **M-R1** size and format of each source's file for Oakland's use: NetFile Oakland export (and whether it is a file or a rendered page), CAL-ACCESS, FEC (delimiter, separate header file, per-cycle/per-state slices), DCA licence files, the lobbyist directory (Oakland open data?), the Form 700 listing, a company-officer source; row counts; whether any exceeds 256 MiB. Decides entry `acquisition` (conditional job) and the slice question (B-2).
- **M-R2** which columns each file has that are home address or telephone (K1485), and which are public by rule.
- **M-R3** query time on the one thread: a search over 1M, 5M rows with indexed name/org/amount/date columns in the Durable Object's SQLite (store limits) against partitions in R2 with an index.
- **M-R4** the identifier forms (filer id, FPPC id, FEC committee/candidate id, licence board+number, company number, CourtListener docket id and docket number) for `spaces` forms.
- **M-R5** CourtListener: does the API give docket-entry alerts to a free token; call limits (Ladders §7.5 quotes 5/min, 50/hour, 125/day defaults; re-measure); what RECAP covers.
- **M-R6** each source's terms, robots and fee status (K1492 (4), K1449), recorded as the register definition's `terms_basis`.

### 3.1 Entries, in module order

Model sonnet-5-5, medium effort for all unless noted (rulings-active §5). Hours are wall-clock job estimates, wide ranges, from T51's jobs of like size.

**L1**

**E1 · jurisdictions** (≈3 h) · register definitions as profile data (no place in code, `layers.md` rule 1).
- R-new: `registers`: `[{key, label, system, pieces[{key, locator template, format, delimiter, header_from?}], slice{kind,params}, columns[{name, role, keep}], row_key, filer_scheme?, use_limit?, terms_basis, gate: none|account|fee, auto_read: bool, basis}]`; `role` from a closed list (`name`, `organization`, `amount`, `date`, `filer_id`, `form`, `licence_no`, `docket_no`, `company_no`, `other`) and **`keep: false` is required for any column whose role is `home_address` or `phone`**; a definition that keeps one is `REGISTER_KEEPS_CONTACT` (K1485). No `terms_basis` is `REGISTER_NO_TERMS`.
- R-new: `systems` gains the register hosts; `identifier_schemes` gains filer, licence, docket, company-number schemes with `space`/`form` (amends R4, R52); `query_templates`: `{scheme, register, address template}` so the register's own address for a number is composed by the plane (amends R52).
- R-new: `use_limits`: `{key, citation, text}`; the FEC's carries 11 CFR 104.15 (the job reads the rule and states it; section 6 B-3).
- R-new: the test profile supplies each with values unlike Oakland's (R57's rule).

**E2 · register-readers (new, L1, pure)** (≈4 h) · reads captured register bytes into rows, as `court-doctypes` does for registers.
- R-new: `readRows(bytes|stream, definition)` yields `{row_no, key, cells}` for delimited files (comma, tab, pipe, with a separate header file), streaming, bounded memory; a row that does not fit the header is counted `undetermined`, never coerced (as `calculations` R1).
- R-new: columns with `keep: false` are dropped before any other code sees the row (the door, G2); the dropped names are returned as a count and names only.
- R-new: a reader never throws and holds no record, store or clock.

**E3 · court-doctypes** (≈2 h)
- R-new: reads CourtListener's API docket-entries JSON as a fourth reading of the same register (its R61 note says this was left for later), rows keyed as `courtlistener_docket` (R6), so `assess` and `events.followedRegister` take an alert's answer unchanged.

**L2**

**E4 · credentials** (≈1.5 h)
- R-amended R29: `KEYED_SERVICES` gains `openfec` (api.data.gov key; if M-R1 shows the bulk files need none, drop it) and, only if B-6 so rules, `opencorporates`; each off by default, set/switched/removed by an administrator only, the key never in an answer or log (as courtlistener).

**L3**

**E5 · acquisition** (≈3 h; plus conditional **E5b**, ≈5 h)
- R-amended R36 (K1449): a keyed *free* service may be read on the scheduler's alarm for a member's standing watch (the follow names the service); a fee-bearing or account-gated one never; the key is the group's own and off by default. (This reads K1449 "a group-level paid account used by the daemon is rejected" as aimed at paid accounts; B-5.)
- R-new: `keyedFetch` purposes `docket-entries` (CourtListener) and `schedule-a` (OpenFEC) with their request forms, each through the host governor and R9's agent, response size bounded.
- **E5b conditional on M-R1:** R-amended R10: a ranged, resumable streaming arm (per-piece checkpoint) for a register file over 256 MiB, parts stored under the whole-document digest (R96's pattern). If every needed file is under 256 MiB, or the source publishes the slice in pieces, E5b is not opened.

**L4**

**E6 · content** (≈3 h) · the one hook for a cited row, reusing the existing `sheet-range` extent (a delimited file's row is `{sheet: <file in the capture>, range: <row>}`), so no new extent kind and no change in `text-chain`, `case-checker/spec.mjs` kind lists or `retrieval-browse`.
- R-new: `registerRowContext(provider)`: one registration per later module (`listenerRefusal` rules): for a capture the provider says it holds as a register, it answers whether an extent lies in the capture and the row's cells and text; R7's check and R12's mint use it in place of a reading; R52 `cellsAt` answers from it.
- R-amended R7/R21: a row of a register capture carries the transcription axis "not applicable: bytes as filed", never a machine-reading grade.

**E7 · extraction** (≈1.5 h, haiku possible)
- R-amended (the `registerStep` projection, R20): a capture the plane holds as a register import is not read; the reading state is `held_as_register` (named, not an error), so no 250 MiB file enters `reading-pipeline`.

**L5**

**E8 · registers (new, L5, after `workbooks`)** (≈10 to 14 h; the long pole; P6: BOB reports at 4,000 lines, expected 2,500 to 3,500) · uses `register-readers`, `acquisition`, `capture`, `content`, `entities`, `jurisdictions`, `record-core`, `membership`, `scheduler` (by registration). Why not an existing module: `calculations` is analysis (20 MiB/1M cells, recompute at acceptance; its `declareTable` is a member act); `following` is L10 so `retrieval`-side readers cannot use it and it already holds 1,718 lines; `retrieval` searches bundles (56 KB of requirements) and DEC-164 (3) keeps a table one item; `acquisition` fetches and files, it keeps no rows.
- R-new Purpose: holds each register import, its rows and their search; imports a public register at a member's act, in the background; answers searches over held rows; cites a row; compares two imports of one register; holds no fact, score or judgment about anyone.
- R-new `importStart({register, slice, author, viewer})` (`op=registerimport`): a member's act (a machine author is refused `MACHINE_CANNOT_IMPORT`); refuses a gated or fee-bearing register `member_act_required` and fetches nothing (K1449, K1492); writes an import row `{register, slice, state, pieces[], source_date, started}` and arms the scheduler.
- R-new each piece is a capture through `acquisition` with the import as authority; the import states, per piece, capture sha, source address, retrieved-at and the source's own stated date; the import's date is the oldest piece's retrieval.
- R-new `importTick(now, budget)`: processes at most one slice (rows, time) per firing; resumable from a durable cursor; idempotent per piece digest; states `queued|fetching|reading|indexed|failed|paused` with the reason; pausable with the daemon (`monitoring` R30); a restart re-derives from its table.
- R-new rows: stored only the kept columns (E2), indexed on normalised name, organization, amount (exact decimal, currency), date (`civil-time`), filer id and form; the row's bytes position in its capture is kept so E6 can cite it; tables declared to `record-core` with `expunge: "tombstone"`, `export` per B-4.
- R-new `searchRows({import|register, name?, organization?, amount{from,to}?, date{from,to}?, filer_id?, limit, after, viewer})` (`op=registersearch`): reads held rows only; never fetches; every answer states the import(s) searched and their dates and says, when nothing matches, "not in this import (source date …)" at the levels `retrieval` uses, never "does not exist"; bounded pages; **no query text is written anywhere** (K1492 (6)): not to the observation log, not to a tally, not to an error; use counts are unattributed.
- R-new `rowOf({import, row, viewer})` answers the row's cells (kept columns), its capture sha, extent and `content_id` (E6) or null if not yet minted; `citeRow` mints through `content` at a member's act.
- R-new `compare({import_a, import_b, viewer})`: rows added, removed, changed by `row_key` and field (the `snapshotDiff` form, `following` R11); a difference is never a finding.
- R-new removals: a row removed under K1493 leaves a tombstone `{register, row_key, ground, at}`; an import or re-import never restores a tombstoned key.
- R-new FEC rows: every answer carrying a row of a register with a `use_limit` carries the limit's text; such rows are not in any list export (B-3).
- R-new refusals by key, words by key (`setup-words`), `DECLARED_OPS` (K4168), sight: an import follows the sight of the bundle it is filed in (K1489: public-document facts follow their document).

(People L1-L3 and money L1: **no job**. The groundwork the unassisted part needs exists (section 2, I9). Honest caveat: the "people (L1 to L3)" the DEC names are not a blocker in today's code; the only people-side work is register schemes (E1) and the DR6 gap (E11).)

**L6**

**E9 · citation** (≈1 h, haiku, test-only) · a register row's content id is cited as a leg (`cites` edge) and a member's `lines` interest (`owns_interest_in`, Form 700) cites a row extent; `inquiry-grammar`'s leg-extent check accepts it. If the job finds a leg check that restricts extents to kinds with a reading, it REPORTs and BOB opens `inquiry-grammar`.

**L8**

**E10 · case-disclosures** (≈3 h)
- R-amended R24 `peopleNamed`: also lists every person named in a cited register row (donor, payee, lobbyist, filer, licensee, officer), each once, so the DR6 filter (K1483) asks a recorded basis for each.
- R-new: a cited row or its words holding an address or telephone shape is refused pre-flight naming the row to the publisher only (K1493); nothing in the case's `people:` block carries one.

**E11 · corpus-export** (≈2 h)
- R-new: register rows are exported as import descriptors (register, slice, source, date, capture shas, tombstones, `corpus-export` R9) and not as rows unless B-4 rules otherwise; a register with a `use_limit` is `export: never` for row content; the export log records it.

**E12 · evidence package for a cited register row (conditional on B-4):** `case-checker` (≈4 h, the self-contained program, R13), `publication`/`public-read`/`case-grammar` (≈3 h each as the packaging touches them): the package carries the cited rows verbatim as a labelled extract with the source's digest, the import's date and the row positions; the checker verifies extract text equals the cited extent; the full capture is not shipped. Not opened until Bob rules B-4.

**L10**

**E13 · following** (≈5 h)
- R-new subject kind `register-query` and R-amended R9: `followRegisterQuery({register, scheme, value, entity?, author, viewer})` generalises `followPersonQuery` to a filer, licence, docket or company number; the address is composed from the profile's `query_templates` (E1), not typed; `followPersonQuery` stays, now a named case; a name, a cross-register query, an unlisted scheme, a pattern, or "all filers of X" is `QUERY_NOT_NAMED`, nothing written (K1484, C2 row 11); a tick follows no link out.
- R-new a follow may be answered two ways, both mechanical: **live** (R7/R9 re-read) or **against imports** (the next import's rows for that key vs the last: `registers.compare`); each change is recorded once with the follow, the instants and a count (new rows / changed rows), never what it means (R16).
- R-new alert-served follows: a follow on a federal docket with `alert: courtlistener` is served by `acquisition.keyedFetch` `docket-entries` on the tick, within the service's stated limits, off while the key is off (`member_act_required` not applicable: the key is the group's); entries enter through E3 and `events.followedRegister`. Polling, not a webhook (B-7). 
- R-amended R12/R13: a tick's batch bound counts alert polls apart so a limit reached is stated (`rate_held`), never a failure.
- R-new `registerChanges({after?, since?, limit, viewer})` (the read `notice-producers` takes, as `policyChanges` R21).

**E14 · scheduler** (≈1.5 h)
- R-new consumers `register-import` (`registers.importTick`, due/wake from `registers`) and the alert poll (inside `follow`, no new consumer if E13 keeps it there), each holding R1-R4 and R7; R9's notice re-arms an idle instance when an import is started.

**E15 · monitoring** (≈1 h, only if B-8 places alerts here; otherwise none) · U441 says "through monitoring"; the recommendation is that layer 10's `following` serves it (same host, pause and epoch, `monitoring.sweepHost`), and `monitoring` R30's pause covers the new reads. A one-line requirement in monitoring R30: the pause also stops register-import slices and alert polls.

**L11** (wave D; the first three need DEC-407's words and ops list)

**E16 · notice-producers** (≈3 h) · R-new: FINDINGs `register-changed-noticed` (one per follow change, keyed `FINDING::register-changed-noticed::<follow>::<change>`, to the follow's author and to nobody else, told once, leaves only on disposition; its detail the count and the dates, no meaning) and `register-import-done` / `register-import-failed` (to the member who started it); words by key.
**E17 · queue** (≈1.5 h) only if the item contract needs the new classes' options; otherwise none (the job decides, REPORT).
**E18 · op-grades, op-capabilities** (haiku, ≈1 h each) · the new ops' grades and capabilities; `affordances` check must stay green.
**E19 · answer-envelope** (haiku, ≈1 h) · the new modules' check tables in the family list.
**E20 · setup-words** (haiku, ≈1.5 h) · the design's words for `registers` at a named commit.
**E21 · screens-registers (new, or screens-intake/daily; see B-1/DEC-407)** (≈6 h) · the screen the design draws: start an import, its progress, search, row, cite, watch, alerts.
**E22 · plane** (≈2 h) and **control-plane** (≈2 h) · compose `registers`, route its ops, declare its stamps.
**E23 · journey-check** (≈3 h) · the walks for journeys 10, 12, 14.

---

## 4. The guardrails' tests

Each test has a control (the same call without the fault passes). All use fixtures under the test profile, not Oakland's.

| guardrail | test |
|---|---|
| K1484 watch only by named request | `followRegisterQuery`: a name, a partial number, two registers, a scheme the profile does not list for that register, or a wildcard each refuse `QUERY_NOT_NAMED` and write nothing; a tick fetches one address and follows no link; a follow cannot be created by any machine author; `registers` has no op that fetches by name (assert the ops map); a register table and answers hold no `score`, `rank`, `suspect` or `flag` field on a person (as `people` R29) |
| K1484 searchable by held fact | a search by name over held rows answers rows only; it never reaches `entities` resolution or outside the import |
| K1485 no bulk home address/phone | profile validation refuses a definition keeping a `home_address`/`phone` column; a fixture file with address and phone columns: none of the values appear in stored rows, the index, `searchRows`, `rowOf`, a minted content text, an export, a queue item, a log or an error (scan every table and the evidence store for the fixture's sentinel values); `people` R10 `CONTACT_NOT_IMPORTED` unchanged; the dropped columns are named, never valued |
| K1493 never published | `case-disclosures`: a case citing a row whose text carries an address/phone shape is refused pre-flight; `public-read` and the evidence package contain none; an expunged row leaves a tombstone, `searchRows` no longer answers it, a re-import does not restore it (tombstone by `row_key`), the export carries the tombstone and not the content; a `lawful_demands` kind (`official_home_contact`) is accepted as an expunge ground |
| K1492 lookup conduct | (1) a gated or fee-bearing register: the import and the tick answer `member_act_required`, fetch nothing, record nothing but that; (2)(3) a register definition naming a login-gated site or a paid people-search is refused at validation; (4) every fetch carries R9's agent and passes `host-governor`; a definition without `terms_basis` is refused; (6) after a battery of searches no table, observation row, tally or log contains a query string or the member's id against it (sentinel scan) |
| FEC purpose limit | every `searchRows`/`rowOf` answer for an FEC row carries the limit's text; no op or export returns FEC contributor identity as a list file; no feature solicits; `corpus-export` does not carry the rows; the definition without `use_limit` for an FEC system is refused |
| keyed off by default | with the key off or absent: no alert poll fetches (assert zero requests); the key appears in no answer, receipt, log or error (as `acquisition` R36's sentinel test); a free key read by the alarm only for a named watch |
| told once | one change yields one item; it is not raised again until disposed and changed again; a watch ended (`ends`) raises none; a hidden-project follow's item reaches only its members |
| background | an import survives a restart between slices and ends with the same rows as an uninterrupted one (digest of the row table); a paused daemon runs no slice; the slice bound stated and respected on a fixture of 1M rows |

---

## 5. Dependencies on DEC-407's screen and the design stream's words

- DEC-407 is the next DEC; the screen `registers` is not drawn yet (Ladders status; `docs/development/ux-substrate/screens/page.src.html:588` gives only the gap text). Backend waves A to C do not need it **except the words**: the sweep clause (T51 rule 6) forbids member-facing English in a module, so `registers`' refusals, states and queue items need `words.json` keys from the design before wave B starts, or the job REPORTs each sentence.
- From the design before wave B: the list of ops and reads the screen calls (import start/status, search, row, cite, compare, watch set/list/end, alert on/off), the words for import states and refusals, the "no match" wording at the absence level, and where the FEC limit text and the "reduced capture" label appear.
- The screen job (E21) and `setup-words` (E20) wait for DEC-407. Record in K-line: "the screens when DEC-407 lands" (N1259 already says so).
- The name: U441 says "docket"; the product says "proceeding" and "register" (Ladders §7.1, B20). Words are the design's.

---

## 6. Open questions

### Bob's (P17: values, legal exposure, money, how real groups behave, architecture)

Each with options and a recommendation, to be put in plain words by BOB.

- **B-1 Two new modules (architecture, `layers.md` ruling 5).** A: `register-readers` (L1, pure) and `registers` (L5). B: one module `registers` with the reader inside, split by copy later if P6 requires. C: put the work in `calculations`/`following` (rejected: section 3.1 E8 gives the reasons). Recommend A: the reader is pure and testable in wave A, `registers` is the long pole and A shortens it; B is acceptable at the cost of one longer job. Also whether the screen is its own module `screens-registers` or part of `screens-intake` (the design decides with DEC-407).
- **B-2 What "whole" means (a requirement).** FEC and CAL-ACCESS are national/state sizes; whole files may exceed what an instance can hold and search. Options: A, whole as the source publishes it, however large (cost and time measured by M-R1/M-R3); B, whole as the source itself slices it (FEC by cycle and state; CAL-ACCESS as published) with the import stating its slice; C, only the part concerning the team's place. Recommend B. Money: the storage cost per register is a Cloudflare cost to the group; BOB reports it after M-R1/M-R3.
- **B-3 FEC purpose limit (legal exposure).** 11 CFR 104.15 (and 52 U.S.C. 30111(a)(4), which I recall but have not verified here) bars using contributor information for soliciting contributions or for commercial purposes. The product guard is: no list export of FEC contributor identity, a notice on every FEC row, no feature that solicits. Does Bob accept that guard, and is publishing a case that names an FEC donor within the rule? Recommend: accept the guard and have counsel confirm the publishing question before the beta; BOB reads the rule itself before the requirement is written.
- **B-4 Citing a row versus K1483 "relied-on documents travel whole".** A published case citing a register row cannot ship a register of hundreds of MiB. Options: A, ship the cited rows as a labelled extract with the source digest and import date, the checker verifying the extract against the cited extent; B, ship the whole capture (not feasible for large files, and it would carry whatever the capture holds, see B-5); C, no publication of register rows in the alpha (members cite them in inquiries only). Recommend A. Also whether register rows are in the group's corpus export (recommend: descriptors and tombstones only; rows are re-importable from the public source).
- **B-5 K1485 versus "each import a capture" (a conflict between two rulings).** A capture is the file as served (acquisition R26); the served file holds home addresses and telephones. Options: A, keep the whole file as served, sealed (never opened, listed, searched, exported or published), searchable rows without the columns; B, store only the reduced file as the capture, recording the original's digest (hashed as it streams), the dropped column names and "reduced under K1485" in the hop, the original re-fetchable from the source or the archive; C, ask each source for a file without them. Recommend B: it keeps Bob's words ("imports never bulk-copy") and removes the dossier-under-seizure exposure the Ladders name (§5A.5 risks, DR13); cost: the capture is a labelled reduction, not the primary evidence, and its grade says so (BOB sets the grade by the existing derivation rule).
- **B-6 Company officers and any fee-bearing source (money).** If the only machine-readable officer source is paid or credentialed, K1449 allows it only as a member's act with their own credential, price shown first, never unattended. Does Bob want company officers in the alpha on those terms, or only if a free source passes M-R1/M-R6? Recommend: include only a free source; otherwise defer that register and say so.
- **B-7 What a real group wants told, and how often (how groups behave; UX).** "Told once on change": one item per change batch (a count of new rows since the last look), or one per row? Recommend one per follow per refresh, with the count, so a busy filer cannot flood the queue; a member may end the watch (`ends`) as R22 provides. And whether docket alerts should be polled (recommended: no new inbound surface, within CourtListener's limits, so tens of dockets, not hundreds) or pushed by webhook (a new authenticated inbound door, later).

### BOB's (decided and reported, not asked)

- Following serves the alerts and watches (layer 10, `following` beside `monitoring.sweepHost`), `monitoring` only gets the pause line; "through monitoring" in U441 read as the Operations layer.
- Reading K1449 as not barring a **free** keyed service read by the alarm for a member's standing watch (E5). If BOB reads it more narrowly it comes to Bob.
- Registers reuse `sheet-range` extents and a registered context hook (E6) rather than a new extent kind; a row's key is its position plus the definition's `row_key`.
- Where rows live (Durable Object SQLite or R2 partitions plus index) after M-R3; slice size, rows per firing; whether NetFile counts as "the government's own site" for K1492 (1) (recommend yes: the City's public record on its vendor's portal; its `terms_basis` states it).
- Search is within the held import only; a name search never creates an entity or a link (matching to subjects is the assisted part).
- A re-import is a new import; two imports of one register are compared by `row_key`; old imports are kept (every version seen is kept, as K1727 for policies).
- Wave plan, model and effort per job, the order of merges, the suite run per wave (below).

---

## 7. Size

| | jobs | layers | job-hours |
|---|---|---|---|
| unconditional | E1-E4, E5, E6, E7, E8, E9, E10, E11, E13, E14, E16, E18-E20, E22, E23 = about 22 (incl. 2 new modules), plus the screen E21 = 23 | L1 (3), L2 (1), L3 (1), L4 (2), L5 (1), L6 (1), L8 (2), L10 (2), L11 (≈10) | about 70 to 90 |
| conditional | E5b (M-R1), E12 (B-4: up to 4), E15, E17 | L3, L8, L10, L11 | +8 to +20 |
| total | **about 23 to 30 jobs** | 8 of 11 layers | **about 80 to 110** |

Compared with fix round 3 of T51 (28 jobs, waves of 20 and 8, about 4 hours wall clock per wave, so about 8 hours of jobs): similar **number** of jobs and job-hours, but not the same shape. Fix round 3 had two flat waves of independent modules; DEC-406 is a chain (L1 to L4 providers, then `registers`, then L8/L10 users, then L11), because a job reads the merged code of what it uses.

- Wave A (L1-L4: E1-E7, 7 jobs, 3 to 4 h) → merge, suite.
- Wave B (E8 `registers`, 1 job, 10 to 14 h: the long pole; nothing else in L5 depends on it) → merge, suite.
- Wave C (E9, E10, E11, E13, E14, + conditional E12/E15: 5 to 9 jobs, about 5 h) → merge, suite.
- Wave D (L11: E16-E23, about 9 jobs, 4 to 6 h, the screen after DEC-407) → merge, suite.
- Wall clock: about 25 to 30 hours of job time end to end, three to four working days with BOB's reviews and the suite between waves (fix round 3 was about one). Add the measure-first half day (M-R1 to M-R6) before wave A, and the hold if Bob's B-1/B-4/B-5 rulings come late (waves A and B wait on B-1 and B-5 only; wave C's E12 on B-4).
- Effect on the alpha date, for BOB to tell Bob: **about three to four working days added to T52**, plus the screen when DEC-407 lands; the uncertainty is the long pole (`registers`) and M-R1 (a file over 256 MiB adds E5b, about a day); nothing here touches T51 (K4269).
- P6: `registers` is the module BOB reports if it nears 4,000 lines; a split by copy of the reader out of it is the pre-agreed relief (B-1 option A already has it split).
