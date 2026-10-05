# Entries B: PEOPLE, EVENTS, MONEY and CONNECTIONS for T33

*Read-only research for BOB #113, 2026-10-05, on `tranche/T32`. Sources read whole: ladders §1–§3, §5A, §5B, §5C and §10; `constructs-2.md` (origin/study/constructs), all of it; rulings K1429–K1495; `modules.json`; `sizes.tsv`; and the requirements cited below, read in part. Rulings take precedence over the syntheses. In this file, "entries-A" means the parallel worker's entries (civil-time, calc-grammar, lines base, standards/local-facts/observation-log moves, calculations, answers, duties). An entry that depends on one of them names it.*

Format: `id · module · L · kind · stage · what · est. reqs · uses (new edges) · depends on · measure-first`.

## (a) Entries for stages 0, 1a and 1b

### Stage 0

- B0.1 · record-grammar · L1 · extended · 0 · Adds one id table `ID_TABLE` (prefix → {type, form: sequential | opaque}) that every validator imports. Counters become `\d{4,}`. Opaque `[a-z0-9]` tails (≥10^7 ids a year) for EVT-, LIN-, MNY-, PFA-, IDC-. MTI-, CHK-, MSR-, HYP-, DUT- and CALC- are also reserved now, so that no later tranche needs another record-grammar job (P8). ENT- stays sequential and is widened. Adds `isHypothesisId` for K1467's store-side refusals. R1 (`BUNDLE_ID_RE`) and R3 change. The 10,000th id of every prefix is accepted and existing ids stay valid (constructs-2 §4.3; ladders §10 "One id grammar") · est 6–8 · uses: — · depends: none · measure-first: none
- B0.2 · signatures · L1 · extended · 0 · `sshsig.mjs:357` reads ID_TABLE · est 1 · uses: record-grammar (new; signatures uses nothing today) · depends: B0.1 · none
- B0.3 · inquiry-grammar · L6 · extended · 0 · `grammar.mjs:45` reads ID_TABLE · est 1 · uses: — · depends: B0.1 · none
- B0.4 · connections · L5 · extended · 0 · `checks.mjs:206,210` read ID_TABLE (same job as B1a.6) · est 1 · — · B0.1 · none
- B0.5 · observation-log · L5 · extended · 0 · `checks.mjs:208` (same job as entries-A's move) · est 1 · — · B0.1 · none
- B0.6 · bias · L5 · extended · 0 · `checks.mjs:13` · est 1 · — · B0.1 · none
- B0.7 · case-grammar · L8 · extended · 0 · `reference.mjs:20` · est 1 · — · B0.1 · none
- B0.8 · action-grammar · L9 · extended · 0 · `checks.mjs:43` · est 1 · — · B0.1 · none
- B0.9 · actions · L9 · extended · 0 · `index.mjs:75` (same job as B1a.15) · est 1 · — · B0.1 · none
- B0.10 · monitoring · L10 · extended · 0 · `checks.mjs:131` · est 1 · — · B0.1 · none
- B0.11 · tasks · L11 · extended · 0 · `checks.mjs:80` · est 1 · — · B0.1 · none
- B0.12 · record-core · L2 · extended · 0 · `allocId` is widened (`\d{4,}`, plus an opaque allocator per ID_TABLE), and the three ENT- checkers (`index.mjs:392–402`) accept the 10,000th. The table declaration (R21 and R46 change) gains purge, expunge, export (`yes` / `admin-only` / `never`) and sight classes, a re-derivation rule (`stored` / `derived-rebuildable`) and a version chain. Adds one derived-cache convention (a declared rebuild, a rebuild-and-byte-compare test helper, fail-closed reads when stale) for when_cache, bound_cache, the identity cluster and CHK results. Adds a store-gate hook for the one-home checks (constructs-2 §4.2 (g), (i); TAD §10.2, §10.8, §10.11) · est 8–10 · uses: — · depends: B0.1 · none
- B0.13 · corpus-export · L8 · extended · 0 · Exports every declared table, paged, with a sha per page. It honours the export class: member ties and the source↔person link are never routine exports. A rebuildable cache travels as its rule, not its rows. The entities tables are exported, which they are not today (`index.mjs:73–112`; DR3, DEC-112) · est 4–6 · uses: — · depends: B0.12 · none

### Stage 1a

- B1a.1 · connection-grammar · L1 (after calc-grammar) · new · 1a · Ladders §2 CONNECTIONS and constructs-2 §4.4.
  - The shape `{id, from, to, kind, owner, valid{precision, zone}, evidence, grade{assertion, ends}, derived}`.
  - The kind-registry form: owner, kind, the members' word (K1486), and a class (evidentiary / derived / declared / hunch).
  - An owner registry `registerOwner({owner, kinds, neighbours})` (see (b)).
  - The bounds: depth 8 by default and at most 10, fan-out 1,000, 5,000 nodes, and a time-budget parameter.
  - The walk semantics: the weakest hop governs, every result is as of a date, results are ordered by hop count then date and may be sorted by a stated quantity, and an exhausted walk answers `truncated` + `undetermined`, never a partial path shown as complete. A chain with a declared or hunch hop is labelled a "lead" (K1487).
  - Derived ids `sha(kind, from, to, as_of, method)`, the hub-marker contract, and an exported owner-conformance test battery.
  - est 15–20 · uses: record-grammar, civil-time · depends: B0.1, civil-time (entries-A) · measure-first: none
- B1a.2 · events · L5 (directly after entities) · new · 1a · §5B.4 L1.
  - Dated facts `{capture, extent, kind, value, method, grade}` with closed kinds.
  - `EVT-` with closed kinds and schema.org statuses.
  - `when_cache`, rebuilt in the same transaction and read fail-closed.
  - Participants `{entity, role, attestation}`, with decider, author, implementer and signatory among the roles (K1465), never filled from `holderAt`, and no payer or payee.
  - Attestations cite the dated fact (R-3 H-1).
  - `onWhenChanged(module, fn)` in the same transaction, using membership's R81/R83 listener pattern.
  - Dated facts are materialised by a member's act or through the after-read hook, opt-in per capture class (K1468).
  - The ACT- alias table and `eventForAct`.
  - A re-resolved participant is corrected forward with notice.
  - `neighbours` (took part, concerns, within) and the index `event_participants(entity)`.
  - Table declarations: sight follows the attesting capture (C6, K1489).
  - Store checks: each cache equals its rebuild; no amount field.
  - est 15–18 · uses: record-grammar, jurisdictions, civil-time, connection-grammar, record-core, membership, promotion, provenance, extraction, content, entities · depends: B0.1, B0.12, B1a.1, B1a.3, B1a.4, civil-time · measure-first: M-V1 reader date accuracy on three bodies (desk); M-V2 Legistar coverage by body over three years and the share of zone-less `EventDate` rows (desk); M-V3 a 50-event gold set (desk)
- B1a.3 · entities · L5 · extended · 1a · Scheme identifiers `{scheme, id, valid?, basis}` resolving at grade A, with the schemes as profile data via id-spaces (ladders §2 PEOPLE). R1's ENT- width. `sector` for organisations (K1453). Kinds `program`, `place` and `proceeding` (K1441; entries-A's share, same job under P8). R26 reworded per K1487: a declared relation is an `explore` hop marked "declared, not evidenced", still never resolving a reference or carrying a grade. `neighbours` for declared relations. Table declarations: the registry is group-wide (C6) · est 8–10 · uses: connection-grammar, civil-time · depends: B0.1, B0.12, B1a.1, B1b.3 (if the schemes need new forms; otherwise none) · none
- B1a.4 · reading-pipeline · L4 · extended · 1a · Adds an opt-in after-read hook `onRead(module, fn, {captureClasses})`. It runs after commit, in MODULE_ORDER, and refuses through `listenerRefusal`; none exists today (R-3 I-7). Its cost is measured before it may join the promote transaction (D177) · est 3–4 · uses: — · depends: none · measure-first: M-V4 the cost of writing dated facts (needs T33-built code; it gates only a later move into the transaction)
- B1a.5 · lines (the people share; the base is entries-A's) · L5 · new · 1a · `holds` with `capacity` (13 values) replaces `status`. `seat_on` is office→body only. `holderAt` counts only a `holds` to an office (R-1 P-E6). A bound may be `{event, edge}`, held in a `bound_cache` that `events.onWhenChanged` moves. Both ends indexed: `(from, kind, bound_cache)` and `(to, kind, bound_cache)`. `neighbours`. Legistar seat and holder rows are machine-attributed (K1443 as extended). **Recommended now (P8):** the whole closed list of people kinds (`belongs_to`, `educated_at`, `credentialed_by`, `owns_interest_in`, `acts_for`, `related_to`, `associate_of`), since lines has one job in T33 · est 6–8 (10–12 with every kind) · uses: entities, events, civil-time, connection-grammar · depends: lines base, B1a.1, B1a.2, B1a.3 · none
- B1a.6 · connections · L5 · extended · 1a · `neighbours` presents co-mention as the derived kind "mentioned together", with its derivation and a deterministic id. A capped read (R2) answers `truncated`, and an entity concerned by more than 32 documents is named a hub (X110) · est 2–4 · uses: connection-grammar · depends: B1a.1, B0.4 · none
- B1a.7 · standards (the neighbours share; the move is entries-A's) · L5 · moved · 1a · The law-relations kind and the derived kind "in force at an event's date"; `period_basis` may name an enactment event · est 2–3 · uses: events, connection-grammar · depends: B1a.1, B1a.2 · none. *Needed only if explore is in T33.*
- B1a.8 · progressions (the neighbours share) · L5 · extended · 1a · The kind "placed on a declared flow" · est 1–2 · uses: connection-grammar · depends: B1a.1 · none. *Needed only if explore is in T33.*
- B1a.9 · case-disclosures · L8 · extended · 1a · The Design Requirement 6 filter per K1483 (C1). It enumerates every person a case names: authored statements, subjects, the published bias lens, docket entries, timeline participants and money parties. Each needs a recorded basis: a documented act or position (the `holds` line valid at the act's date plus the event, both cited), a tie, an interest, consent, prior publication, or "a private party". An unrecorded basis refuses pre-flight, naming the person to the publisher only (a new C-120.x row). Addresses and phone numbers are never published (K1493). Relied-on materials travel whole (DEC-100 (2)). **Could add now (P8):** the C7 pre-flight attestation of no undeclared tie, vendors named in the money included (K1490) · est 8–12 · uses: entities, events, lines, money, people (new) · depends: B1a.2, B1a.5, B1b.1, B1b.2 (money parties and identity, if 1b is in T33) · none
- B1a.10 · conformance · L9 · extended · 1a · `determine` takes `act: {event: EVT-}`, and ACT- ids become aliases of events (constructs-2 §7). The act terms of R1 and line 18 change: the `{role, body}` "never by a person" actor is retired for the record (C2 row 6, K1485), the act's participants carry deciders and signers, and the determination still judges the office's duty · est 4–6 · uses: events · depends: B1a.2 · none
- B1a.11 · reevaluation · L7 · extended · 1a · `event_changed` gains "participant re-resolved" and "when moved", noticed to dependants (R-1 V-O). It needs BOB's answer to TAD §12's dependency-depth question before drafting · est 2–3 · uses: events · depends: B1a.2 · none
- B1a.12 · membership · L2 · extended · 1a · `MODULE_ORDER` (R83) re-pinned for every new and moved module, with the listener-order test · est 1 · — · depends: the modules.json edit · none
- B1a.13 · hypotheses (recommended new module, L6 directly after inquiry; or `inquiry` extended if BOB keeps K1470's home) · new · 1a (constructs-2 §4.2 (h) gives it no stage).
  - HYP- rows of kinds cause, identity, relation, flow and other, labelled and held by members, with their project's sight (a hidden project fenced, C6).
  - `registerConnectionOwner` into explore: hunch hops are scoped to the working inquiry and the chain is labelled a lead (K1487).
  - The store-side check (K1467, narrowed by K1487) refuses HYP- in a leg (inquiry R4 already admits only information or inquiry ids; add the test), a total, a check or an absence level, through `isHypothesisId`. A leg may not cite a derived connection id whose chain carries a declared or hunch hop.
  - est 6–8 · uses: inquiry, explore (new) · depends: B0.1, B2b.1 (for registration) · none
- B1a.14 · actions · L9 · extended · 1a · R9 narrowed (C2 row 5, K1484): the action is addressed to an office by role and body, may show the holder on the date through `lines.holderAt`, and is never addressed to a person. **Could add now (P8):** `registerEventSource`, the "what we did" lane (2a) · est 2–3 (+2) · uses: lines, events (new) · depends: B1a.5, B1a.2 · none
- B1a.15 · affordances · L11 · extended · 1a/1b · Publishes the new closed vocabularies: dated-fact and event kinds, statuses and roles; line kinds and capacity; money kind, phase, stage and basis; connection kinds with the members' words (K1486); identity-claim kinds · est 2–3 · uses: events, lines, money, people, connection-grammar · depends: B1a.2, B1a.5, B1b.1, B1b.2 · none
- B1a.16 · op-declarations, control-plane, plane · L11 · extended · 1a/1b · Declares, stamps and routes the new op families (events, money, people, explore, hypotheses), each with one append site stamped by the control plane (constructs-2 §7) · est 2–4 each · uses: the new modules · depends: their entries · none. control-plane is 3,735 lines; see (c).

### Stage 1b

- B1b.1 · people · L5 (after duties' place, before explore) · new · 1b · §5A.4 L1 and L2 positions.
  - Identity claims `IDC-` (`same_as`, `not_same_as`, `unsure`), graded per K1488: A for an identifier at both ends; B for a name with a cited fact valid at both documents' dates; C for a name alone; D for a member's word. They link and never merge.
  - The derived identity cluster: rebuilt and compared, read fail-closed, and undetermined when a `not_same_as` sits inside it (R-3 S-3).
  - Person facts `PFA-` (dated names, birth, death, locality; address and contact as stated, export class `never` or `admin-only`, never published, K1493).
  - Reads `personAt`, `careerOf` (positions) and `identityOf`. `holderAt` stays in lines (one home).
  - "Same person?" candidates explained field by field, with no probability (D167).
  - Sight per C6: the registry is group-wide; IDC rows inside a hidden project are fenced and uncounted.
  - `neighbours` presents identity claims as explicit hops.
  - Not `duties` at 1b.
  - est 25–30 · uses: record-grammar, civil-time, connection-grammar, record-core, membership, promotion, provenance, content, sources, entities, events, lines, money · depends: B0.1, B0.12, B1a.1–B1a.5, B1b.2 · measure-first: M-P1 people and turnover in ten payroll years (desk); M-P2 Legistar `Persons`/`OfficeRecords` coverage (desk); the A–D resolution shares (desk, on the study corpus with today's resolver); M-P5 the person-page read time at 50,000 lines (needs T33-built code: a synthetic test in the job); M-P6 the false-merge rate on a synthetic fixture, gate set first (needs T33-built code: in the job)
- B1b.2 · money · L5 (after progressions) · new · 1b · §5C.4 L1.
  - The full `MNY-` row: exact decimal with `as_read`, sign, precision, kind, phase or stage, basis, `period` (precision and zone), parties `from`/`to` `{entity, fund, account, as_written}`, classification codes, `balance_class` by fund-type family, `buys`, `concerns` (never a duty), a two-axis grade.
  - The summation-rule refusals by name, and the interfund flag.
  - `source` is exactly one content extent or MNY-, never a `CALC-`, as a store check.
  - No "ours" mark (K1463).
  - One op family and one append site. Projections from a capture's reading ride `promotion.registerStep`.
  - `neighbours` presents a fact as a payer→payee edge with its fund, period and stage, indexed `(party, period)`, `(fund, period)` and `(concerns)`.
  - Table declarations.
  - Size this to split off `money-checks` at creation if L2–L3 move in; see (c).
  - est 35–40 · uses: record-grammar, civil-time, calc-grammar, connection-grammar, record-core, membership, promotion, provenance, content, extraction, entities, events, lines, standards, progressions · depends: B0.1, B0.12, B1a.1, B1a.2, B1a.5, calc-grammar exact decimals (entries-A), the standards move · measure-first: M-M1 the figure parser's exactness on 200 ACFR and budget figures (the fixture is assembled by desk research; the run needs T33-built code, in the job); M-M2 the money-table census (desk); stage 0's money items (see (e))
- B1b.3 · id-spaces · L1 · extended · 1b · Spaces `account`, `object`, `vendor`; forms for person schemes (Legistar `PersonId`, filer id, licence number, bar number) · est 3–4 · — · depends: none · none
- B1b.4 · jurisdictions · L1 · extended · 1b · Profile data: fiscal-year keys, classification schemes, identifier schemes per site, and the fictional test profile's equivalents (D196) · est 2–4 · — · none · none
- B1b.5 · calculations (the money share; the module is entries-A's) · L5 · new · 1b · The money ingest writer: machine-attributed facts from a table binding a member adopted, with identifiers at both ends (K1443 extended, K1468), calling money's op down the order. Money roles on table columns · est 3–5 · uses: money · depends: B1b.2 · none
- B1b.6 · consequences · L9 · extended · 1b · Figures become money-fact operands: exact decimals through calc-grammar, the currency sign kept, `%` (replacing the doubles of `figures.mjs`) · est 3–5 · uses: money, calc-grammar · depends: B1b.2 · none
- B1b.7 · query-language · L5 · extended · 1b · Adds fields through R26 joins, extending R3 (FIELDS): `person:`, `holder:` and `post:`; money fields `kind:`, `phase:`, `stage:`, `basis:`, `period:`, `fund:` and `party:`; and `event:`. **Add now (P8; 2a otherwise):** `occurred:` · est 5–7 · uses: lines, events, money, people · depends: B1a.2, B1a.5, B1b.1, B1b.2 · none
- B1b.8 · instance-setup · L11 · extended · 1b · Legistar `Persons`/`OfficeRecords` seed seats and holders at setup, keyless and machine-attributed (K1443 extended) · est 3–4 · uses: lines, entities · depends: B1a.5 · measure-first: M-P2 (desk)

## (b) Layer 5 after T33, and explore in T33

**The order, with 1a and 1b both in T33:** entities → events → lines → local-facts → connections → observation-log → standards → progressions → money → [duties: present only if entries-A puts it in T33; otherwise absent, its place reserved here] → people → explore (if built in T33) → bias → query-language → retrieval → calculations.
- Layer 1 inserts jurisdictions → civil-time → calc-grammar → connection-grammar.
- Layer 6 gains `hypotheses` directly after inquiry (if BOB takes B1a.13's split), and `answers` after skills.
- people at 1b uses no duties, so duties can be inserted later without breaking an edge.
- All L5 jobs run concurrently (P10). They merge in this order: events → lines → money → people → explore. A downstream job codes against the approved requirements and tests after its upstream merges. That serial chain is a schedule risk, not a hard reason.

**Can explore be built in T33?** Yes. No hard reason prevents it.
- *Owners that would exist in T33:* lines, events (participants, concerns, within), money, people (identity claims), connections (co-mention), standards (law relations, in force), progressions, entities' declared relations (K1487), contradiction and hypotheses (both L6, by `registerConnectionOwner`).
- *Owners that cannot register in explore:* "added later by registration" holds only for owners *after* explore in the order. duties sits *before* explore, so it cannot call explore's registry (P4). The honest options:
  - (i) explore imports duties' `neighbours`, which means an explore job in the tranche that builds duties.
  - (ii) The owner registry lives in connection-grammar (L1). Every owner, at any layer, registers into it, and explore walks the registry. When duties arrives, explore needs no job; the owner-conformance battery runs in each owner's own job.
  - Recommend (ii); it is BOB's technical call (P17).
- *Presets:* the presets are kind sets (`lines.chain` and the others), so a 2b kind (`authorises`, `acts_for`, `MSR-` attribution) appears in them when its owner registers it.
- *M-X1 (Bob's seven-hop chain):* donor −contribution→ committee −`acts_for`→ councilmember −`voted`→ vote −`authorises`→ award −`concerns`→ contract −attributed payments→ vendor, with the payer fund as the seventh hop. On real data it needs:
  - kinds T33 would not hold unless 2b items move in: `acts_for`, `authorises` and `MSR-` attribution;
  - a populated record: Form 460 contributions, Legistar votes and attributed payments.
  - So the real-data run **needs a deployed copy with a real group's data**.
- *What can be measured instead:* the purpose of M-X1 is the node count and time on one thread against the 30 s CPU and 100-parameter limits. That is a **synthetic-fixture performance test in the explore job, which needs T33-built code.** It uses a generator at real volumes (10,000–60,000 lines, about 32,000 events a year, hubs such as a 5,000-employee employer and a city-wide fund) and fixture owners for the kinds not yet built. It asserts that the 5,000-node exploration finishes within the stated budget, with batched `IN` lists of at most 100 parameters, and otherwise returns `truncated` + `undetermined`.
- *Why the read is still safe:* the budget and the cap make the read safe whatever the real-data result, which only tunes the budget constant. The ladders' "measured on real data before the stage that ships it" (constructs-2 §4.4) is BOB's own gate (K1470). Reading it as satisfied by the synthetic run for the T33 substrate, with the real run re-measured after the first populated deploy, is BOB's to rule; it is not Bob's.

## (c) P6 check (sizes from sizes.tsv; additions estimated)

| module | today | after the T33 entries | P6 |
|---|---|---|---|
| connection-grammar | new | 400–700 | ok |
| events | new | 1a about 1,300–1,600; about 2,400–2,900 if 2a and 2b move in | ok |
| lines | new | 1,800–2,300 | ok |
| money | new | L1 1,300–1,600; L1–L3 2,600–3,100 | ok; split `money-checks` at creation if L2–L3 move in |
| people | new | 1b 900–1,200; L1–L3 1,800–2,300 | ok |
| explore | new | 1,200–1,800 | ok |
| entities | 1,329 | about 1,600 | ok |
| record-grammar | 2,316 | about 2,450 | ok |
| record-core | 1,733 | about 2,050 | ok |
| corpus-export | 361 | about 550 | ok |
| case-disclosures | 1,306 | about 1,700 | ok |
| conformance | 1,542 | about 1,650 | ok |
| reading-pipeline | 1,329 | about 1,400 | ok |
| reevaluation | 3,042 | about 3,150 | ok, near the limit |
| query-language | 2,737 | about 2,900 | ok |
| connections | 2,687 | about 2,800 | ok |
| membership | 3,350 | about 3,370 | ok, near the limit |
| actions | 2,886 | about 3,050 | ok |
| consequences | 1,109 | about 1,200 | ok |
| id-spaces | 417 | about 500 | ok |
| jurisdictions | 3,175 | about 3,300 | ok, near the limit |
| instance-setup | 3,005 | about 3,150 | ok |
| affordances | 3,365 | about 3,450 | ok, near the limit |
| control-plane | 3,735 | about 3,850 | at the edge; P6 split before more growth |
| inquiry | 3,903 | +400 for hypotheses would be over 4,000 | **fails** → separate `hypotheses` module (B1a.13), about 500–700 |
| docprofile | 4,969 | already over | **fails**: nothing is added before its split (staff-directory row 12; the roster reader) |
| publication | 4,625 | already over | **fails**: nothing is added. Its share of the "what we did" lane is carried through `docket`'s entries, which record every publication act |
| agent-worker | 16,643 | its split is entries-A's | — |

## (d) Later items (stages 2a, 2b, 3, 4): hard reason, or could move

No question remains Bob's: C1–C11 and B16–B22 are ruled (K1478–K1494). DEC-6's residual (C2 row 21) stays Bob's on its own trigger and gates none of these items. The requirements of new product modules still go to Bob for approval, as every T33 entry does.

Each item names its hard reason. "Could move" means no hard reason exists.

**EVENTS**
- 2a `timeline`, `sequence` (three-valued) and the two lanes: **could move.** civil-time is 1a. The events job is in T33, and P8 favours one events job.
- 2a `registerEventSource` filled by actions, docket and escalation: **could move**, in their T33 jobs. Publication is P6; carry it through docket.
- 2a Legistar following (machine-written events, participants and votes for a followed body), and agenda and minutes posting times as `publication` events: measurement M-V2, **desk research before T33 opens**. The live acquisition needs **a deployed copy** (N540's pattern). **Could move** if the reader is built and tested against captured Legistar JSON.
- 2a progressions R16 on the event's own date, and the out-of-order shape: **could move** (K1444 (ii) ruled; events in T33).
- 2a duty occurrences matched to events, with transitions recorded: needs `duties` (dependency). **Could move if entries-A puts duties in T33.**
- 2a `filings`' chronology as a timeline read; contradiction on documents' own dates: **could move.**
- 2a `occurred:`: **could move**; put it in B1b.7 (P8).
- 2b relations (`authorises`, `answers`, `amends`, `reverses`, `stated_cause`; `within` replacing `part_of`): **could move**, inside the events job. It depends on nothing not built.
- 2b the conformance act in full, and docket's own dates: **could move**, in their T33 jobs.
- 2b relation kinds walked in explore: **could move** with B2b.1.
- 3 `whoWasSent`, statements in order: **could move.** These are reads over 1a participants.
- 3 edit acts from office metadata: **could move** (office-readers, 3,524 lines, has room).
- 3 sequence-anomaly and lateness patterns as calculations, raised as "Noticed":
  - The build **could move**.
  - Showing them is gated by the false-alarm rate (K1491), which **needs T33-built code** and a gold set (desk).
  - The decade scan **needs T33-built code** plus Legistar data (desk fetch).
- 3 the published Timeline (C11): publication is **P6** (4,625 lines). **Could move** if BOB places it in case-grammar or case-authoring. It needs the timeline (2a, could move).
- 3 EXTRACT proposals of events: **a deployed copy** (the assistant on an account) plus gold-set measurement (extents strict, roles soft).
- 3 "what happened between X and Y" as an `answers` rule service: answers is built in T33 (entries-A), so dependency is not the reason. The reason is **a deployed copy** for QUESTIONS' own measure-first.
- 4 OCD and Open States imports; standing watches (B21): **a deployed copy** (live acquisition, the assistant's runs). The ladders also require L1–L4 in use, which needs **a real group**.
- 4 FtM `Event` and OCEL 2.0 exports: **could move.** These are renderings of held rows in corpus-export; no measurement applies.
- 4 events in shared packs (B22): the pack mechanism is a dependency (stage 4 sharing, not built). **Could move only if entries-A builds sharing in T33.**

**PEOPLE**
- 2b the remaining line kinds: **could move**, and should, inside B1a.5 (P8).
- 2b `credentialsOf`, `interestsOf`, `statementsOf`: **could move** (people job).
- 2b Form 700 interests: rows entered by a member from cited extents **could move**. M-P3 (filer counts and portals) is **desk research before T33**. An automated Form 700 reader is **P6** (docprofile, 4,969 lines) until its split.
- 2b contributions and gifts as money facts with a person as party: **already in 1b.** The kinds exist; parties are any entity.
- 2b member ties `MTI-` (C7) and the pre-flight attestation: **could move** (people and case-disclosures jobs are in T33; the export and sight classes come from B0.12).
- 2b the protected source↔person link: **could move** (sources built).
- 2b interest checks `CHK-`, run by the machine (C8, K1491), as a scheduler consumer with a result table and "Noticed" items:
  - The build **could move**; scheduler is built and queue-producers would take an entry.
  - Showing them is gated by the false-alarm rate, which **needs T33-built code** and a gold set (desk); the real-group rate is re-measured later.
- 2b expunge with a tombstone, and the lawful-demand class (C10): **could move**. B0.12 adds the expunge class; the demand kinds are jurisdictions profile data.
- 2b person duties (filer, registrant): a dependency, **duties**. Could move if duties is in T33.
- 2b the roster and org-chart reader, and `staffingAt` through `registerRosterSource`: **P6** (docprofile over size). **Could move if the docprofile split is in T33.** Nothing blocks the split, an L1 job. The same holds for C2 row 12 (the staff-directory name read as a grade-C person reference).
- 3 overlaps and `pathBetween` presets with set sizes and hubs:
  - The ladders require "L2 and L3 in use", which is a measurement needing **a real group**.
  - Technically they are kind-set presets over explore, and M-P4's initial hub thresholds can be set by desk research. **Could move if BOB reads "in use" as advisory.**
- 3 revolving-door patterns: as overlaps, **a real group**. The build could move behind the K1473 signal gate.
- 3 `strength`'s independence failing on a shared person (INT C-18): **could move.** It is ruled at BOB's level (K1470) and strength has room.
- 3 EXTRACT proposals of people, roles and lines; person questions in `answers`: **a deployed copy** plus gold-set measurement.
- 4 register imports (CAL-ACCESS, NetFile, OpenFEC with its key off by default, DCA, OpenCorporates, Wikidata P39, OpenSanctions): **a deployed copy** for live acquisition (N540's pattern), and L1–L4 in use (**a real group**).
- 4 watching a person's register by a named query (C2 row 11, monitoring R15): depends on the register imports (stage 4). The R15 rewording alone **could move**.
- 4 Popolo and FtM exports: **could move** (renderings).
- 4 people facts in shared packs (B22): the dependency is sharing (as for events).
- 4 C9 conduct: paid people-search results as cited sources at a lower grade, by a member's act on their own account. The dependency is B15's member-keyed outside-source path. Could move if entries-A builds that path in T33.

**MONEY**
- 2b `MSR-` trails and attribution sets; `reconcile`; `committedAgainstPaid`; change orders linked by `amends`: **could move** (money job). `amends` needs events relations, which could move. Measurement M-M3, the identifiers joining awards and contracts to payments in Oakland, is **desk research before T33**.
- 2b `authorityChain`: **could move** with events relations.
- 2b restrictions, thresholds, transfer authority and `pay` duties citing money facts: a dependency, **duties**. Could move if duties is in T33.
- 2b amount checks in money, and checks over tables as recipes in calculations: the build **could move**. Showing them is gated by the false-alarm rate (**needs T33-built code**).
- 2b contradiction's "two amounts for one transfer" key: **could move.**
- 2b flow walks as explore presets: **could move** with B2b.1.
- 3 budget and financial-report readers: a dependency, **sheet-worker** (could move only if entries-A builds it in T33). The readers also face **P6** (docprofile) unless placed in a new reader module. The PDF path needs M-55 re-measured (desk, on the corpus).
- 3 `buys`, unit cost, budget against actuals across years, and rankings (K1471) as calculations: **could move.** `buys` is already in the 1b model; calculations is in T33.
- 3 detectors (C8): the build **could move**, and display waits on the gate (needs T33-built code).
- 3 EXTRACT of money facts, column roles and trail inclusions: **a deployed copy** plus measurement on 10 budget books and 5 ACFRs.
- 4 captured checkbooks, payroll, registers, and Forms 460, 700 and 803 as partitioned tables; OpenFEC and USAspending; watched sources: **a deployed copy** (live acquisition), **sheet-worker** (a dependency), and L1–L4 in use (**a real group**).
- 4 FtM, OCDS and Fiscal Data Package exports: **could move.**
- 4 money trails in shared packs (B22): the dependency is sharing.

**CONNECTIONS**
- B2b.1 · explore · L5 (after people) · new · 2b → **could move into T33** (see (b)).
  - The read `explore({from, to?, kinds?, at, depth})` over the owner registry: bounds, weakest hop, as-of, truncated/undetermined, hubs, and the absence level from observation-log.
  - It writes nothing and logs no one's exploring (D68).
  - Presets as kind sets.
  - The member's timeline with payees and project or inquiry scopes is composed here over a set the caller passes (R-3 I-6).
  - est 20–30 · uses: connection-grammar, observation-log, and every owner (new) · depends: B1a.1, B1a.2, B1a.3, B1a.5–B1a.8, B1b.1, B1b.2 · measure-first: M-X1a synthetic (needs T33-built code, in the job); M-X1b real data (a deployed copy plus a real group, after the job).
- 2b `registerConnectionOwner` for contradiction (L6): **could move** (contradiction job, 3,256 lines).
- 3 overlaps: see PEOPLE.

**What moving them would change.** Moving every "could move" item puts events L1–L3, money L1–L3, people L1–L3 except the docprofile-bound reader, and explore into T33. Stage 2a/2b for these constructs then shrinks to:
- duties-dependent items, if duties is not in T33;
- the docprofile split, if it is not in T33;
- sheet-worker;
- deployment- and real-group-gated items.

## (e) Measurements, stages 0 to 2b

| id (proposed) | what | class |
|---|---|---|
| M-M0a | Oakland's OpenGov export format and basis statement | desk research before T33 opens |
| M-M0b | whether any vendor-payment ledger is published | desk research before T33 opens |
| M-M0c | ACFR years with a text layer | desk research before T33 opens |
| M-V1 | reader date accuracy on three bodies (today's readers over the captured corpus) | desk research before T33 opens |
| M-V2 | Legistar coverage by body over three years, and the share of zone-less `EventDate` rows (keyless API) | desk research before T33 opens |
| M-V3 | a 50-event gold set | desk research before T33 opens |
| M-P1 | distinct people and turnover in ten payroll years (public payroll) | desk research before T33 opens |
| M-P2 | Legistar `Persons`/`OfficeRecords` coverage (seats) | desk research before T33 opens |
| M-P7 | the share of person resolutions at A, B, C and D | desk research before T33 opens, on the study corpus with the built resolver; re-measured by a real group |
| M-P8 | person entities a group creates in a month | needs a real group; gates nothing, since B0.1 removes the ceiling |
| M-P5 | person-page read time at 50,000 lines | needs T33-built code (a synthetic test in the people job) |
| M-P6 | the false-merge rate of same-person proposals, gate set first (D167) | needs T33-built code (in the job); BOB sets the gate value before drafting |
| M-M1 | figure-parser exactness on 200 ACFR and budget figures | the fixture by desk research before T33; the run needs T33-built code (money job) |
| M-M2 | the money-table census | desk research before T33 opens |
| M-V4 | the cost of writing dated facts at promotion (D177) | needs T33-built code; gates only a later move into the promote transaction |
| M-X1a | Bob's chain shape at real volumes on one thread (time, nodes, 30 s CPU, 100 parameters) | needs T33-built code (a synthetic test in the explore job) |
| M-X1b | Bob's chain on real data | needs a deployed copy with a real group's populated data; tunes the budget constant only |
| M-P4 | hub set sizes (the distribution of shared-entity set sizes) | desk research before T33 opens for the initial thresholds (payroll, boards, funds); re-measured by a real group |
| M-P3 | Form 700 filer counts and the local filing officers' portals | desk research before T33 opens |
| M-M3 | identifiers joining awards and contracts to payments in Oakland (project numbers, vendor ids) | desk research before T33 opens |
| M-C8 | false-alarm rate per interest check and money detector (K1491, K1473) | needs T33-built code plus a desk-built gold set; re-measured by a real group; gates display, not the build |
| M-V5 | re-evaluation fan-out of a Legistar re-import (TAD §10.7) | needs T33-built code (synthetic); BOB answers TAD §12's depth question before drafting (design, not a measurement) |
